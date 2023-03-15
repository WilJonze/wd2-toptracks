const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const getSongInfo = require("./database");
const db = require("./database");

const fetchTracks = async (searchtext) => {
  const url = `https://api.spotify.com/v1/search?q=${searchtext}&type=track&limit=10`;
  const client_id = process.env.CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;
  let token = "";

  let authOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  };

  try {
    const response = await fetch(
      "https://accounts.spotify.com/api/token",
      authOptions
    );
    const data = await response.json();
    const accessToken = data.access_token;

    const tracksStream = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const tracksJson = await tracksStream.json();
    return tracksJson;
  } catch (err) {
    return { Error: err.stack };
  }
};

router.get("/", async (req, res) => {
  let query = req.query.query;
  const data = await fetchTracks(query);
  res.json(data);
});

router.get("/test", (req, res) => {
  res.json({ success: "Hello Spotify!" });
});

router.post("/", async (req, res) => {
  const searchtext = req.body.searchtext;
  const data = await fetchTracks(searchtext);
  res.json(data);
});

router.use(express.json());

module.exports = router;
