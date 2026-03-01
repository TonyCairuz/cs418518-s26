import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // reuse your existing styles

export default function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    // Email stored during login success
    const email = localStorage.getItem("pendingOtpEmail") || "";

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setError("");

        if (!email) {
            setError("No pending login found. Please login again.");
            return;
        }

        const cleanedOtp = otp.trim();

        // Basic validation (6 digits)
        if (!/^\d{6}$/.test(cleanedOtp)) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                import.meta.env.VITE_API_KEY + "user/verify-login-otp",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        otp: cleanedOtp,
                    }),
                }
            );

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(json?.message || "OTP verification failed");
                return;
            }

            const user = json?.data ?? null;
            if (!user) {
                setError("OTP verified but user data was missing.");
                return;
            }

            // ✅ Now user is authenticated → store and redirect
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            localStorage.setItem("token", json.token);
            localStorage.removeItem("pendingOtpEmail");

            navigate("/dashboard");
        } catch (err) {
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const otpNotValid = submitted && !/^\d{6}$/.test(otp.trim());

    return (
        <div className="card-container">
            <h2 className="text-center mb-4">OTP Verification</h2>
            <p className="text-center mb-4" style={{ color: 'var(--text-muted)' }}>
                Enter the 6-digit code sent to <b>{email}</b>
            </p>

            {error && <div className="error-text text-center">{error}</div>}

            <form onSubmit={handleVerifyOtp}>
                <div className="mb-4">
                    <label className={otpNotValid ? "error-text" : ""}>One-Time Password</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        className={otpNotValid ? "invalid" : ""}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                    />
                </div>

                <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="button" type="submit" style={{ width: '100%' }} disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <div className="text-center">
                        <Link to="/login" style={{ fontSize: '0.9rem' }}>Back to Login</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}