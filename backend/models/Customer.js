const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  vehicle_number: { type: String, required: true },
  last_service_date: { type: Date, required: true },
  next_service_date: { type: Date, required: true },
});

module.exports = mongoose.model('Customer', customerSchema);