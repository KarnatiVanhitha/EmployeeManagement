// Validates SQL written by the model, before it is executed.
// Called from runScoped() in accessScope.js, so every query goes through it.

function validateSql(sql, allowed, isAdmin) {
  if (typeof sql !== "string") throw new Error("Invalid query");
  const s = sql.trim();

  // Applies to EVERY role, including admin
  if (!/^select\b/i.test(s)) throw new Error("Only SELECT is allowed.");
  if (/;|--|\/\*/.test(s)) throw new Error("Comments and multiple statements are not allowed.");
  if (
    /\b(insert|update|delete|drop|alter|create|exec|execute|merge|truncate|grant|revoke|into|waitfor|bulk|openrowset|openquery|opendatasource|xp_\w+|sp_\w+)\b/i.test(s)
  ) {
    throw new Error("Statement type not allowed.");
  }

  // Query must read from at least one real table (blocks SELECT 'Paris')
  const tables = [...s.matchAll(/\b(?:from|join)\s+(?:\[?\w+\]?\.)?\[?(\w+)\]?/gi)].map((m) =>
    m[1].toLowerCase()
  );
  if (tables.length === 0) throw new Error("Query must read from a table.");

  if (isAdmin) return;

  // Non-admin: no schema-qualified or system objects.
  // "dbo.Salaries" would bypass the row-level CTE filters.
  if (/\b(dbo|sys|information_schema|master|tempdb|msdb)\b/i.test(s)) {
    throw new Error("Use plain table names only.");
  }

  const ok = new Set((allowed || []).map((t) => t.toLowerCase()));
  if (!tables.every((t) => ok.has(t))) throw new Error("Table not allowed.");
}

module.exports = { validateSql };