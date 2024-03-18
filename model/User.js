const { Schema, model } = require("mongoose");
const schema = new Schema({
  name: {
    type: String,
  },
  login: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  lastEntry: {
    type: String,
  },
});
module.exports = model("User", schema);
