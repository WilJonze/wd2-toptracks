require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const app = express();
const port = 3000;

const toptracks = require("./toptracks");
const db = require("./database");
const getSongInfo = require("./database");

app.use("/", express.static("public"));

app.use("/api/toptracks", toptracks);

app.use(express.json());

const whitelist = [
  "localhost",
  "127.0.0.1",
  "http://127.0.0.1",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:3000",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMS: 1000,
  max: 100,
});

app.use(limiter);

// ================= SONG RELATED ROUTES =================
app.post("/song", (req, res) => {
  db.getSongInfo(
    req.body,
    (result) => {
      const queryResult = result[0];
      res.send(queryResult);
    },
    res // pass res into function for use down the road
  );
});

app.get("/all-songs", (req, res) => {
  db.getAllSongs((result) => {
    res.send(result);
  });
});

app.get("/vote/:vote", (req, res) => {
  if (!whitelist.includes(req.hostname)) {
    res.send("Not Authorized.");
  } else {
    const [vote, songID] = req.params.vote.split(":");
    db.updateVotes(songID, vote, res);
  }
});

//test route
// app.get("/", (req, res) => res.json({ success: "Hello World"}));

app.listen(port, () => console.log(`App listening on port ${port}`));
