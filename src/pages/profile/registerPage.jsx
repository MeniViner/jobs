// import React, { useState, useEffect } from 'react';
// import { collection, addDoc } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import '../../styles/registerPage.css';


// const RegisterPage = () => {
//   const [user, setUser] = useState(null);
//   const [formData, setFormData] = useState({
//     email: '',
//     name: '',
//     location: '',
//     age: '',
//     experience: '',
//     expertise: ''
//   });
//   const [accountCreated, setAccountCreated] = useState(false);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://accounts.google.com/gsi/client';
//     script.async = true;
//     script.defer = true;
//     script.onload = initializeGoogleSignIn;
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   const initializeGoogleSignIn = () => {
//     if (window.google) {
//       window.google.accounts.id.initialize({
//         client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
//         callback: handleGoogleLogin,
//         scope: 'email profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.addresses.read'
//       });
//       window.google.accounts.id.renderButton(
//         document.getElementById("googleLoginButton"),
//         { theme: "outline", size: "large" }
//       );
//     } else {
//       setError("Google API not loaded");
//     }
//   };

//   const handleGoogleLogin = async (response) => {
//     console.log("Google login response:", response);
//     setError(null);
//     setIsLoading(true);
//     try {
//       if (!response.credential) {
//         throw new Error("No credential received from Google");
//       }

//       // Decode the ID token
//       const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
//       console.log("Decoded token:", decodedToken);

//       // Use the decoded token information
//       const userInfo = {
//         email: decodedToken.email,
//         name: decodedToken.name,
//         picture: decodedToken.picture
//       };

//       setUser(userInfo);
//       setFormData(prevData => ({
//         ...prevData,
//         email: userInfo.email || '',
//         name: userInfo.name || '',
//       }));

//       console.log("User info set:", userInfo);
//     } catch (err) {
//       console.error("Error in handleGoogleLogin:", err);
//       setError(err.message || "An error occurred during Google login");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     if (user && formData.location && formData.age && formData.experience && formData.expertise) {
//       try {
//         const docRef = await addDoc(collection(db, "users"), {
//           ...user,
//           ...formData,
//           createdAt: new Date()
//         });
//         console.log("Document written with ID: ", docRef.id);
//         setAccountCreated(true);
//       } catch (e) {
//         console.error("Error adding document: ", e);
//         setError("Failed to create account. Please try again.");
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       setError("Please fill in all required fields");
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="register-page">
//         <h1>Social Jobs Registration</h1>
//         <div className="loading-message">Please wait, processing your request...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="register-page">
//       <h1>Social Jobs Registration</h1>
//       {error && <div className="error-message">{error}</div>}
//       {!user ? (
//         <div id="googleLoginButton"></div>
//       ) : accountCreated ? (
//         <div className="success-message">Account successfully created!</div>
//       ) : (
//         <form onSubmit={handleSubmit} className="register-form">
//           <h2>Complete Your Profile</h2>
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleInputChange}
//             required
//           />
//           <input
//             type="text"
//             name="name"
//             placeholder="Name"
//             value={formData.name}
//             onChange={handleInputChange}
//             required
//           />
//           <input
//             type="text"
//             name="location"
//             placeholder="Location"
//             value={formData.location}
//             onChange={handleInputChange}
//             required
//           />
//           <input
//             type="number"
//             name="age"
//             placeholder="Age"
//             value={formData.age}
//             onChange={handleInputChange}
//             required
//           />
//           <input
//             type="text"
//             name="experience"
//             placeholder="Experience"
//             value={formData.experience}
//             onChange={handleInputChange}
//             required
//           />
//           <input
//             type="text"
//             name="expertise"
//             placeholder="Expertise"
//             value={formData.expertise}
//             onChange={handleInputChange}
//             required
//           />
//           <button type="submit">Create Account</button>
//         </form>
//       )}
//     </div>
//   );
// };

// export default RegisterPage;
