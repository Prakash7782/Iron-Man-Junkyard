import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';
function Home() {
    const getUserIdFromToken = () => {
        const token = localStorage.getItem("token");  // Retrieve the JWT token from localStorage
        if (token) {
          const decoded = jwtDecode(token);  // Decode the JWT token
        //   console.log(decoded);
          return decoded._id;  // Assuming the user's ID is stored as 'user_id' in the payload
        }
        return null;  // Return null if no token exists
      }
    const userId = getUserIdFromToken();  // Get the user ID from the token
    console.log('Logged-in user ID:', userId);
    const [loggedInUser, setLoggedInUser] = useState('');
    const [userType, setUserType] = useState('');
    const [products, setProducts] = useState('');
    const [orderDetails,setOrderDetails]=useState({
        imageUrl: "",
        user:userId, // Include userId in the request          
        name: "",
        price: "",
      });
    const navigate = useNavigate();
    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
        setUserType(localStorage.getItem('userType'));
    }, [])
    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyOrderDetails = { ...orderDetails };
        copyOrderDetails[name] = value;
        setOrderDetails(copyOrderDetails);
    };
    const handleLogout = (e) => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userType');
        handleSuccess('User Loggedout');
        setTimeout(() => {
            navigate('/login');
        }, 1000)
    }
    
    // const fetchProducts = async () => {
    //     try {
    //         const url = `${process.env.REACT_APP_API_URL}/products`;
    //         const headers = {
    //             headers: {
    //                 'Authorization': localStorage.getItem('token')
    //             }
    //         }
    //         const response = await fetch(url, headers);
    //         const result = await response.json();
    //         console.log(result);
    //         setProducts(result);
    //     } catch (err) {
    //         handleError(err);
    //     }
    // }
    const upload = async (event) => {
        event.preventDefault();
            
        const {imageUrl,user,name,price}=orderDetails;
        orderDetails.user=userId;
        if (!name || !user|| !imageUrl|| !price) {
            return handleError('all fields required....')
        }
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderDetails),
          });
      
          const result = await response.json();
          if (response.ok) {
            handleSuccess("Scrap uploaded");
            setOrderDetails({
                imageUrl: "",
                user: userId, // Keep the userId as it is
                name: "",
                price: "",
            });
            console.log('Order Created:', result);
          } else {
            console.error('Failed to create order:', result.message);
          }
        } catch (error) {
          console.error('Error creating order:', error);
        }
      };
      
    // useEffect(() => {
    //     fetchProducts()
    // }, [])

    return (
        <div>
            <h1>Welcome {loggedInUser} ({userType})</h1> {/* Display userType */}
            <button onClick={handleLogout}>Logout</button>
            <div>
                {userType === 'customer' ? (
                    <h2>Schedule your scrap</h2> // Message for customers
                ) : (
                    <h2> Is there any customer selling scrap</h2> // Message for dealers
                )}
            </div>
            <form onSubmit={upload}>
            <div>
                    <label htmlFor='name'>Scrap Name</label>
                    <input
                        onChange={handleChange}
                        type='name'
                        name='name'
                        placeholder='Enter scrap name...'
                        value={orderDetails.name}
                    />
            </div>
            <div>
                    <label htmlFor='price'>Price</label>
                    <input
                        onChange={handleChange}
                        type='price'
                        name='price'
                        placeholder='Enter your selling price...'
                        value={orderDetails.price}
                    />
            </div>
            <div>
                    <label htmlFor='url'>enter image url</label>
                    <input
                        onChange={handleChange}
                        type='imageUrl'
                        name='imageUrl'
                        placeholder='paste your image url...'
                        value={orderDetails.imageUrl}
                    />
            </div>
            <button type='submit'>Upload</button>
            </form>
            {/* <div>
                {products && products.map((item, index) => (
                    <ul key={index}>
                        <li>{item.name} : {item.price}</li>
                    </ul>
                ))}
            </div> */}
            <ToastContainer />
        </div>
    )
}

export default Home
