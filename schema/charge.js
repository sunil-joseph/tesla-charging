const mongoose = require('mongoose');

const { Schema } = mongoose;

const chargeSchema = new Schema({
  dayOfWeek: Number,
  hour: Number,
  chargeState: {
    type: String,
    enum: ['start', 'stop'],
  },
});

const Charge = mongoose.model('Charge', chargeSchema);

module.exports = { Charge };
