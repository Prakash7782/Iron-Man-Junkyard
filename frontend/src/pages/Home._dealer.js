import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import {jwtDecode} from 'jwt-decode'; // Correct import

function Home_dealer() {
  const [orders, setOrders] = useState([]);
  const [dealerId, setDealerId] = useState(null); // Store dealer's ID
  
  // Fetch orders for the dealer (those with 'buyer' = null)
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/orders/dealer`, {
        method: 'GET',
        headers: {
          'Authorization': localStorage.getItem('token'),  // Add auth token for authorization
        },
      });

      const result = await response.json();

      if (response.ok) {
        setOrders(result);
      } else {
        handleError(result.message || 'Failed to fetch orders');
      }
    } catch (error) {
      handleError('Error fetching orders');
      console.error(error);
    }
  };

  // Get the dealer's ID from the JWT token
  const getDealerIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      return decoded._id; // Assuming the ID is stored as _id in the payload
    }
    return null;
  };

  useEffect(() => {
    const dealerId = getDealerIdFromToken();
    setDealerId(dealerId); // Set the dealer's ID
    fetchOrders(); // Fetch orders for the dealer
  }, []);  // Empty dependency array means this runs once when the component is mounted

  // Function to accept the order
  const acceptOrder = async (orderId) => {
    if (!dealerId) {
      handleError('You are not logged in as a dealer');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/orders/accept/${orderId}`, {
        method: 'PUT', // Assuming we update the order
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),  // Include the token for authorization
        },
        body: JSON.stringify({
          buyerId: dealerId, // Set the dealer's ID as the buyer
        }),
      });

      const result = await response.json();

      if (response.ok) {
        handleSuccess('Order accepted successfully');
        // Update the local orders state to reflect the accepted order
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, buyer: dealerId } : order
        ));
      } else {
        handleError(result.message || 'Failed to accept order');
      }
    } catch (error) {
      handleError('Error accepting order');
      console.error(error);
    }
  };
  const navigate=useNavigate();
  const handleLogout = (e) => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userType');
    handleSuccess('User Loggedout');
    setTimeout(() => {
        navigate('/login');
    }, 1000)
}

  return (
    
    <div>
      <button onClick={handleLogout}>Logout</button>
      <h1>Orders for Sale (Dealer Page)</h1>

      {orders.length === 0 ? (
        <p>No orders available at the moment.</p>
      ) : (
        <div>
          {orders.map((order, index) => (
            <div key={order._id} className="order-card">
              {order.url ? (
                <img src={order.url} alt={order.name} style={{ width: '100px', height: '100px' }} />
              ) : (
                <p>Image not available</p>
              )}
              <h3>{order.name}</h3>
              <p>Preferred Date for receiving the scrap: ${order.preferredDate}</p>
              <p>Preferred Time for receiving the scrap from the customer: ${order.preferredTime}</p>
              <p>Customer Name: {order.owner?.name || 'Unknown'}</p> {/* Display customer name */}
              
              {/* Add the "Accept" button if the order doesn't already have a buyer */}
              {order.buyer === null ? (
                <button onClick={() => acceptOrder(order._id)}>Accept Order</button>
              ) : (
                <p>Order Accepted</p>
              )}
            </div>
          ))}
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Home_dealer;
