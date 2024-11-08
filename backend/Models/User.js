const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        enum: ['customer', 'dealer'],
        required: true
    },
    // Fields common to both customers and dealers
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    // Additional fields for customer users
    customerDetails: {
        sellinghistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
    },
    // Additional fields for dealer users
    dealerDetails: {
        phoneNumber: {
            type: String,
            //required: true, // Making this field required
        },
        serviceArea: {
            type: String,
            //required: true, // Making this field required
        },
        orderhistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
    }
}, { timestamps: true });

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;