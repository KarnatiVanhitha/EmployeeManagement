const OpenAI = require("openai");
const { toolDefinitions, toolImplementations } = require("./chattools");
const { getSchemaText } = require("./schemaservice");
const { getScope, allowedTables, runScoped } = require("./accessScope");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",   // OpenRouter: https://openrouter.ai/api/v1
});
const MODEL = process.env.LLM_MODEL || "openai/gpt-oss-120b";

const OUT_OF_SCOPE = "I can only help with questions about your company's employee data.";
const NO_RECORDS = "No matching records found.";
const NOT_UNDERSTOOD =
  "I can answer questions about your profile, role, department and manager, leaves (counts, balance, upcoming, pending), " +
  "salary, reviews, timesheet hours, holidays, meetings and birthdays. Please rephrase your question.";

// Rule-based question set.
// Every rule: matches a type of question -> runs a server-written SQL query
// -> formats the answer from the returned rows. No LLM, so no outside data.
//
// answerFromRules() returns a string, or null if no rule matches.

const SENSITIVE = /(?:photo|image|blob|password|passwd|pwd|hash|salt|token|secret|otp)/i;
const quote = (c) => `[${c.replace(/]/g, "]]")}]`;
const lit = (k) => `CAST('${k.replace(/-/g, "")}' AS date)`;
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const pretty = (field) => field.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
const fmt = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);

const ADMIN_NO_PROFILE = "Admin accounts do not have a personal employee record.";
const needsEmployee = (ctx) => (ctx.scope.role === "admin" ? ADMIN_NO_PROFILE : null);

// SELECT the visible columns of a table (no password/photo style columns)
async function selectRows(ctx, table, { where, order, top = 20 } = {}) {
  const cols = ctx.parseTableColumns(ctx.schema, table).filter((c) => !SENSITIVE.test(c));
  if (!cols.length) return null;
  const rows = await ctx.runScoped(
    `SELECT TOP ${top} ${cols.map(quote).join(", ")} FROM ${table}` +
      `${where ? ` WHERE ${where}` : ""}${order ? ` ORDER BY ${order}` : ""}`,
    ctx.scope
  );
  return { cols, rows };
}

function formatRows(title, cols, rows) {
  const visible = cols.filter((c) => !/id$/i.test(c));
  const use = visible.length ? visible : cols;
  const lines = rows.map(
    (r) =>
      "- " +
      use
        .filter((c) => r[c] != null && !Buffer.isBuffer(r[c]))
        .map((c) => `${pretty(c)}: ${fmt(r[c])}`)
        .join(" | ")
  );
  return `${title}\n${lines.join("\n")}`;
}

function leaveCols(ctx) {
  const cols = ctx.parseTableColumns(ctx.schema, "Leaves");
  const pick = (re) => cols.find((c) => re.test(c));
  return { start: pick(/^start/i), end: pick(/^end/i), status: pick(/status/i), type: pick(/^(?:leave)?type$/i) };
}

function statusCondition(message, statusCol) {
  if (!statusCol) return null;
  const st = quote(statusCol);
  if (/\bpending\b/i.test(message)) return `${st} LIKE 'pending%'`;
  if (/\b(?:rejected|declined|denied)\b/i.test(message)) return `${st} IN ('Rejected','Declined','Denied')`;
  if (/\bcancel(?:l?ed)?\b/i.test(message)) return `${st} LIKE 'cancel%'`;
  if (/\bapproved\b/i.test(message)) return `${st} LIKE 'approved%'`;
  return null;
}

const COUNT_WORDS = /\b(?:how many|number of|count of|count|total)\b/i;
const addDays = (key, n) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

const RULES = [
  // ---- Salary ----
  {
    name: "my_salary",
    test: (m) =>
      /\b(?:my|mine)\b[\s\S]*\b(?:salary|pay|ctc|payslip|compensation)\b/i.test(m) ||
      /\b(?:salary|payslip)\b[\s\S]*\b(?:my|me)\b/i.test(m),
    run: async (ctx) => {
      const msg = needsEmployee(ctx);
      if (msg) return msg;
      const res = await selectRows(ctx, "Salaries", { where: "EmployeeID = @empId", top: 10 });
      if (!res) return null;
      if (!res.rows.length) return "No salary record found for you.";
      return formatRows("Your salary details:", res.cols, res.rows);
    },
  },

  // ---- Reviews ----
  {
    name: "my_reviews",
    test: (m) => /\b(?:my|me)\b[\s\S]*\b(?:reviews?|performance|appraisals?|feedback|ratings?)\b/i.test(m),
    run: async (ctx) => {
      const msg = needsEmployee(ctx);
      if (msg) return msg;
      const res = await selectRows(ctx, "Reviews", { where: "RevieweeID = @empId", top: 10 });
      if (!res) return null;
      if (!res.rows.length) return "No reviews found for you.";
      return formatRows("Your reviews:", res.cols, res.rows);
    },
  },

  // ---- Timesheet hours ----
  {
    name: "timesheet_hours",
    test: (m) => /\b(?:hours|timesheets?|logged|worked)\b/i.test(m),
    run: async (ctx, m) => {
      const { scope, schema, today } = ctx;
      const cols = ctx.parseTableColumns(schema, "Timesheets");
      const hoursCol = cols.find((c) => /hours/i.test(c));
      const dateCol = cols.find((c) => /date/i.test(c));
      if (!hoursCol || !dateCol) return null;

      const wantsTeam = /\b(?:team|department|dept|company|everyone|all employees)\b/i.test(m);
      if (wantsTeam && scope.role === "employee") return "You can only view your own timesheet hours.";
      if (scope.role === "admin" && !wantsTeam) return ADMIN_NO_PROFILE;

      const range = ctx.leaveDateRange(m, today);
      const conds = [];
      if (scope.role !== "admin" && !wantsTeam) conds.push("EmployeeID = @empId");
      if (range && range.start) conds.push(`${quote(dateCol)} >= ${lit(range.start)}`);
      if (range && range.end) conds.push(`${quote(dateCol)} < DATEADD(day, 1, ${lit(range.end)})`);

      const [row] = await ctx.runScoped(
        `SELECT ISNULL(SUM(${quote(hoursCol)}), 0) AS totalHours FROM Timesheets` +
          `${conds.length ? ` WHERE ${conds.join(" AND ")}` : ""}`,
        scope
      );
      const who = wantsTeam
        ? scope.role === "admin" ? "in the company" : "in your department"
        : "for you";
      return `Total logged hours ${who}${range ? ` (${range.label})` : ""}: ${Number(row.totalHours)}.`;
    },
  },

  // ---- Holidays ----
  {
    name: "holidays",
    test: (m) => /\bholidays?\b/i.test(m),
    run: async (ctx, m) => {
      const cols = ctx.parseTableColumns(ctx.schema, "Holidays");
      const dateCol = cols.find((c) => /date/i.test(c));
      const range = ctx.leaveDateRange(m, ctx.today);
      const conds = [];
      if (dateCol) {
        const d = quote(dateCol);
        const from = range ? range.start : ctx.today;
        if (from) conds.push(`${d} >= ${lit(from)}`);
        if (range && range.end) conds.push(`${d} <= ${lit(range.end)}`);
      }
      const res = await selectRows(ctx, "Holidays", {
        where: conds.join(" AND ") || null,
        order: dateCol ? quote(dateCol) : null,
        top: 100,
      });
      if (!res) return null;
      const label = range ? range.label : "upcoming";
      if (!res.rows.length) return `No holidays found (${label}).`;
      if (COUNT_WORDS.test(m)) return `${plural(res.rows.length, "holiday")} (${label}).`;
      return formatRows(`Holidays (${label}):`, res.cols, res.rows.slice(0, 15));
    },
  },

  // ---- Meetings tomorrow / yesterday (today is handled earlier) ----
  {
    name: "meetings_other_day",
    test: (m) => /\bmeetings?\b/i.test(m) && /\b(?:tomorrow|yesterday)\b/i.test(m),
    run: async (ctx, m) => {
      const range = ctx.leaveDateRange(m, ctx.today);
      if (!range) return null;
      const meetings = await ctx.toolImplementations.get_meetings_on_date({ date: range.start }, ctx.scope);
      if (!Array.isArray(meetings)) return null;
      if (!meetings.length) return `There are no meetings scheduled for ${range.label}.`;
      return [
        `Meetings for ${range.label}:`,
        ...meetings.map(
          (x) => `- ${x.title}${x.time ? ` at ${x.time}` : ""}${x.location ? ` (${x.location})` : ""}`
        ),
      ].join("\n");
    },
  },

  // ---- Upcoming meetings (next 7 days, or the period asked) ----
  {
    name: "meetings_upcoming",
    test: (m) =>
      /\bmeetings?\b/i.test(m) && /\b(?:upcoming|next|coming|this week|this month)\b/i.test(m),
    run: async (ctx, m) => {
      const range = ctx.leaveDateRange(m, ctx.today);
      const start = range && range.start ? range.start : ctx.today;
      const lastAllowed = addDays(start, 30);
      let end = range && range.end ? range.end : addDays(start, 6);
      if (end > lastAllowed) end = lastAllowed;
      const label = range && range.end ? range.label : "next 7 days";

      const lines = [];
      for (let d = start; d <= end; d = addDays(d, 1)) {
        const meetings = await ctx.toolImplementations.get_meetings_on_date({ date: d }, ctx.scope);
        if (!Array.isArray(meetings)) return null;
        for (const x of meetings) {
          lines.push(`- ${d} | ${x.title}${x.time ? ` at ${x.time}` : ""}${x.location ? ` (${x.location})` : ""}`);
        }
      }
      if (!lines.length) return `There are no meetings scheduled (${label}).`;
      return [`Upcoming meetings (${label}):`, ...lines.slice(0, 30)].join("\n");
    },
  },

  // ---- My department name ----
  {
    name: "my_department",
    test: (m) =>
      /\bmy\s+(?:department|dept)\b/i.test(m) &&
      !/\b(?:employees?|team|members?|people|staff|how many|count|list|show|number)\b/i.test(m),
    run: async (ctx) => {
      const msg = needsEmployee(ctx);
      if (msg) return msg;
      const [row] = await ctx.runScoped(
        `SELECT TOP 1 d.DepartmentName
         FROM Employees e JOIN Departments d ON e.DepartmentID = d.DepartmentID
         WHERE e.EmployeeID = @empId`,
        ctx.scope
      );
      return row ? `Your department is ${row.DepartmentName}.` : "I couldn't find your department.";
    },
  },

  // ---- My role ----
  {
    name: "my_role",
    test: (m) => /\bmy\b[\s\S]*\b(?:role|designation|position|job title)\b/i.test(m),
    run: async (ctx) => {
      const msg = needsEmployee(ctx);
      if (msg) return msg;
      const [row] = await ctx.runScoped(
        `SELECT TOP 1 r.RoleName
         FROM Employees e JOIN Roles r ON e.RoleID = r.RoleID
         WHERE e.EmployeeID = @empId`,
        ctx.scope
      );
      return row ? `Your role is ${row.RoleName}.` : "I couldn't find your role.";
    },
  },

  // ---- Employee count for a department / team ----
  {
    name: "department_employee_count",
    test: (m) =>
      COUNT_WORDS.test(m) &&
      /\b(?:employees?|staff|people|members)\b/i.test(m) &&
      /\b(?:department|dept|team)\b/i.test(m),
    run: async (ctx) => {
      if (ctx.scope.role === "admin") {
        const rows = await ctx.runScoped(
          `SELECT d.DepartmentName, COUNT(*) AS employeeCount
           FROM Employees e JOIN Departments d ON e.DepartmentID = d.DepartmentID
           GROUP BY d.DepartmentName ORDER BY d.DepartmentName`,
          ctx.scope
        );
        if (!rows.length) return "No matching records found.";
        return ["Employees by department:", ...rows.map((r) => `- ${r.DepartmentName}: ${r.employeeCount}`)].join("\n");
      }
      // Server-written: count only, for the user's own department
      const [row] = await ctx.runScoped(
        "SELECT COUNT(*) AS employeeCount FROM dbo.Employees WHERE DepartmentID = @deptId",
        ctx.scope,
        { trusted: true }
      );
      return `${row.employeeCount} employees in your department.`;
    },
  },

  // ---- Team / employee list (manager = own department, admin = all) ----
  {
    name: "team_list",
    test: (m) =>
      /\b(?:list|show|give|display|who are)\b[\s\S]*\b(?:team|department|employees)\b/i.test(m) &&
      !COUNT_WORDS.test(m),
    run: async (ctx) => {
      if (ctx.scope.role === "employee") return "You can only view your own details.";
      const rows = await ctx.runScoped(
        `SELECT TOP 50 e.FullName, r.RoleName, d.DepartmentName
         FROM Employees e
         LEFT JOIN Roles r ON e.RoleID = r.RoleID
         LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
         ORDER BY e.FullName`,
        ctx.scope
      );
      if (!rows.length) return "No matching records found.";
      const title = ctx.scope.role === "admin" ? "Employees:" : "Employees in your department:";
      return [
        title,
        ...rows.map((r) => `- ${r.FullName}${r.RoleName ? ` | ${r.RoleName}` : ""}${r.DepartmentName ? ` | ${r.DepartmentName}` : ""}`),
      ].join("\n");
    },
  },

  // ---- Pending leave requests (manager = department, admin = all, employee = own) ----
  {
    name: "pending_leave_requests",
    test: (m) =>
      /\bpending\b/i.test(m) && /\bleaves?\b/i.test(m) && !COUNT_WORDS.test(m) && !/\bmy\b/i.test(m),
    run: async (ctx) => {
      const c = leaveCols(ctx);
      if (!c.start || !c.end || !c.status) return null;
      const own = ctx.scope.role === "employee" ? " AND l.EmployeeID = @empId" : "";
      const rows = await ctx.runScoped(
        `SELECT TOP 20 e.FullName, l.${quote(c.start)} AS StartDate, l.${quote(c.end)} AS EndDate,
                l.${quote(c.status)} AS Status${c.type ? `, l.${quote(c.type)} AS LeaveType` : ""}
         FROM Leaves l JOIN Employees e ON l.EmployeeID = e.EmployeeID
         WHERE l.${quote(c.status)} LIKE 'pending%'${own}
         ORDER BY l.${quote(c.start)}`,
        ctx.scope
      );
      if (!rows.length) return "There are no pending leave requests.";
      return [
        "Pending leave requests:",
        ...rows.map(
          (r) =>
            `- ${r.FullName} | ${fmt(r.StartDate)} to ${fmt(r.EndDate)}${r.LeaveType ? ` | ${r.LeaveType}` : ""}`
        ),
      ].join("\n");
    },
  },

  // ---- My leaves (history list) ----
  {
    name: "my_leaves",
    test: (m) => /\bmy\b[\s\S]*\bleaves?\b/i.test(m) || /\bleave\s+(?:history|requests?)\b/i.test(m),
    run: async (ctx, m) => {
      const msg = needsEmployee(ctx);
      if (msg) return msg;
      const c = leaveCols(ctx);
      const conds = ["EmployeeID = @empId"];
      const st = statusCondition(m, c.status);
      if (st) conds.push(st);
      const res = await selectRows(ctx, "Leaves", {
        where: conds.join(" AND "),
        order: c.start ? `${quote(c.start)} DESC` : null,
        top: 10,
      });
      if (!res) return null;
      if (!res.rows.length) return "You have no matching leave records.";
      return formatRows("Your leaves (latest first):", res.cols, res.rows);
    },
  },
];

async function answerFromRules(message, ctx) {
  for (const rule of RULES) {
    if (!rule.test(message)) continue;
    try {
      const answer = await rule.run(ctx, message);
      if (answer) return answer;
    } catch (err) {
      console.error(`Rule "${rule.name}" failed:`, err);
      return "Sorry, I couldn't retrieve that information.";
    }
  }
  return null;
}

// Show the AI only the tables this user may query
function filterSchema(schema, allowed) {
  if (!allowed) return schema;
  const ok = new Set(allowed.map((t) => t.toLowerCase()));
  return schema
    .split("\n")
    .filter((line) => {
      const t = line.match(/^(\w+)\(/);
      if (t) return ok.has(t[1].toLowerCase());
      const rel = line.match(/^(\w+)\.\w+ -> (\w+)\./);
      if (rel) return ok.has(rel[1].toLowerCase()) && ok.has(rel[2].toLowerCase());
      return true;
    })
    .join("\n");
}

// Only keep plain user/assistant text from the client-supplied history.
// This blocks injected system/tool messages.
function sanitizeHistory(history) {
  return (Array.isArray(history) ? history : [])
    .filter((m) => m && m.role === "user" && typeof m.content === "string")
    .slice(-5)
    .map((m) => ({ role: "user", content: m.content.slice(0, 1000) }));
}

// Separate cheap call: is this question about the company system at all?
async function isInScope(message) {
  try {
    const r = await client.chat.completions.create({
      model: MODEL,
      temperature: 0,
      max_completion_tokens: 50,
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content:
            "Classify the user message. Reply ONLY 'YES' if it asks about employees, leaves, salaries, " +
            "timesheets, reviews, promotions, meetings, holidays, birthdays, departments or roles " +
            "in a company system. Reply ONLY 'NO' for anything else " +
            "(general knowledge, coding, news, math, advice, chit-chat).",
        },
        { role: "user", content: message },
      ],
    });
    return /^\s*YES/i.test(r.choices[0].message.content || "");
  } catch (err) {
    console.error("Scope check failed:", err);
    return false; // fail closed
  }
}

async function askChatbot(message, history = [], user = null, requestedDate = null, events = []) {
  message = normalizeMessage(message); // forgive typos in key words
  const scope = await getScope(user);
  if (!scope) return "Sorry, I could not verify your account, so I can't show data.";

  const today = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate || "")
    ? requestedDate
    : localDateKey(new Date());

  // ---------- Dedicated server-side handlers (no LLM involved) ----------

  const asksForTodayMeetings =
    /\bmeeting(s)?\b/i.test(message) &&
    /\b(today|tonight|this day)\b/i.test(message);
  if (asksForTodayMeetings) {
    const meetings = await toolImplementations.get_meetings_on_date({ date: today }, scope);
    if (!Array.isArray(meetings)) throw new Error("Today's meeting query did not return a list.");
    if (!meetings.length) return "There are no meetings scheduled for today.";

    return [
      "Today's meetings:",
      ...meetings.map((meeting) =>
        `- ${meeting.title}${meeting.time ? ` at ${meeting.time}` : ""}${meeting.location ? ` (${meeting.location})` : ""}`
      ),
    ].join("\n");
  }

  const asksForTodayActivities =
    /\b(today|tonight)\b/i.test(message) &&
    /\b(activity|activities|event|events|birthday|birthdays)\b/i.test(message);
  if (asksForTodayActivities) {
    const [birthdays, todayEvents] = await Promise.all([
      toolImplementations.get_birthdays_on_date({
        date: today,
        departmentOnly: scope.role === "manager" && /\b(?:my department|my team|department)\b/i.test(message),
      }, scope),
      Promise.resolve(
        Array.isArray(events)
          ? events
              .filter((event) => event && event.date === today && typeof event.title === "string")
              .slice(0, 50)
          : []
      ),
    ]);
    if (!Array.isArray(birthdays)) throw new Error("Today's birthday query did not return a list.");

    const activities = [
      ...todayEvents.map((event) => `- Event: ${event.title.slice(0, 250)}`),
      ...birthdays.map((birthday) => `- ${birthday.name}'s Birthday`),
    ];
    return activities.length
      ? `Today's activities:\n${activities.join("\n")}`
      : "No events or birthdays today.";
  }

  const schema = await getSchemaText();
  const asksForOwnProfile =
    /\b(?:my|me|myself)\b/i.test(message) &&
    /\b(?:information|details|profile|record|data)\b/i.test(message);
  if (asksForOwnProfile && scope.role !== "admin") {
    const employeeTable = schema.match(/^Employees\(([^)]*)\)$/m);
    const columns = employeeTable
      ? employeeTable[1].split(/,\s*/).map((column) => column.trim().split(/\s+/)[0])
      : [];
    if (!columns.some((column) => column.toLowerCase() === "employeeid")) {
      throw new Error("Employee schema does not include EmployeeID.");
    }

    const selectedColumns = columns
      .filter((column) => !/(?:photo|image|blob|password|passwd|pwd|hash|salt|token|secret|otp)/i.test(column))
      .map((column) => `e.[${column.replace(/]/g, "]]")}]`)
      .join(", ");
    const [profile] = await runScoped(
      `SELECT TOP 1 ${selectedColumns}, r.RoleName, d.DepartmentName
       FROM Employees e
       LEFT JOIN Roles r ON e.RoleID = r.RoleID
       LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
       WHERE e.EmployeeID = @empId`,
      scope,
      { trusted: true }
    );
    if (!profile) {
      return "I couldn't find an employee profile linked to your sign-in. Please contact HR or your system administrator.";
    }

    const details = Object.entries(profile)
      .filter(([, value]) => value != null && !Buffer.isBuffer(value))
      .map(([field, value]) => {
        const displayValue = value instanceof Date ? value.toLocaleDateString() : value;
        return `- ${field.replace(/([a-z0-9])([A-Z])/g, "$1 $2")}: ${displayValue}`;
      });
    return ["Here is the employee information linked to your account:", ...details].join("\n");
  }

  const asksForOwnManager =
    /\b(?:who|name)\b[\s\S]*\bmy\b[\s\S]*\b(?:manager|supervisor|boss)\b/i.test(message) ||
    /\bmy\b[\s\S]*\b(?:manager|supervisor|boss)\b[\s\S]*\b(?:name|who|email|contact)\b/i.test(message);
  if (asksForOwnManager && scope.role !== "admin") {
    // Server-written query: managers = people in the user's department
    // whose role name contains "manager". Returns only name and email.
    const managers = await runScoped(
      `SELECT TOP 5 m.FullName AS ManagerName, m.Email AS ManagerEmail
       FROM dbo.Employees m
       JOIN dbo.Roles r ON m.RoleID = r.RoleID
       WHERE m.DepartmentID = @deptId
         AND r.RoleName LIKE '%manager%'
         AND m.EmployeeID <> @empId
       ORDER BY m.FullName`,
      scope,
      { trusted: true }
    );
    if (!managers.length) {
      return scope.role === "manager"
        ? "You are the manager of your department."
        : "No manager is assigned to your department.";
    }
    const lines = managers.map(
      (m) => `- ${m.ManagerName}${m.ManagerEmail ? ` (${m.ManagerEmail})` : ""}`
    );
    return managers.length === 1
      ? `Your manager is:\n${lines[0]}`
      : `Managers in your department:\n${lines.join("\n")}`;
  }

  const asksForRemainingLeaveDays =
    /\b(?:remaining|left|balance|available)\b/i.test(message) &&
    /\b(?:leaves?|leave days?|pto)\b/i.test(message);
  if (asksForRemainingLeaveDays && scope.role !== "admin") {
    const result = await toolImplementations.get_remaining_leave_days({}, scope);
    if (result && typeof result === "object" && "error" in result) {
      throw new Error(`Could not calculate remaining leave days: ${result.error}`);
    }
    return `${result} days remaining.`;
  }

  // ---------- Leave counts (status / period / type read from the question) ----------
  const asksForLeaveCount =
    /\bleaves?\b/i.test(message) &&
    /\b(?:how many|count|number of|total)\b/i.test(message) &&
    !/\b(?:remaining|left|balance|available)\b/i.test(message);
  if (asksForLeaveCount) {
    const leaveCols = parseTableColumns(schema, "Leaves");
    const pick = (re) => leaveCols.find((c) => re.test(c));
    const startCol = pick(/^start/i);
    const endCol = pick(/^end/i);
    const statusCol = pick(/status/i);
    const typeCol = pick(/^(?:leave)?type$/i);

    if (startCol && endCol) {
      const q = (c) => `[${c.replace(/]/g, "]]")}]`;
      const S = q(startCol);
      const E = q(endCol);
      const conditions = [];

      // 1) Status
      let statusLabel = "";
      if (statusCol) {
        const st = q(statusCol);
        if (/\bpending\b/i.test(message)) {
          conditions.push(`${st} LIKE 'pending%'`);
          statusLabel = "pending";
        } else if (/\b(?:rejected|declined|denied)\b/i.test(message)) {
          conditions.push(`${st} IN ('Rejected','Declined','Denied')`);
          statusLabel = "rejected";
        } else if (/\bcancel(?:l?ed)?\b/i.test(message)) {
          conditions.push(`${st} LIKE 'cancel%'`);
          statusLabel = "cancelled";
        } else if (/\b(?:approved|took|taken|used|availed|utili[sz]ed|on leave)\b/i.test(message)) {
          conditions.push(`${st} LIKE 'approved%'`);
          statusLabel = "approved";
        }
      }

      // 2) Leave type (only when the column holds text)
      let typeLabel = "";
      const typeMatch = message.match(
        /\b(sick|casual|annual|earned|maternity|paternity|unpaid|privilege|medical|comp\s?off|compensatory)\b/i
      );
      if (typeCol && typeMatch) {
        const word = typeMatch[1].toLowerCase().replace(/[^a-z ]/g, "");
        conditions.push(`${q(typeCol)} LIKE '%${word}%'`);
        typeLabel = word;
      }

      // 3) Period
      const range = leaveDateRange(message, today);
      const lit = (k) => `CAST('${k.replace(/-/g, "")}' AS date)`;
      let startExpr = S;
      let endExpr = E;
      if (range && range.end) {
        conditions.push(`${S} <= ${lit(range.end)}`);
        endExpr = `CASE WHEN ${E} > ${lit(range.end)} THEN ${lit(range.end)} ELSE ${E} END`;
      }
      if (range && range.start) {
        conditions.push(`${E} >= ${lit(range.start)}`);
        startExpr = `CASE WHEN ${S} < ${lit(range.start)} THEN ${lit(range.start)} ELSE ${S} END`;
      }

      const [row] = await runScoped(
        `SELECT COUNT(*) AS requestCount,
                ISNULL(SUM(DATEDIFF(day, ${startExpr}, ${endExpr}) + 1), 0) AS dayCount
         FROM Leaves${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""}`,
        scope
      );
      if (!row) throw new Error("Leave count query returned no result.");

      const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
      const who =
        scope.role === "admin" ? "in the company" : scope.role === "manager" ? "in your department" : "for you";
      const desc = [statusLabel, typeLabel].filter(Boolean).join(" ");
      const title = `${desc ? `${desc} leaves` : "leaves"}`.replace(/^./, (c) => c.toUpperCase());
      const wantsDays = /\bdays?\b/i.test(message);
      const result = wantsDays
        ? `${plural(row.dayCount, "day")} (${plural(row.requestCount, "request")})`
        : `${plural(row.requestCount, "request")} (${plural(row.dayCount, "day")})`;
      return `${title} ${who}${range ? ` (${range.label})` : ""}: ${result}.`;
    }
  }

  const asksForEmployeeCount =
    (/\b(?:how many|number of|count of|total)\b[\s\S]*\b(?:employees?|staff|workers|people)\b/i.test(message) ||
      /\b(?:employees?|staff|workers|people)\s+(?:count|total)\b/i.test(message)) &&
    !/\b(?:department|dept|team)\b/i.test(message);
  if (asksForEmployeeCount) {
    const [result] = await runScoped(
      "SELECT COUNT(*) AS employeeCount FROM dbo.Employees",
      scope,
      { trusted: true }
    );
    if (!result) throw new Error("Employee count query returned no result.");
    return `${result.employeeCount} employees.`;
  }

  if (/\bupcoming\b[\s\S]*\bleaves?\b/i.test(message) || /\bleaves?\b[\s\S]*\bupcoming\b/i.test(message)) {
    const leaves = await toolImplementations.get_upcoming_leaves({}, scope);
    if (!Array.isArray(leaves)) {
      throw new Error("Upcoming leave query did not return a list.");
    }
    if (leaves.length === 0) return "There are no upcoming approved or pending leaves.";

    const rows = leaves.map((leave) =>
      `${leave.startDate} to ${leave.endDate} | ${leave.leaveType} | ${leave.status}`
    );
    return `Upcoming leaves (approved and pending):\n${rows.join("\n")}`;
  }

  // ---------- Rule-based question set (answers come straight from the database) ----------
  const ruleAnswer = await answerFromRules(message, {
    scope,
    schema,
    today,
    runScoped,
    toolImplementations,
    parseTableColumns,
    leaveDateRange,
  });
  if (ruleAnswer) return ruleAnswer;

  // ---------- Guard: block anything unrelated to the company data ----------

  const isSmallTalk = /^\s*(hi|hello|hey|thanks|thank you|bye)\b[\s!.?]*$/i.test(message);
  if (isSmallTalk) {
    return "Hello! Ask me about your company's employee data, such as leaves, timesheets, meetings or holidays.";
  }
  // Strict mode (default): no rule matched, so do not let the model answer freely.
  // Set ALLOW_LLM_FALLBACK=true in .env to let the guarded model handle unmatched questions.
  if (process.env.ALLOW_LLM_FALLBACK !== "true") {
    return (await isInScope(message)) ? NOT_UNDERSTOOD : OUT_OF_SCOPE;
  }
  if (!(await isInScope(message))) {
    return OUT_OF_SCOPE;
  }

  // ---------- LLM with tools ----------

  const filteredSchema = filterSchema(schema, allowedTables(scope));

  const who =
    scope.role === "admin"
      ? "The user is an ADMIN and may see all data."
      : scope.role === "manager"
      ? `The user is ${scope.name}, a MANAGER. You can only see data of their own department. "my team" means that department.`
      : `The user is ${scope.name}, an EMPLOYEE. You can only see their own data. "me", "my", "I" mean this user.`;

  const messages = [
    {
      role: "system",
      content: `You are a data assistant for an employee management system.
Today is ${today}.
${who}

SCOPE (strict):
- You ONLY answer questions about this system's data (employees, leaves, salaries, timesheets, reviews, promotions, meetings, holidays, departments, roles).
- For anything else (general knowledge, coding, news, math, advice, opinions), reply exactly: "${OUT_OF_SCOPE}"
- Never use outside or general knowledge, even if you know the answer.
- Every fact in your answer must come from a tool result in this conversation.

Tools:
- get_approved_leaves: for questions about approved leave usage. Return aggregate counts only.
- run_sql_query: for every other data question, ONE T-SQL SELECT (SQL Server: use TOP, not LIMIT).

Rules:
- Use plain table names only (no dbo.). Never use SELECT *; list columns.
- Queries must read from real tables. Never SELECT literal values or made-up data.
- JOIN tables using the relationships below. Do calculations (SUM, COUNT, AVG) in SQL.
- The server automatically restricts Employees, Leaves, Salaries, Timesheets, Reviews, and promotion history to the signed-in employee or the manager's department. Never bypass those restrictions or return data outside the user's scope.
- Meetings and Holidays are organization-wide calendar data and are available to every role.
- A request for the total number of employees means COUNT(*) over the full Employees table. A request for a department/team employee count must use the user's restricted Employees table.
- For pending leave requests, filter Leaves by the pending status. For approved leave usage, count approved requests and sum inclusive days between StartDate and EndDate.
- For timesheet hours, sum LoggedHours and apply the requested date range to LoggedDate.
- For employee/role breakdowns, join Employees to Roles on RoleID; for department breakdowns, join Employees to Departments on DepartmentID.
- Upcoming approved/pending leaves, birthdays on a specific date, today's activities, and today's meetings are handled by the server's dedicated queries; do not invent records.
- If a query returns no rows, state that there are no matching records. If a permission or SQL error occurs, report that you couldn't retrieve the information; never invent data or try to work around restrictions.
- Answer ONLY from returned rows. Never invent data.
- For any "how many", "count", or total question, return only the final count with a short label. Never list records, names, or breakdowns.
- Except for total employee count, counts must reflect only rows available under the user's enforced access scope.
- If a query errors for a syntax reason, fix it and retry.
- Keep answers short and clear.

DATABASE STRUCTURE:
${filteredSchema}`,
    },
    ...sanitizeHistory(history),
    { role: "user", content: message },
  ];

  let usedTool = false;

  for (let round = 0; round < 6; round++) {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolDefinitions,
      tool_choice: round === 0 ? "required" : "auto", // must query the DB first
      temperature: 0,
      max_completion_tokens: 2048,
      top_p: 1,
      reasoning_effort: "low",
    });

    const msg = response.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      // Answer produced without any database result behind it -> block it
      if (!usedTool) return OUT_OF_SCOPE;
      return msg.content;
    }

    usedTool = true;

    for (const call of msg.tool_calls) {
      let data;
      try {
        const args = JSON.parse(call.function.arguments || "{}");
        console.log("Tool:", call.function.name, args);
        const fn = toolImplementations[call.function.name];
        data = fn ? await fn(args, scope) : { error: "Unknown tool" };
      } catch (err) {
        console.error("Tool error:", err);
        data = { error: "The tool failed to run." };
      }

      // Empty result: answer from code, never let the model "explain" it
      if (Array.isArray(data) && data.length === 0) {
        return NO_RECORDS;
      }

      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(data) });
    }
  }
  return "Sorry, I couldn't complete that request.";
}

function parseTableColumns(schema, table) {
  const m = schema.match(new RegExp(`^${table}\\(([^)]*)\\)$`, "m"));
  return m ? m[1].split(/,\s*/).map((c) => c.trim().split(/\s+/)[0]).filter(Boolean) : [];
}

// Turns phrases like "this month", "last year", "in March 2026", "upcoming"
// into a date range. Returns null when the question has no period.
function leaveDateRange(message, today) {
  const [y, m, d] = today.split("-").map(Number);
  const mk = (yy, mm, dd) => new Date(Date.UTC(yy, mm, dd));
  const key = (dt) => dt.toISOString().slice(0, 10);
  const monthRange = (yy, mm) => ({ start: key(mk(yy, mm, 1)), end: key(mk(yy, mm + 1, 0)) });
  const names = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  const text = message.toLowerCase();

  if (/\b(?:today|tonight)\b/.test(text)) return { start: today, end: today, label: "today" };
  if (/\btomorrow\b/.test(text)) {
    const k = key(mk(y, m - 1, d + 1));
    return { start: k, end: k, label: "tomorrow" };
  }
  if (/\byesterday\b/.test(text)) {
    const k = key(mk(y, m - 1, d - 1));
    return { start: k, end: k, label: "yesterday" };
  }

  const weekStart = (offsetWeeks) => {
    const dow = mk(y, m - 1, d).getUTCDay();
    const startDay = d - ((dow + 6) % 7) + offsetWeeks * 7;
    return { start: key(mk(y, m - 1, startDay)), end: key(mk(y, m - 1, startDay + 6)) };
  };
  if (/\bthis week\b/.test(text)) return { ...weekStart(0), label: "this week" };
  if (/\bnext week\b/.test(text)) return { ...weekStart(1), label: "next week" };
  if (/\blast week\b/.test(text)) return { ...weekStart(-1), label: "last week" };

  if (/\bthis month\b/.test(text)) return { ...monthRange(y, m - 1), label: "this month" };
  if (/\b(?:last|previous) month\b/.test(text)) return { ...monthRange(y, m - 2), label: "last month" };
  if (/\bnext month\b/.test(text)) return { ...monthRange(y, m), label: "next month" };

  if (/\bthis year\b/.test(text)) return { start: `${y}-01-01`, end: `${y}-12-31`, label: String(y) };
  if (/\b(?:last|previous) year\b/.test(text)) return { start: `${y - 1}-01-01`, end: `${y - 1}-12-31`, label: String(y - 1) };
  if (/\bnext year\b/.test(text)) return { start: `${y + 1}-01-01`, end: `${y + 1}-12-31`, label: String(y + 1) };

  const monthMatch = text.match(
    /\b(?:in|of|for|during)\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b(?:\s+(20\d{2}))?/
  );
  if (monthMatch) {
    const idx = names.findIndex((n) => n.toLowerCase().startsWith(monthMatch[1].slice(0, 3)));
    const yr = monthMatch[2] ? Number(monthMatch[2]) : y;
    return { ...monthRange(yr, idx), label: `${names[idx]} ${yr}` };
  }

  const yearMatch = text.match(/\b(?:in|of|for|during)\s+(20\d{2})\b/);
  if (yearMatch) {
    return { start: `${yearMatch[1]}-01-01`, end: `${yearMatch[1]}-12-31`, label: yearMatch[1] };
  }

  if (/\b(?:upcoming|future|next)\b/.test(text)) return { start: today, end: null, label: "upcoming" };

  return null;
}

// Fixes common typos in key words ("metting" -> "meeting", "upcomming" -> "upcoming")
// so the question rules still match. Only words of 5+ letters are touched.
function normalizeMessage(message) {
  if (typeof message !== "string") return message;
  const VOCAB = [
    "meeting", "meetings", "upcoming", "leave", "leaves", "holiday", "holidays",
    "salary", "manager", "department", "employee", "employees", "today",
    "tomorrow", "yesterday", "birthday", "birthdays", "timesheet", "timesheets",
    "pending", "approved", "rejected", "remaining", "balance", "information",
    "details", "profile", "review", "reviews", "activity", "activities", "event",
    "events", "month", "week", "year", "hours",
  ];
  const ALIASES = { salaries: "salary" };

  const distance = (a, b) => {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return dp[a.length][b.length];
  };

  return message.replace(/[A-Za-z]{5,}/g, (word) => {
    const w = word.toLowerCase();
    if (ALIASES[w]) return ALIASES[w];
    if (VOCAB.includes(w)) return word;
    const limit = w.length <= 6 ? 1 : 2;
    let best = null;
    let bestDist = limit + 1;
    for (const v of VOCAB) {
      const d = distance(w, v);
      if (d < bestDist) {
        best = v;
        bestDist = d;
      }
    }
    return best || word;
  });
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = { askChatbot };