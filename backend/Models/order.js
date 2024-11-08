const mongoose = require('mongoose');
const { Schema } = mongoose;


const orderSchema = new Schema({
  url: { type: String, required: true }, // URL for the image
  owner: { type: Schema.Types.ObjectId, ref: 'users', required: true }, // Link to User model (owner)
  buyer: { type: Schema.Types.ObjectId, ref: 'users' }, // Link to User model (buyer)
  name: { type: String, required: true }, // Name of the order/item
  price: { type: Number, required: true }, // Price of the order/item
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});

const OrderModel = mongoose.model('Order', orderSchema);

module.exports = OrderModel;
