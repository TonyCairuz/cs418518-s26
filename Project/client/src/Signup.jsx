import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup({ onRegister }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    uin: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!/^\d{9}$/.test(form.uin)) e.uin = "UIN must be 9 digits";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  }

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);

    if (Object.keys(v).length === 0) {
      try {
        const res = await fetch(import.meta.env.VITE_API_KEY + "user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            u_first_name: form.firstName,
            u_last_name: form.lastName,
            u_uin: form.uin,
            u_email: form.email.toLowerCase(),
            u_password: form.password,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          setErrors({ form: json.message });
          return;
        }

        localStorage.setItem("pendingVerifyEmail", form.email.toLowerCase());
        navigate("/verify-email");

      } catch (err) {
        setErrors({ form: "Registration failed. Please try again." });
      }
    }
  }

  return (
    <div className="card-container" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4">Create Account</h2>
      {errors.form && <p className="error-text text-center">{errors.form}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mb-4">
          <div>
            <label>First Name</label>
            <input
              className={errors.firstName ? "invalid" : ""}
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="John"
            />
            {errors.firstName && <span className="error-text" style={{ fontSize: '12px' }}>{errors.firstName}</span>}
          </div>
          <div>
            <label>Last Name</label>
            <input
              className={errors.lastName ? "invalid" : ""}
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Doe"
            />
            {errors.lastName && <span className="error-text" style={{ fontSize: '12px' }}>{errors.lastName}</span>}
          </div>
        </div>

        <div className="mb-4">
          <label>UIN (9 Digits)</label>
          <input
            className={errors.uin ? "invalid" : ""}
            value={form.uin}
            onChange={(e) => updateField("uin", e.target.value)}
            placeholder="123456789"
          />
          {errors.uin && <span className="error-text" style={{ fontSize: '12px' }}>{errors.uin}</span>}
        </div>

        <div className="mb-4">
          <label>Email Address</label>
          <input
            type="email"
            className={errors.email ? "invalid" : ""}
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="john@example.com"
          />
          {errors.email && <span className="error-text" style={{ fontSize: '12px' }}>{errors.email}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mb-4">
          <div>
            <label>Password</label>
            <input
              type="password"
              className={errors.password ? "invalid" : ""}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-text" style={{ fontSize: '12px' }}>{errors.password}</span>}
          </div>
          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              className={errors.confirmPassword ? "invalid" : ""}
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <span className="error-text" style={{ fontSize: '12px' }}>{errors.confirmPassword}</span>}
          </div>
        </div>

        <button className="button" type="submit" style={{ width: '100%', marginTop: '1rem' }}>
          Create Account
        </button>

        <div className="text-center mt-4">
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}


