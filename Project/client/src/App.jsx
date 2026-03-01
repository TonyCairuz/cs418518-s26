import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import './App.css';
import Dashboard from "./Dashboard.jsx";
import Header from "./Header.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import VerifyEmail from "./VerifyEmail.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import VerifyOtp from "./VerifyOtp.jsx";

function App() {

  return (
    <>
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </main>
      </Router>
    </>
  )
}

export default App
