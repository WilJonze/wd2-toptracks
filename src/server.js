require("dotenv").config();

const express = require("express")
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const app = express();
const port = 3000;


const toptracks = require("./toptracks");

app.use('/', express.static('public'))


app.use("/api/toptracks", toptracks);

app.use(express.json());

const whitelist = ["http://127.0.0.1", "http://127.0.0.1:5500"];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMS: 1000,
  max: 10
});

app.use(limiter);

//test route
// app.get("/", (req, res) => res.json({ success: "Hello World"}));

app.listen(port, () => console.log(`App listening on port ${port}`));