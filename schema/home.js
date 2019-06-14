const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const homeSchema = new Schema({
  userId: ObjectId,
  location: {
    type: { type: String },
    coordinates: [],
  },
});

homeSchema.index({
  location: '2dsphere',
});

const Home = mongoose.model('Home', homeSchema);

module.exports = { Home };
