import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/registerPage.css';


const RegisterPage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    location: '',
    age: '',
    experience: '',
    expertise: ''
  });
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      // First, get basic user info
      const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          "Authorization": `Bearer ${response.access_token}`
        }
      });

      // Then, use People API to get additional info
      const peopleApiResponse = await axios.get(
        "https://people.googleapis.com/v1/people/me?personFields=birthdays,addresses",
        {
          headers: {
            "Authorization": `Bearer ${response.access_token}`
          }
        }
      );

      const userInfo = userInfoResponse.data;
      const peopleInfo = peopleApiResponse.data;

      // Calculate age if birthday is available
      let age = '';
      if (peopleInfo.birthdays && peopleInfo.birthdays.length > 0) {
        const birthday = peopleInfo.birthdays[0].date;
        if (birthday) {
          const birthDate = new Date(birthday.year, birthday.month - 1, birthday.day);
          const ageDifMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(ageDifMs);
          age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
        }
      }

      // Get location if available
      let location = '';
      if (peopleInfo.addresses && peopleInfo.addresses.length > 0) {
        location = peopleInfo.addresses[0].city || '';
      }

      setUser(userInfo);
      setFormData(prevData => ({
        ...prevData,
        email: userInfo.email || '',
        name: userInfo.name || '',
        age: age,
        location: location
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user && formData.location && formData.age && formData.experience && formData.expertise) {
      // Here you would typically send this data to your backend
      console.log("Account created", { ...user, ...formData });
      setAccountCreated(true);
    } else {
      alert("Please fill in all required fields");
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
        scope: 'email profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.addresses.read'
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginButton"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  return (
    <div className="register-page">
      <h1>Social Jobs Registration</h1>
      {!user ? (
        <div id="googleLoginButton"></div>
      ) : accountCreated ? (
        <div className="success-message">Account successfully created!</div>
      ) : (
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Complete Your Profile</h2>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="experience"
            placeholder="Experience"
            value={formData.experience}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="expertise"
            placeholder="Expertise"
            value={formData.expertise}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Create Account</button>
        </form>
      )}
    </div>
  );
};

export default RegisterPage;
