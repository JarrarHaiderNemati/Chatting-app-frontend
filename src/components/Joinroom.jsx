import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Filter from 'bad-words';
const filter=new Filter();

export default function JoinRoom() {
  const [userName,setUsername]=useState('');
  const [room,setRoom]=useState('');
  const navigate = useNavigate(); // React Router Navigation Hook

  const goToChat=(e)=>{ //Go to chat room
    e.preventDefault(); //Since the button is inside a from , this line is necessary or else the state which we are sending to chatroom may be lost
    if(!userName||!room) {
      console.log('Username and name are mandatory ! ');
      return;
    }
    if(filter.isProfane(userName)||filter.isProfane(room)) {
      alert('Please avoid using bad words ! ');
      return;
    }
    console.log('Redirecting to Chatroom.jsx...');
    navigate('/chat',{ // Navigate to ChatRoom and take these states with you
      state:{
        userName,
        room
      }
    }); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-200 rounded-full opacity-50 blur-2xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-200 rounded-full opacity-50 blur-2xl" />

        <div className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100">
          {/* Header */}
          <div className="pt-8 pb-6 px-6 sm:px-8">
            <div className="flex justify-center mb-2">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">💬</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mt-4">Welcome to MangoChat</h1>
            <p className="text-center text-gray-500 mt-2 text-sm">Connect with others in real-time conversations</p>
          </div>

          {/* Form */}
          <div className="px-6 sm:px-8 pb-8">
            <form
            >
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    required
                    onChange={(e)=>setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Room Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. general, football, random"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    required
                    onChange={(e)=>setRoom(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={goToChat}
                className="w-full py-3.5 px-4 mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center"
              >
                <span className="mr-2">Join Chat Room</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-xs text-gray-500">
                <span className="inline-block animate-pulse"></span> Crafted by Jarrar 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
