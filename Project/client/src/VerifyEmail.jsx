import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function VerifyEmail() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const email = localStorage.getItem("pendingVerifyEmail") || "";

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setError("");

        if (!otp || otp.length !== 6) {
            setError("Please enter a 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(import.meta.env.VITE_API_KEY + "user/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const json = await res.json();
            if (!res.ok) {
                setError(json.message || "Verification failed");
                return;
            }

            localStorage.removeItem("pendingVerifyEmail");
            navigate("/login");
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-container">
            <h2 className="text-center mb-4">Verify Email</h2>
            <p className="text-center mb-4" style={{ color: 'var(--text-muted)' }}>
                We've sent a code to <b>{email}</b>
            </p>

            {error && <div className="error-text text-center">{error}</div>}

            <form onSubmit={handleVerifyEmail}>
                <div className="mb-4">
                    <label>6-Digit OTP</label>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                    />
                </div>

                <div className="actions">
                    <button className="button" type="submit" style={{ width: '100%' }} disabled={loading}>
                        {loading ? "Verifying..." : "Verify & Continue"}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <Link to="/login" style={{ fontSize: '0.9rem' }}>Back to Login</Link>
                </div>
            </form>
        </div>
    );
}
