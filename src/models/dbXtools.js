const sqlite = require('better-sqlite3');

const db = new sqlite('dbXtools.db');


// dbmgr = require('./dbmagr');
// var db = dbmgr.db;

// exports.getUser = ()=>{
//     const sql = "SELECT * FROM configApp"
//     let smtp = db.prepare(sql);
//     let res = smtp.all();

//     return res;
// }