import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import JoinRoom from './components/Joinroom'
import ChatRoom from './components/Chatroom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/chat" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
