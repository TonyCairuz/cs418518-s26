import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  function handleInputChange(identifier, value) {
    if (identifier === "email") setEnteredEmail(value);
    else setEnteredPassword(value);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    if (!enteredEmail.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    if (enteredPassword.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Call existing login API (NO CHANGE to backend)
      const res = await fetch(import.meta.env.VITE_API_KEY + "user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          u_email: enteredEmail,
          u_password: enteredPassword,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json?.message || "Login failed");
        return;
      }

      // Step 2: Check if token is returned (2FA disabled)
      if (json.token) {
        localStorage.setItem("loggedInUser", JSON.stringify(json.data));
        localStorage.setItem("token", json.token);
        navigate("/dashboard");
      } else {
        // Step 3: Store email temporarily and redirect to OTP page (2FA enabled)
        localStorage.setItem("pendingOtpEmail", enteredEmail);
        navigate("/verify-otp");
      }

    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const emailNotValid = submitted && !enteredEmail.includes("@");
  const passwordNotValid = submitted && enteredPassword.trim().length < 8;

  return (
    <div className="card-container">
      <h2 className="text-center mb-4">Sign In</h2>
      {error && <div className="error-text text-center">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className={emailNotValid ? "error-text" : ""}>Email</label>
          <input
            type="email"
            value={enteredEmail}
            className={emailNotValid ? "invalid" : ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <div className="mb-4">
          <label className={passwordNotValid ? "error-text" : ""}>Password</label>
          <input
            type="password"
            value={enteredPassword}
            className={passwordNotValid ? "invalid" : ""}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="button" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center">
            <Link to="/forgot-password" style={{ fontSize: '0.9rem' }}>Forgot Password?</Link>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', width: '100%', margin: '0.5rem 0' }} />

          <div className="text-center">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Don't have an account? </span>
            <Link to="/signup" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
              Create Account
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}