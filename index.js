const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const routes = require("./router/update.route");
app.use(express.json({ extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://a0932518.xsph.ru"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/api", routes);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "build")));
const PORT = process.env.PORT || 5000;
const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://yvateve:lcP3mwLhMtbR57fM@cluster0.cetrpxl.mongodb.net/start",
      {}
    );
    app.listen(PORT, () => {
      console.log("Server has been launched...");
    });
  } catch (e) {
    console.log(e);
  }
};
start();
