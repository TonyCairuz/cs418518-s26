import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import './App.css';
import Dashboard from "./Dashboard.jsx";
import Header from "./Header.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import VerifyEmail from "./VerifyEmail.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import VerifyOtp from "./VerifyOtp.jsx";
import Home from "./Home.jsx";
import AdvisingHistory from "./AdvisingHistory.jsx";
import AdvisingForm from "./AdvisingForm.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminAdvisingView from "./AdminAdvisingView.jsx";

function App() {

  return (
    <>
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/advising-history" element={<AdvisingHistory />} />
            <Route path="/advising-form" element={<AdvisingForm />} />
            <Route path="/advising-form/:id" element={<AdvisingForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/:id" element={<AdminAdvisingView />} />
          </Routes>
        </main>
      </Router>
    </>
  )
}

export default App
