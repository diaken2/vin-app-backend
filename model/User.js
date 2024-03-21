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
  dailyRequests: { type: Number, default: 0 },
  allRequests: { type: Number, default: 0 },
  monthlyRequests: { type: Number, default: 0 },
  lastRequest: { type: Date },
});
module.exports = model("User", schema);
