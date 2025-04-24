import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Welcome to MangoChat</h1>

      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <button
          onClick={() => navigate("/private-chat")}
          className="w-full bg-orange-500 text-white py-3 rounded-xl text-lg hover:bg-orange-600 transition"
        >
          🔐 Private Chat (WORK IN PROGRESS)
        </button>

        <Link to='/joinroom'>
        <button
          className="w-full bg-yellow-400 text-white py-3 rounded-xl text-lg hover:bg-yellow-500 transition"
        >
          🏠 Chat Room
        </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
