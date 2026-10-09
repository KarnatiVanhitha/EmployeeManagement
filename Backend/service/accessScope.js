const sql = require("mssql");
const { getPool, getSchemaText } = require("./schemaservice");

const DEPT_EMP =
  "EmployeeID IN (SELECT EmployeeID FROM dbo.Employees WHERE DepartmentID = @deptId)";
const DEPT_REVIEWEE =
  "RevieweeID IN (SELECT EmployeeID FROM dbo.Employees WHERE DepartmentID = @deptId)";

// Tables a non-admin may query, and which rows they may see.
// Any table NOT listed here is blocked for employees and managers.
const RULES = {
  Employees:   { employee: "EmployeeID = @empId",   manager: "DepartmentID = @deptId" },
  Departments: { employee: "DepartmentID = @deptId", manager: "DepartmentID = @deptId" },
  Leaves:      { employee: "EmployeeID = @empId",   manager: DEPT_EMP },
  Salaries:    { employee: "EmployeeID = @empId",   manager: DEPT_EMP },
  Timesheets:  { employee: "EmployeeID = @empId",   manager: DEPT_EMP },
  Reviews:     { employee: "RevieweeID = @empId",    manager: DEPT_REVIEWEE },
  EmployeePromotionHistory: { employee: "EmployeeID = @empId", manager: DEPT_EMP },
  Holidays:    { employee: "1 = 1", manager: "1 = 1" },
  Meetings:    { employee: "1 = 1", manager: "1 = 1" },
  Roles:       { employee: "1 = 1", manager: "1 = 1" },
};

const ADMIN_ROLES = ["admin", "superadmin", "super admin", "office", "hr"];

// Work out who is asking, from the verified login token (req.user)
async function getScope(user) {
  if (!user) return null;
  const role = String(user.role || "").toLowerCase();
  if (ADMIN_ROLES.includes(role)) return { role: "admin", name: user.name || "Admin" };

  const pool = await getPool();
  const r = await pool
    .request()
    .input("email", sql.VarChar, user.email)
    .query("SELECT TOP 1 EmployeeID, DepartmentID, FullName FROM dbo.Employees WHERE Email = @email");
  if (!r.recordset.length) return null;

  const e = r.recordset[0];
  return {
    role: /manager/i.test(role) ? "manager" : "employee",
    empId: e.EmployeeID,
    deptId: e.DepartmentID,
    name: e.FullName,
  };
}

function allowedTables(scope) {
  return scope.role === "admin" ? null : Object.keys(RULES);
}

function buildPrefix(scope) {
  if (scope.role === "admin") return "";
  return (
    "WITH " +
    Object.keys(RULES)
      .map((t) => `${t} AS (SELECT * FROM dbo.${t} WHERE ${RULES[t][scope.role]})`)
      .join(", ") +
    " "
  );
}

// Reject queries that mention any table this user may not access
async function checkTables(q, scope) {
  if (scope.role === "admin") return;
  const lines = (await getSchemaText()).split("\n");
  const all = lines.map((l) => (l.match(/^(\w+)\(/) || [])[1]).filter(Boolean);
  const allowed = new Set(Object.keys(RULES).map((t) => t.toLowerCase()));
  for (const t of all) {
    if (!allowed.has(t.toLowerCase()) && new RegExp(`\\b${t}\\b`, "i").test(q)) {
      throw new Error(`You do not have permission to access ${t} data.`);
    }
  }
}

async function runScoped(q, scope) {
  await checkTables(q, scope);
  const pool = await getPool();
  const req = pool.request();
  if (scope.role !== "admin") {
    req.input("empId", sql.Int, scope.empId);
    req.input("deptId", sql.Int, scope.deptId);
  }
  const result = await req.query(buildPrefix(scope) + q);
  return result.recordset.slice(0, 50);
}

module.exports = { getScope, allowedTables, buildPrefix, runScoped };