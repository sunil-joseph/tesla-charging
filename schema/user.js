const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: String,
  accessToken: String,
  refreshToken: String,
  expirationDate: Date,
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
