const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  url: { type: String, required: true }, 
  owner: { type: Schema.Types.ObjectId, ref: 'users', required: true }, 
  buyer: { type: Schema.Types.ObjectId, ref: 'users' }, 
  name: { type: String, required: true }, 
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
}, {
  timestamps: true,
});

const OrderModel = mongoose.model('Order', orderSchema);

module.exports = OrderModel;
