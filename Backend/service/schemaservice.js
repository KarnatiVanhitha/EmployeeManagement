const sql = require("mssql");
const dbModule = require("../config/db"); // change the file name if yours is different

// Tables the chatbot must never see
const HIDDEN_TABLES = ["SuperAdmins"];
// Columns whose names match this are hidden (passwords, tokens, etc.)
const HIDDEN_COLUMN_REGEX = /pass|token|secret|hash|otp/i;

let cache = null;
let hiddenNames = [];

// Works with most ways a db file can export the connection
async function getPool() {
  let d = dbModule;
  if (d && typeof d.then === "function") d = await d; // exported a promise

  // Case 1: it is already a pool
  if (d && typeof d.request === "function") return d;

  // Case 2: an object holding the pool or a connect function
  for (const key of ["poolPromise", "pool", "getPool", "connectDB", "connect", "getConnection"]) {
    let c = d && d[key];
    if (typeof c === "function") c = await c();
    else if (c && typeof c.then === "function") c = await c;
    if (c && typeof c.request === "function") return c;
  }

  // Case 3: it exported a function that returns a pool
  if (typeof d === "function") {
    const c = await d();
    if (c && typeof c.request === "function") return c;
  }

  // Case 4: your project calls sql.connect(config) once (global pool)
  return { request: () => new sql.Request() };
}

async function loadSchema() {
  const pool = await getPool();

  const cols = await pool.request().query(`
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    ORDER BY TABLE_NAME, ORDINAL_POSITION`);

  const fks = await pool.request().query(`
    SELECT tp.name AS ChildTable, cp.name AS ChildColumn,
           tr.name AS ParentTable, cr.name AS ParentColumn
    FROM sys.foreign_key_columns fkc
    JOIN sys.tables tp  ON fkc.parent_object_id = tp.object_id
    JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
    JOIN sys.tables tr  ON fkc.referenced_object_id = tr.object_id
    JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id`);

  const tables = {};
  hiddenNames = [...HIDDEN_TABLES];

  for (const c of cols.recordset) {
    if (HIDDEN_TABLES.includes(c.TABLE_NAME)) continue;
    if (HIDDEN_COLUMN_REGEX.test(c.COLUMN_NAME)) {
      hiddenNames.push(c.COLUMN_NAME);
      continue;
    }
    (tables[c.TABLE_NAME] ||= []).push(`${c.COLUMN_NAME} ${c.DATA_TYPE}`);
  }

  let text = Object.entries(tables)
    .map(([t, cs]) => `${t}(${cs.join(", ")})`)
    .join("\n");

  text += "\n\nRelationships (foreign keys):\n";
  text += fks.recordset
    .filter((f) => tables[f.ChildTable] && tables[f.ParentTable])
    .map((f) => `${f.ChildTable}.${f.ChildColumn} -> ${f.ParentTable}.${f.ParentColumn}`)
    .join("\n");

  cache = text;
}

async function getSchemaText() {
  if (!cache) await loadSchema();
  return cache;
}

function getHiddenNames() {
  return hiddenNames;
}

module.exports = { getSchemaText, getHiddenNames, getPool };