require("dotenv").config();
const { getSchemaText } = require("./service/schemaservice");

getSchemaText()
  .then((t) => { console.log(t.slice(0, 800)); process.exit(); })
  .catch((e) => { console.error("SCHEMA ERROR:", e); process.exit(1); });