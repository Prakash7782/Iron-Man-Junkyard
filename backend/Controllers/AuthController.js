const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");
const OrderModel =require("../Models/order");

const order = async (req, res) => {
    try {
        const { imageUrl, user, name, price, preferredDate, preferredTime } = req.body;

        // Validate incoming data
        if (!imageUrl || !user || !name || !price || !preferredDate || !preferredTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const foundUser = await UserModel.findById(user);
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new order
        const newOrder = new OrderModel({
            url: imageUrl, 
            owner: user, 
            buyer: null,   
            name: name,     
            price: price,  
            preferredDate: new Date(req.body.preferredDate).toISOString().split('T')[0],
            preferredTime: preferredTime
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        // Return the saved order data in the response
        res.status(201).json({
            message: 'Order created successfully',
            order: savedOrder,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error while creating order' });
    }
};

const signup = async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({ message: 'User already exist, you can login', success: false });
        }
        const userModel = new UserModel({ name, email, password,userType });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201)
            .json({
                message: "Signup successfully",
                success: true
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            })
    }
}
const getOrdersWithCount = async (req, res) => {
  try {
      const ordersWithCount = await OrderModel.aggregate([
          {
              $group: {
                  _id: { 
                      name: "$name", 
                      price: "$price", 
                      owner: "$owner", 
                      buyer: "$buyer",
                      preferredDate: "$preferredDate", 
                      preferredTime: "$preferredTime" 
                  },
                  count: { $sum: 1 },
                  docs: { $push: "$$ROOT" }
              }
          },
          {
              $lookup: {
                  from: "users", 
                  localField: "docs.owner",
                  foreignField: "_id",
                  as: "ownerDetails"
              }
          },
          {
              $lookup: {
                  from: "users",
                  localField: "docs.buyer",
                  foreignField: "_id",
                  as: "buyerDetails"
              }
          },
          {
            $addFields: {
                "docs.owner": { $arrayElemAt: ["$ownerDetails", 0] },
                "docs.buyer": { $arrayElemAt: ["$buyerDetails", 0] }
              }
           },
          {
              $project: {
                  _id: 0,
                  name: "$_id.name",
                  price: "$_id.price",
                  owner: { $arrayElemAt: ["$ownerDetails.name", 0] },
                  buyer: { $arrayElemAt: ["$buyerDetails.name", 0] },
                  count: 1,
                  docs: 1
              }
          }
      ]);

      res.status(200).json(ordersWithCount);
  } catch (error) {
      console.error("Error retrieving orders with count:", error);
      res.status(500).json({ error: 'Failed to retrieve orders with count' });
  }
};

  
const hataorecord=async(req,res)=>{
    try {
        const { orderId } = req.params;

        // Find and delete the order by ID
        const deletedOrder = await OrderModel.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ error: "Internal server error" });
    }

};
const getOrdersByDealerId = async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await OrderModel.find({ buyer: userId }).populate('buyer').populate('owner').populate('preferredDate').populate('preferredTime');
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error fetching orders" });
    }
};
const getOrdersByCustomerId = async (req, res) => {
  const { userId } = req.params;
  try {
      const orders = await OrderModel.find({ owner: userId }).populate('owner').populate('buyer').populate('preferredDate').populate('preferredTime');
      res.status(200).json(orders);
  } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Server error fetching orders" });
  }
};

const getOrdersForDealer = async (req, res) => {
    try {
      const orders = await OrderModel.find({ buyer: null })
        .populate('owner', 'name')  
        .exec();
  
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No orders available' });
      }
  
      return res.status(200).json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
const updateBuyer=async (req, res) => {
    const { orderId } = req.params;
    const { buyerId } = req.body;
  
    try {
      // Validate that the buyerId is correct (must be a dealer)
      const dealer = await UserModel.findById(buyerId);
      if (!dealer || dealer.userType !== 'dealer') {
        return res.status(400).json({ message: 'Invalid dealer ID' });
      }
  
      // Find and update the order to set the buyer
      const order = await OrderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      if (order.buyer !== null) {
        return res.status(400).json({ message: 'Order has already been accepted' });
      }
  
      order.buyer = buyerId;  // Set the buyer to the dealer's ID
      await order.save();
  
      return res.status(200).json({ message: 'Order accepted successfully', order });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Auth failed email or password is wrong';
        if (!user) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(200)
            .json({
                message: "Login Success",
                success: true,
                jwtToken,
                email,
                name: user.name,
                userType: user.userType 
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            })
    }
}

module.exports = {
    signup,
    login,
    order,
    getOrdersForDealer,
    updateBuyer,
    getOrdersByDealerId,
    getOrdersByCustomerId,
    hataorecord,
    getOrdersWithCount
}