const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const vehicleSchema = new Schema({
  userId: ObjectId,
  vehicleId: String,
  displayName: String,
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = { Vehicle };
