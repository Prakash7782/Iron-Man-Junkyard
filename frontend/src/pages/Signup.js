import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        userType: 'customer', // default user will be customer
        phone: '', // phone number for dealers
        serviceArea: '' // service area for dealers
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password, userType, phone, serviceArea } = signupInfo;
    
        // Validation for required fields
        if (!name || !email || !password || !userType || (userType === 'dealer' && (!phone || phone.length !== 10))) {
            return handleError('All fields are required, and phone number must be 10 digits.');
        }
    
        // Prepare the request body based on user type
        const signupData = {
            name,
            email,
            password,
            userType,
            ...(userType === 'dealer' && { phone, serviceArea }) // Spread only if userType is dealer
        };
    
        try {
            const url = `${process.env.REACT_APP_API_URL}/auth/signup`;
            console.log(url);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData), // Use the new signupData object
            });
            const result = await response.json();
            const { success, message, error } = result;
    
            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else {
                handleError(message);
            }
        } catch (err) {
            handleError(err);
        }
    };
    

    return (
        <div className='container'>
            <h1>Signup</h1>
            <form onSubmit={handleSignup}>
                <div>
                    <label htmlFor='name'>Name</label>
                    <input
                        onChange={handleChange}
                        type='text'
                        name='name'
                        autoFocus
                        placeholder='Enter your name...'
                        value={signupInfo.name}
                    />
                </div>
                <div>
                    <label htmlFor='email'>Email</label>
                    <input
                        onChange={handleChange}
                        type='email'
                        name='email'
                        placeholder='Enter your email...'
                        value={signupInfo.email}
                    />
                </div>
                <div>
                    <label htmlFor='password'>Password</label>
                    <input
                        onChange={handleChange}
                        type='password'
                        name='password'
                        placeholder='Enter your password...'
                        value={signupInfo.password}
                    />
                </div>
                <div>
                    <label htmlFor='userType'>I am a:</label>
                    <select name='userType' value={signupInfo.userType} onChange={handleChange}>
                        <option value='customer'>Customer</option>
                        <option value='dealer'>Dealer</option>
                    </select>
                </div>

                {/* Conditionally render additional fields if user is a dealer */}
                {signupInfo.userType === 'dealer' && (
                    <>
                        <div>
                            <label htmlFor='phone'>Phone Number</label>
                            <input
                                onChange={handleChange}
                                type='text'
                                name='phone'
                                placeholder='Enter your phone number... (10 digits)'
                                value={signupInfo.phone}
                                maxLength={10} // Limit input to 10 characters
                            />
                        </div>
                        <div>
                            <label htmlFor='serviceArea'>Service Area (Comma-separated cities)</label>
                            <input
                                onChange={handleChange}
                                type='text'
                                name='serviceArea'
                                placeholder='Enter cities where you provide service...'
                                value={signupInfo.serviceArea}
                            />
                        </div>
                    </>
                )}
                <button type='submit'>Signup</button>
                <span>Already have an account? <Link to="/login">Login</Link></span>
            </form>
            <ToastContainer />
        </div>
    );
}

export default Signup;