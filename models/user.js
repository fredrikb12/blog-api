const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, minlength: 3, maxlength: 30 },
  last_name: { type: String, required: true, minlength: 3, maxlength: 30 },
  username: { type: String, required: true, minlength: 5 },
  password: { type: String, required: true, minlength: 5 },
  user_type: { type: String, required: true },
  admin: { type: Boolean, required: false },
});

module.exports = mongoose.model("User", UserSchema);
