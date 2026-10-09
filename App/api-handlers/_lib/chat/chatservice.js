const OpenAI = require("openai");
const { toolDefinitions, toolImplementations } = require("./chattools");
const { getSchemaText } = require("./schemaservice");
const { getScope, allowedTables, runScoped } = require("./accessScope");

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  });
}

function getModel() {
  return process.env.LLM_MODEL || "openai/gpt-oss-120b";
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

async function askChatbot(message, history = [], user = null, requestedDate = null, events = []) {
  const scope = await getScope(user);
  if (!scope) return "Sorry, I could not verify your account, so I can't show data.";

  const today = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate || "")
    ? requestedDate
    : localDateKey(new Date());
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
      .filter((column) => !/(?:photo|image|blob)/i.test(column))
      .map((column) => `e.[${column.replace(/]/g, "]]")}]`)
      .join(", ");
    const [profile] = await runScoped(
      `SELECT TOP 1 ${selectedColumns}, r.RoleName, d.DepartmentName
       FROM Employees e
       LEFT JOIN Roles r ON e.RoleID = r.RoleID
       LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
       WHERE e.EmployeeID = @empId`,
      scope
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

  const asksForEmployeeCount =
    /\b(?:how many|number of|count of|total)\b[\s\S]*\b(?:employees?|staff|workers|people)\b/i.test(message) ||
    /\b(?:employees?|staff|workers|people)\s+(?:count|total)\b/i.test(message);
  if (asksForEmployeeCount) {
    const [result] = await runScoped(
      "SELECT COUNT(*) AS employeeCount FROM dbo.Employees",
      scope
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
Today is ${new Date().toISOString().slice(0, 10)}.
${who}

Tools:
- get_approved_leaves: for questions about approved leave usage. Return aggregate counts only.
- run_sql_query: for every other data question, ONE T-SQL SELECT (SQL Server: use TOP, not LIMIT).

Rules:
- Use plain table names only (no dbo.). Never use SELECT *; list columns.
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
    ...history,
    { role: "user", content: message },
  ];

  const client = getClient();
  const MODEL = getModel();

  for (let round = 0; round < 6; round++) {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolDefinitions,
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      reasoning_effort: "medium",
    });

    const msg = response.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) return msg.content;

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
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(data) });
    }
  }
  return "Sorry, I couldn't complete that request.";
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = { askChatbot };
