import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const backendLink = "https://chatting-app-backend-3nb7.onrender.com"; //Backend link
//const backendLink="http://localhost:5000"; //Backend link

const LoginPage = () => {
  const [email, setEmail] = useState(""); //Email of user
  const [password, setPassword] = useState(""); //Password of user
  const [error, setError] = useState(""); //For displaying error messages in login process
  const [loggedIn, setLoggedin] = useState(false); //Variable which shows if successfully logged in
  const [checking, setChecking] = useState(false); //MEssage to check credentials till the time response is being fetched from backend
  const [showDemo, setShowDemo] = useState(false); // Toggles demo video
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // clear previous errors
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Email regex
    if (!email || !password) {
      setError("Please fill in all fields");
      setTimeout(() => setError(""), 1500); //Clear error string/message
      return;
    }
    if (!emailRegex.test(email)) { //Test email
      setError("Invalid email format");
      setTimeout(() => setError(""), 1500);
      return;
    }
    setChecking(true); //Show checking... message
    try {
      const res = await fetch(`${backendLink}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setChecking(false); //Disable checking message
        setLoggedin(true);
        setTimeout(() => {
          setLoggedin(false);
          navigate('/home'); //Go to home page
        }
          , 2000);
        console.log("✅ Login successful");
        sessionStorage.setItem("email", email); // Save username in sessionStorage for socket use later
      } else {
        setChecking(false); //Disable checking message
        setError(data.message || "Login failed");
        setTimeout(() => setError(""), 1500); //Clear error string/message
      }
    } catch (err) {
      setChecking(false); //Disable checking message
      setError("Server error");
      setTimeout(() => setError(""), 1500); //Clear error string/message
    }
  };

  return (
    <div className="min-h-screen bg-yellow-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md text-xs text-center">
          ⚠️ <strong>Important Note:</strong> Any bugs, delayed messages, or slow responses are most likely due to the free backend server.
          If needed, I can switch to a paid one for better performance.
        </div>
        <h1 className="text-2xl font-bold text-center text-orange-600 mb-4">MangoChat</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Login to start chatting</p>

        <div className="space-y-4">
          <input
            type="text"
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
          <button
            onClick={handleLogin}
            className="w-full bg-orange-500 text-white rounded-xl p-2 hover:bg-orange-600 transition"
          >
            Log In
          </button>
          {checking && <p className="text-sm text-gray-600 text-center">Checking Credentials...</p>}
          {loggedIn && <p className="text-sm text-green-500 text-center">Log in Successful !...</p>}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>

        <Link to="/signup">
          <p className="text-sm text-center text-gray-500 mt-4">
            Don’t have an account?{" "}
            <span className="text-orange-600 hover:underline cursor-pointer">
              Sign up
            </span>
          </p>
        </Link>

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="text-orange-600 hover:underline text-sm"
          >
            🎬 Show Demo (progress till now)
          </button>
        </div>

        {showDemo && (
          <div className="mt-4">
            <video controls className="w-full rounded-xl shadow-md">
              <source src="/MangoChatDemo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
