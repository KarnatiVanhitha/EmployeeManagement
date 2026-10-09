const sql = require("mssql");
const { getHiddenNames, getPool } = require("./schemaservice");
const { runScoped } = require("./accessScope");

const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "run_sql_query",
      description:
        "Run ONE read-only T-SQL SELECT query and return the rows. Use it for any data question. The user's permissions are applied automatically.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "A single T-SQL SELECT statement" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_approved_leaves",
      description:
        "Return only the aggregate count of APPROVED leave requests and total approved leave days. Optional employee name and year.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Employee name (optional)" },
          year: { type: "integer", description: "Optional year, e.g. 2026" },
        },
      },
    },
  },
];

function validateSelect(raw) {
  const q = raw.trim().replace(/;+\s*$/, "");

  if (!/^select\b/i.test(q)) throw new Error("Only SELECT queries are allowed (no WITH).");
  if (/;|--|\/\*/.test(q)) throw new Error("Multiple statements or comments are not allowed.");
  if (/\b(dbo|sys|information_schema)\b/i.test(q))
    throw new Error("Do not use schema names like dbo. Use plain table names.");
  if (/\b(insert|update|delete|drop|alter|create|truncate|exec|execute|merge|grant|revoke|into|openrowset|opendatasource|openquery|waitfor|xp_\w+|sp_\w+|fn_\w+)\b/i.test(q))
    throw new Error("Forbidden keyword in query.");
  if (/\*/.test(q.replace(/count\s*\(\s*\*\s*\)/gi, "")))
    throw new Error("Do not use *. Select specific columns.");

  for (const name of getHiddenNames()) {
    if (new RegExp(`\\b${name}\\b`, "i").test(q))
      throw new Error(`Access to '${name}' is not allowed.`);
  }
  return q;
}

const toolImplementations = {
  // second argument is the scope (role, EmployeeID, DepartmentID), set by the server
  run_sql_query: async ({ query }, scope) => {
    try {
      const q = validateSelect(query);
      console.log("SQL:", scope.role, "|", q);
      return await runScoped(q, scope);
    } catch (err) {
      console.error("SQL error:", err.message);
      return { error: err.message };
    }
  },

  get_approved_leaves: async ({ name, year }, scope) => {
    try {
      const q = `SELECT COUNT(*) AS leaveRequests,
               COALESCE(SUM(DATEDIFF(day, l.StartDate, COALESCE(l.EndDate, l.StartDate)) + 1), 0) AS totalDays
        FROM Leaves l
        JOIN Employees e ON e.EmployeeID = l.EmployeeID
        WHERE l.Status = 'Approved'
          ${name ? `AND e.FullName LIKE '%' + @nameParam + '%'` : ""}
          ${year ? `AND YEAR(l.StartDate) = ${parseInt(year, 10)}` : ""}
      `;
      return await runWithName(q, scope, name);
    } catch (err) {
      console.error("Leave tool error:", err.message);
      return { error: err.message };
    }
  },

  get_remaining_leave_days: async (_args, scope) => {
    try {
      const q = `
        SELECT
          COALESCE(SUM(CASE
            WHEN LOWER(LTRIM(RTRIM(LeaveType))) = 'casual leave'
            THEN DATEDIFF(day, StartDate, COALESCE(EndDate, StartDate)) + 1
            ELSE 0
          END), 0) AS casualUsed,
          COALESCE(SUM(CASE
            WHEN LOWER(LTRIM(RTRIM(LeaveType))) IN ('sick leave', 'emergency leave', 'emergency')
            THEN DATEDIFF(day, StartDate, COALESCE(EndDate, StartDate)) + 1
            ELSE 0
          END), 0) AS sickUsed,
          COALESCE(SUM(CASE
            WHEN LOWER(LTRIM(RTRIM(LeaveType))) = 'annual leave'
            THEN DATEDIFF(day, StartDate, COALESCE(EndDate, StartDate)) + 1
            ELSE 0
          END), 0) AS annualUsed
        FROM Leaves
        WHERE EmployeeID = @empId
          AND StartDate IS NOT NULL
          AND (Status IS NULL OR LOWER(LTRIM(RTRIM(Status))) NOT IN ('rejected', 'declined'))
      `;
      const [usage] = await runScoped(q, scope);
      if (!usage) throw new Error("Leave balance query returned no result.");

      const used =
        Number(usage.casualUsed) +
        Number(usage.sickUsed) +
        Number(usage.annualUsed);
      return 36 - used; // Dashboard grants 12 days for each of three leave types.
    } catch (err) {
      console.error("Remaining leave tool error:", err.message);
      return { error: err.message };
    }
  },

  get_upcoming_leaves: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        CONVERT(varchar(10), StartDate, 23) AS startDate,
        CONVERT(varchar(10), COALESCE(EndDate, StartDate), 23) AS endDate,
        LeaveType AS leaveType,
        Status AS status
      FROM dbo.Leaves
      WHERE CAST(StartDate AS date) >= CAST(GETDATE() AS date)
        AND LOWER(LTRIM(RTRIM(Status))) IN ('approved', 'pending')
      ORDER BY StartDate ASC, EndDate ASC
    `);
    return result.recordset;
  },

  get_birthdays_on_date: async ({ date, departmentOnly }, scope) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
      throw new Error("A valid date is required to look up birthdays.");
    }
    const pool = await getPool();
    const request = pool.request().input("today", sql.Date, date);
    const managerDepartmentFilter = departmentOnly && scope?.role === "manager";
    if (managerDepartmentFilter) request.input("deptId", sql.Int, scope.deptId);
    const result = await request.query(`
        SELECT FullName AS name
        FROM dbo.Employees
        WHERE DateOfBirth IS NOT NULL
          AND MONTH(DateOfBirth) = MONTH(@today)
          AND DAY(DateOfBirth) = DAY(@today)
          ${managerDepartmentFilter ? "AND DepartmentID = @deptId" : ""}
        ORDER BY FullName
      `);
    return result.recordset;
  },

  get_meetings_on_date: async ({ date }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
      throw new Error("A valid date is required to look up meetings.");
    }
    const pool = await getPool();
    const result = await pool.request()
      .input("today", sql.Date, date)
      .query(`
        SELECT Title AS title, Time AS time, Location AS location
        FROM dbo.Meetings
        WHERE [Date] = @today
        ORDER BY Time, Title
      `);
    return result.recordset;
  },
};

// small helper so the name stays a bound parameter
async function runWithName(q, scope, name) {
  const { getPool } = require("./schemaservice");
  const pool = await getPool();
  const req = pool.request();
  if (scope.role !== "admin") {
    req.input("empId", sql.Int, scope.empId);
    req.input("deptId", sql.Int, scope.deptId);
  }
  if (name) req.input("nameParam", sql.VarChar, name);
  const prefix = scope.role === "admin" ? "" : require("./accessScope").buildPrefix(scope);
  return (await req.query(prefix + q)).recordset.slice(0, 50);
}

module.exports = { toolDefinitions, toolImplementations };