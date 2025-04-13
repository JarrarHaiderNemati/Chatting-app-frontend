import { useLocation } from "react-router-dom";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react"; //For bookmarks (bottom of page)
import Filter from 'bad-words';
const filter=new Filter();
import io from 'socket.io-client';
const msgSound=new Audio('/message.mp3'); //Sound effect for a new message
const sendSound=new Audio('/pop-sound.mp3'); //Sound effect for sending a msg

export default function ChatRoom() {
  
  const {state}=useLocation(); //Recieve the package from frontend
  const [message,setMessage]=useState(''); //For storing the value of input field where message is typed
  const [messages,setMessages]=useState([]); //List of messages from backends
  const socketRef=useRef(null); //Socket can be accessed anywhere , no matter where it is initizlied
  const navigate=useNavigate();
  const messagesEndref=useRef(null);
  const [listOfUsers,setList]=useState([]); //Array to store the online users list
  const [typingUser,setTypinguser]=useState(''); //Who is typing

  const handleVisibilityChange=()=>{ //Socket will disconnect once user minimizes tab and then will be taken to join page again when opened
    if(document.visibilityState==='hidden') {
      console.log('🔕 Tab hidden or minimized. Disconnecting...');
      socketRef.current.disconnect(); // Disconnect the socket
      navigate('/'); // Redirect to join page
    }
  }

  // Listen for tab visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  const typingTimeoutRef = useRef(null); // 👈 useRef to track the timeout
  useEffect(() => {
    //Initilaize the current socket
    socketRef.current = io("https://chatting-app-backend-3nb7.onrender.com", {
      transports: ["websocket"],   // 👈 Force websocket protocol
      secure: true,
    });
     //Dont intitilaize socket outside because re-redners may cause mulitple socket instacnes and duplicate messages
    const socket=socketRef.current;
    if (!state) {
      console.log('State missing. Redirecting...');
      navigate('/');
      return;
    }
  
    const { userName, room } = state;
  
    // Join the room
    socket.emit('join_room', { userName, room });
  
    // Handle received chat message
    const handleMessage = (msgData) => {
      if(msgData.userName!==userName) { //Play the sound effect on others messages
          msgSound.pause(); //In case the sound is already playing
          msgSound.currentTime=0; //Reset the audio ( to be played from start again)
          msgSound.play(); //Play the message sound effect
      }
      setMessages((prev) => [...prev, msgData]);
    };
  
    // Handle user joined message
    const handleUserJoined = (msg) => {
      setMessages((prev) => [...prev, { userName: 'System', message: msg }]);
    };

    // Handle user joined message
    const handleUserLeft= (msg)=>{
      setMessages((prev)=>[...prev,{userName:'System',message:msg}]);
    }

    //List of users online
    const handleUsersDisplayed=(list)=>{
      setList(Object.values(list)); //Convert the backend data into an array and set it equal to list in frotnend
    };

    //Who is typing
    const displayTyping = (msg) => {
      setTypinguser(msg); // Show who is typing
    
      // Clear the previous timeout if still running
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    
      // Set a new timeout
      typingTimeoutRef.current = setTimeout(() => {
        setTypinguser('');
      }, 1500);
    };
  
    // Register listeners ONCE
    socket.on('receive_message', handleMessage); 
    socket.on('user_joined', handleUserJoined);
    socket.on('online_list',handleUsersDisplayed);
    socket.on('user_left',handleUserLeft);
    socket.on('typing_list',displayTyping);
  
    // Cleanup on unmount
    return () => {
      socket.off('receive_message', handleMessage); //Removes the socket and function associated with it
      socket.off('user_joined', handleUserJoined);
      socket.off('online_list',handleUsersDisplayed);
      socket.off('typing_list',displayTyping);
      socket.disconnect(); //fully remove the socket
      clearTimeout(typingTimeoutRef.current); // ⛔ prevent leftover timeouts
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  

  useEffect(()=>{
    messagesEndref.current?.scrollIntoView({behavior:'smooth'}); //Scroll into view the bookram (ref) when a new message arrives
  },[messages])

  if(!state) return null; //Dont render anything if state is null
  const {userName,room}=state||{}; //Extract userName and room from it

  const sendMessage=()=>{ //Send message function
    console.log('Inside sendMessage()');
    if(message.trim()==='') return;
    if(filter.isProfane(message)) {
      alert('Please avoid bad words ! ');
      return;
    }
    
    const msgData={ //Create an object with the required parameters for the backend socket of recieving messages
      userName:userName,
      room:room,
      message:message,
      timeStamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    
    setMessage(''); //Clear the message variable
    socketRef.current.emit('send_message',msgData); //Call the socket endpoint
    sendSound.pause(); //In case already playing
    sendSound.currentTime=0; //Reset the start time
    sendSound.play(); //Play the send sound effect
  };

  const typingIndicator=(value)=>{ //Displays who is typing
    setMessage(value); //Set the message to the input onchnage in input field
    socketRef.current.emit('typing',{userName,room});
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">

      {/* Header */}
      <div className="bg-white shadow-md py-4 px-6 flex items-center justify-between border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">💬 MangoChat - {room} Room</h2>
        <button onClick={()=>navigate('/')} className="text-gray-500 hover:text-red-500 transition">🚪 Leave</button>
      </div>

      {/* Side bar to show online users */}
      <div className="px-6 py-2 text-sm text-gray-600 font-medium">
        Online Users:
        <div className="flex flex-wrap gap-2 mt-1">
            {
              listOfUsers.filter(user=>user.room===room)
              .flatMap(user=>
                user.users.map((name,idx)=>
                name===userName?(
                  <div key={`${user.room}-${idx}`} className="px-2 py-1 bg-white rounded-md shadow text-xs">
                      You
                  </div>
                ):(
                  <div key={`${user.room}-${idx}`} className="px-2 py-1 bg-white rounded-md shadow text-xs">
                      {name}
                  </div>
                )
                )
              )
            }
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          msg.userName === 'System' ? (
            <div key={index} className="text-center text-gray-500 text-sm italic">
              {msg.message}
            </div>
          ) : (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                msg.userName === userName ? 'justify-end' : ''
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl shadow text-sm ${
                  msg.userName === userName
                    ? 'bg-purple-100 text-purple-900'
                    : 'bg-blue-100 text-blue-900'
                }`}
              >
                <p>
                  <strong>{msg.userName === userName ? 'You' : msg.userName}:</strong>{' '}
                  {msg.message}
                  <span className="text-xs text-gray-400 ml-2">
                    {msg.timeStamp}
                  </span>
                </p>
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndref} />
        {typingUser&&(
          <div className="text-sm text-gray-500 italic">{typingUser}</div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white py-3 px-6 flex items-center border-t border-gray-200">
        <input
          type="text"
          value={message}
          onChange={(e)=>typingIndicator(e.target.value)}
          onKeyDown={(e)=>e.key==='Enter'&&sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
        />
        <button onClick={sendMessage} className="ml-3 bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 transition">
          ➤
        </button>
      </div>
    </div>
  );
}
