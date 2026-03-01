import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1); // 1: email, 2: otp + new password
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(import.meta.env.VITE_API_KEY + "user/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.message);
            setStep(2);
            setMessage("OTP sent to your email.");
        } catch (err) {
            setError("Failed to send OTP.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(import.meta.env.VITE_API_KEY + "user/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, new_password: newPassword }),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.message);
            setMessage("Password reset successful! Redirecting...");
            setTimeout(() => window.location.href = "/login", 2000);
        } catch (err) {
            setError("Failed to reset password.");
        }
    };

    return (
        <div className="card-container">
            <h2 className="text-center mb-4">Reset Password</h2>

            {message && <p className="success-text text-center">{message}</p>}
            {error && <p className="error-text text-center">{error}</p>}

            {step === 1 ? (
                <form onSubmit={handleSendOtp}>
                    <div className="mb-4">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <button className="button" type="submit" style={{ width: '100%' }}>Send Reset Link</button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <label>Verification Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit code"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            required
                        />
                    </div>
                    <button className="button" type="submit" style={{ width: '100%' }}>Update Password</button>
                </form>
            )}

            <div className="text-center mt-4">
                <Link to="/login" style={{ fontSize: '0.9rem' }}>Back to Login</Link>
            </div>
        </div>
    );
}
