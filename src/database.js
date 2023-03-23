const mysql = require("mysql2");
const dataColumns = "artist, album, album_img_url, track, upvotes, downvotes";

// ============ DATABASE FUNCTIONALITY ==================
const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
  if (err) throw err;
  console.log("MySQL connection established...");
});

function createSongRecord(song, response = null) {
  const query = `INSERT INTO tracks (${dataColumns}) VALUES ('${song.artist}', '${song.album}', '${song.albumImg}', '${song.trackName}', 0, 0)`;
  connection.query(query, (err, result) => {
    if (err) throw err;

    if (response) {
      response.status(200);
      response.write("New song added to list!");
      response.send();
    }
  });
}

function escapeQuotes(string) {
  string = string.replaceAll(`'`, `''`);

  return string;
}

function getSongInfo(song, callback, response = null) {
  const escapedTrackName = escapeQuotes(song.trackName);
  const escapedArtist = escapeQuotes(song.artist);
  const query = `SELECT ${dataColumns} FROM tracks WHERE track = '${escapedTrackName}' AND artist = '${escapedArtist}'`;

  connection.query(query, (err, result) => {
    if (err) throw err;

    if (result.length < 1) {
      song.trackName = escapedTrackName;
      song.artist = escapedArtist;
      song.album = escapeQuotes(song.album);
      createSongRecord(song, response);
    } else {
      return callback(result);
    }
  });
}

function getAllSongs(callback) {
  const query = `SELECT ${dataColumns} FROM tracks ORDER BY (upvotes - downvotes) DESC`;

  connection.query(query, (err, result) => {
    return callback(result);
  });
}

module.exports = { getSongInfo, getAllSongs };
