const sqlite = require('better-sqlite3'); console.log(__dirname+'/src/db/dbXtools.db');
const db = new sqlite(__dirname+'/src/db/dbXtools.db');
exports.db = db;

