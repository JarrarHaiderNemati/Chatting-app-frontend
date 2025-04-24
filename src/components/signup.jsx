import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const backendLink="https://chatting-app-backend-3nb7.onrender.com"; //Backend link

const SignupPage = () => {
  const [userName, setUserName] = useState(""); //User name
  const [email, setEmail] = useState(""); //Email of user
  const [password, setPassword] = useState(""); //Password
  const [confirmPassword, setConfirmPassword] = useState(""); //Confirm passwords
  const [error, setError] = useState(""); //Error string 
  const [success, setSuccess] = useState(""); //Success message
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    setSuccess("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Email regex
    if (!userName || !password || !confirmPassword) {
      setError("All fields are required");
      setTimeout(()=>setError(""),1500); //Clear error string/message
      return;
    }
    if (!emailRegex.test(email)) { //Test email
      setError("Invalid email format");
      setTimeout(() => setError(""), 1500);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setTimeout(()=>setError(""),1500); //Clear error string/message
      return;
    }

    try {
      const res = await fetch(`${backendLink}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email , userName, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Signup successful. Redirecting...");
        sessionStorage.setItem('email'); //Save email in session storage
        setTimeout(() =>{ 
          setSuccess(""); //Clear success message
          navigate("/home"); // redirect to home page
        }, 1500); 
      } else {
        setError(data.message || "Signup failed");
        setTimeout(()=>setError(""),1500); //Clear error string/message
      }
    } catch (err) {
      setError("Server error");
      setTimeout(()=>setError("")); //Clear error string/message
    }
  };

  return (
    <div className="min-h-screen bg-orange-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
      <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md text-xs text-center">
        ⚠️ <strong>Important Note:</strong> Any bugs, delayed messages, or slow responses are most likely due to the free backend server.  
        If needed, I can switch to a paid one for better performance.
      </div>
        <h1 className="text-2xl font-bold text-center text-orange-600 mb-4">Create Account</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Join MangoChat now</p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <button
            onClick={handleSignup}
            className="w-full bg-orange-500 text-white rounded-xl p-2 hover:bg-orange-600 transition"
          >
            Sign Up
          </button>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center">{success}</p>}
        </div>

        <Link to="/">
          <p className="text-sm text-center text-gray-500 mt-4">
            Already have an account?{" "}
            <span className="text-orange-600 hover:underline cursor-pointer">Log in</span>
          </p>
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
