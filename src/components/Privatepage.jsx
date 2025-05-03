import React, { useState, useRef, useEffect } from "react";
import io from 'socket.io-client';
import Filter from "bad-words";
const filter=new Filter();
//const backendLink="https://chatting-app-backend-3nb7.onrender.com"; //Backend link
const backendLink="http://localhost:5000"; //Backend link

function PrivatePage() {
  const [message,setMessage]=useState(""); //Message typed
  const [searchedUsers, setSearchedusers] = useState([]); // List of users from DB
  const [search, setSearch] = useState(""); // Search bar input
  const [noUserexists, setNouserexists] = useState(false); // If no users found
  const timeout = useRef(null); // For debounce
  const [currentName,setCurrentname]=useState(""); //Name of user ( with whom we are about to chat or are chatting )
  const [currentEmail,setCurrentemail]=useState(""); //Email of user ( with whom we are about to chat or are chatting )
  const [error,setError]=useState(''); //Any kind of error message
  const [listOfmsgs,setListofmsgs]=useState([]); //List of messages between user and current recipient
  const [chatHistory,setChatHistory]=useState([]); //Chat history of user
  const [loadingHistory,setLoadinghistory]=useState(false); //Msg (Loading chat history) will be displayed when history will be fetched
  const [historyNames,setHistorynames]=useState({}); //Names adn emails of those we chatted with
  const socketRef = useRef(null);

  useEffect(()=>{
    socketRef.current = io(`${backendLink}`, {
      transports: ["websocket"],   // 👈 Force websocket protocol
      secure: true,
    });
    const socket=socketRef.current;
    const email=sessionStorage.getItem('email');
    socket.on("connect", () => { //Directly sending msg to backend without scoket.on may cause issues bcz socket may not be fully connected in start
      console.log("🟢 Socket connected!");
      socket.emit("join_private_chat", { email }); // ✅ emit *after* connection
    });
    socket.on('recieve_private_msg',msgRecieved); //Listener called when user sends a message to recipient , called by backend
    setLoadinghistory(true); //Loading chat history msg
    getChatHistory(); //Get chat history
    return()=>{
      socket.disconnect(); //Disconnect the socket
    }
  },[]);

  const getChatHistory=async()=>{ //Fetch chat history
    const email=sessionStorage.getItem('email'); //Get sender email
    const reqs=await fetch(`${backendLink}/chatHistory?sender=${email}`); //Fetch chat history
    if(reqs.ok) { //Chat history exists for sender
      const resp=await reqs.json();
      setLoadinghistory(false); //Disable loading chat history msg
      setChatHistory(resp.findChat);
      setHistorynames(resp.names); //Names of users in chat history
      return;
    }
    setLoadinghistory(false); //Disable loading chat history msg
    console.log('Chat history does not exist for sender ! ');
    setChatHistory([]); //No chat history
    }

  const msgRecieved=(messageData)=>{ //Msg is recieved
    setListofmsgs((prev)=>[...prev,{senderEmail:currentEmail,recieverEmail:sessionStorage.getItem('email'),messages:[{sender:messageData.sender,reciever:messageData.reciever,message:messageData.message,timeStamp:new Date}]}]); //Add the message to the list of msgs
  };

  const sendMsg=async()=>{ //Send message to socket and also save in db
    if(filter.isProfane(message)) { //No bad words allowed
      setBadmsg(true); //Display no bad words allowed msg
      setTimeout(()=>setBadmsg(false),1500);
      return;
    }
    const email=sessionStorage.getItem('email'); //Retrieve email
    if(!email) { //Error retrieving email
      alert('Could not retrieve email ! ');
      return;
    }

    const reqs=await fetch(`${backendLink}/storeMsg`,{ //Save msg in DB
      method:'POST',
      headers:{
        'content-type':'application/json'
      },
      body:JSON.stringify({
        sender:email,
        reciever:currentEmail,
        recieverName:currentName,
        msg:message
      })
    });

    if(!reqs.ok) {
      setError(true); //Error saving msg
      setTimeout(()=>setError(false),1500);
      return;
    }
    console.log('Message saved in DB ! ');

    socketRef.current.emit('private_msg',{ //Send message through socket
      sender:email,
      recipient:currentEmail,
      message
    });
    setChatHistory((prev) => { //Push user in chat history if not present
      const exists = prev.some(
        (chat) =>
          (chat.senderEmail === email && chat.recieverEmail === currentEmail) ||
          (chat.senderEmail === currentEmail && chat.recieverEmail === email)
      );
      return exists ? prev : [...prev, { senderEmail: email, recieverEmail: currentEmail, recieverUserName: currentName }];
    });
    
    setHistorynames((prev) => { //Push user names in history names if not present
      const alreadyExists = Object.values(prev).some(
        (entry) => entry.email === currentEmail
      );
      if (alreadyExists) return prev;
    
      return {
        ...prev,
        [Object.keys(prev).length]: { name: currentName, email: currentEmail }
      };
    });
    
    
    setMessage(''); // Clear message input
  };

  const searchResults = async (value) => {
    if (value === "") {
      setNouserexists(false);
      setSearch("");
      setSearchedusers([]);
      return;
    }

    const email = sessionStorage.getItem("email");
    setSearch(value);

    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/listOfUsers?value=${value}&email=${email}`);
        if (res.ok) {
          const data = await res.json();
          setNouserexists(data.length === 0);
          setSearchedusers(data);
        } else {
          setNouserexists(true);
          setSearchedusers([]);
        }
      } catch (err) {
        console.log("❌ Error during search:", err);
        setNouserexists(true);
        setSearchedusers([]);
      }
    }, 500);
  };

  const currentChat=async(user)=>{ //With whom we are chatting or are bout to chat ( displayed on right )
    const email=sessionStorage.getItem('email'); //Retreive email
    setCurrentname(user.userName); //Set current username
    setCurrentemail(user.email); //Set current email
    //Fetch all msgs with the user we clicked
    const reqs=await fetch(`${backendLink}/chatWithUser?sender=${email}`);
    if(reqs.ok) {
      const resp=await reqs.json(); 
      setMessages(resp);
      return;
    }
    setMessages([]);
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        {/* App Header */}
        <div className="p-4 border-b font-bold text-green-600 text-lg">MangoChat - Private</div>

        {/* Profile */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 cursor-pointer bg-green-200 rounded-full flex items-center justify-center text-lg font-bold text-white">
            🧑
          </div>
          <div>
            <p className="font-semibold text-gray-800">You</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Search Contacts"
            className="w-full p-2 border rounded-lg text-sm"
            value={search}
            onChange={(e) => searchResults(e.target.value)}
          />
        </div>

        {/* Search Results or Chat List */}
        <div className="flex-1 overflow-y-auto">
          {search ? (
            searchedUsers.length > 0 ? (
              searchedUsers.map((user, index) => (
                <div key={index} onClick={()=>{currentChat(user);
                  setSearch(""); 
                }} className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b">
                  <p className="font-semibold text-gray-600">~{user.userName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              ))
            ) : noUserexists ? (
              <div className="p-4 text-center text-gray-500 text-sm">No user exists!</div>
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
            )
          ) : chatHistory.length === 0&&!loadingHistory ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              You haven’t chatted with anyone yet.
            </div>
          ) : (
            chatHistory.map((user, idx) => (
              <div onClick={()=>{
                setCurrentname(historyNames[idx].name);
                setCurrentemail(historyNames[idx].email)
              }} key={idx} className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b">
                <p className="font-bold text-gray-800">~{historyNames[idx].name}</p>
                <p className="text-xs text-gray-500">
                  {Array.isArray(user.messages) && user.messages.length > 0
                    ? user.messages[user.messages.length - 1].message
                    : "No messages yet"}
                </p>
              </div>
            ))
          )}
           {loadingHistory&&<p className="text-gray-800 font-bold text-sm">Loading chat history...</p>}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 bg-gray-50 flex flex-col">
      {currentEmail && currentName ? (
  <>
    <div className="p-4 border-b bg-white flex items-center justify-between">
      <p className="font-semibold text-gray-700">Chatting with {currentEmail} ({currentName})</p>
      <button
        className="text-red-500 text-sm hover:underline"
        onClick={() => {
          setCurrentemail('');
          setCurrentname('');
        }}
      >
        Cancel
      </button>
    </div>

    <div className="flex-1 p-4 overflow-y-auto space-y-2">
    {listOfmsgs.map((msgGroup, index) => (
  <React.Fragment key={index}>
    {msgGroup.messages.map((message, i) => {
      const sender = sessionStorage.getItem("email");
      const isMine = message.sender === sender;

      return (
        <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-xs px-4 py-2 rounded-xl shadow text-sm ${
              isMine ? "bg-green-100" : "bg-blue-200"
            }`}
          >
            <p className="font-bold text-gray-600">{isMine ? "You" : currentName}</p>
            <p className="text-gray-800">{message.message}</p>
            <p className="text-xs text-gray-400">{new Date(message.timeStamp).toLocaleTimeString()}</p>
          </div>
        </div>
      );
    })}
  </React.Fragment>
))}
</div>

    <div className="p-4 border-t bg-white flex items-center gap-2">
      <input
        type="text"
        placeholder="Type a message"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && message.trim() !== "") {
            sendMsg();
          }
        }}
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
      />
        <button
          onClick={sendMsg}
          disabled={message.trim() === ""}
          className={`px-4 py-2 rounded-full text-sm transition ${
            message.trim() === ""
              ? "bg-green-300 text-white cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          Send
        </button>

    </div>
  </>
) : (
  <>
    <div className="p-4 border-b bg-white flex items-center justify-between">
      <p className="font-semibold text-gray-700">No Chat Selected</p>
    </div>

    <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center text-gray-400">
      <p>Select a user to start chatting</p>
    </div>

    <div className="p-4 border-t bg-white flex items-center gap-2">
      <input
        type="text"
        placeholder="Type a message"
        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
        disabled
      />
      <button
        className="bg-green-300 text-white px-4 py-2 rounded-full text-sm cursor-not-allowed"
        disabled
      >
        Send
      </button>
    </div>
  </>
)}
        
      </div>
    </div>
  );
}

export default PrivatePage;
