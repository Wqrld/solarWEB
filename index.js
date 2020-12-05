const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use("/static", express.static("static"));

app.use(bodyParser.json());

app.get("/", function(req, res) {
res.render("index.ejs", {})
});

app.enable("trust proxy");
app.set("view engine", "ejs");

app.set("views", "views");


console.log("loaded");
app.listen("8608");
