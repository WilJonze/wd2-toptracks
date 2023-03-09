const mysql = require("mysql2");

// ============ DATABASE FUNCTIONALITY ==================
const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PWORD,
  database: "top_tracks",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

function getSongInfo(song) {
  console.log(song.track, song.artist);
  return JSON.stringify(song);
}

module.exports = getSongInfo;
