import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import JoinRoom from './components/Joinroom'
import ChatRoom from './components/Chatroom';
import LoginPage from './components/login';
import SignupPage from './components/signup';
import HomePage from './components/Home';
import PrivatePage from './components/Privatepage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/private-chat" element={<PrivatePage />} />
        <Route path="/joinroom" element={<JoinRoom />} />
        <Route path="/chat" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
