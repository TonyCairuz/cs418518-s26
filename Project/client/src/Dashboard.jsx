import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ u_first_name: "", u_last_name: "" });
  const [passData, setPassData] = useState({ current_password: "", new_password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_KEY + "user/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setUser(json.data);
        setFormData({ u_first_name: json.data.u_first_name, u_last_name: json.data.u_last_name });
      } else {
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return setLoading(false);
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    navigate("/login", { replace: true });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch(import.meta.env.VITE_API_KEY + "user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage("Profile updated successfully!");
        setEditMode(false);
        fetchProfile();
      } else {
        setError("Failed to update profile.");
      }
    } catch (err) {
      setError("Error updating profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch(import.meta.env.VITE_API_KEY + "user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(passData)
      });
      const json = await res.json();
      if (res.ok) {
        setMessage("Password changed successfully!");
        setPassData({ current_password: "", new_password: "" });
      } else {
        setError(json.message || "Failed to change password.");
      }
    } catch (err) {
      setError("Error changing password.");
    }
  };

  if (loading) return (
    <div className="text-center" style={{ marginTop: '100px' }}>
      <p style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Loading profile...</p>
    </div>
  );

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>{user?.u_is_admin ? "Admin Dashboard" : "User Homepage"}</h2>
          <p style={{ margin: '5px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Logged in as <b>{user?.u_email}</b>
          </p>
        </div>
        <button onClick={handleLogout} className="button" style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', width: 'auto', padding: '8px 20px' }}>
          Logout
        </button>
      </header>

      {message && <div className="success-text text-center card-container" style={{ margin: '20px auto', padding: '15px' }}>{message}</div>}
      {error && <div className="error-text text-center card-container" style={{ margin: '20px auto', padding: '15px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <section className="card-container" style={{ margin: 0, maxWidth: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Profile</h3>
            {!editMode && <button className="button" style={{ width: 'auto', padding: '6px 15px', fontSize: '13px' }} onClick={() => setEditMode(true)}>Edit</button>}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label>First Name</label>
                <input type="text" value={formData.u_first_name} onChange={(e) => setFormData({ ...formData, u_first_name: e.target.value })} required />
              </div>
              <div className="mb-4">
                <label>Last Name</label>
                <input type="text" value={formData.u_last_name} onChange={(e) => setFormData({ ...formData, u_last_name: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="button" style={{ width: 'auto' }}>Save</button>
                <button type="button" className="button" style={{ width: 'auto', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FULL NAME</label>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>{user?.u_first_name} {user?.u_last_name}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UIN</label>
                <p style={{ margin: 0 }}>{user?.u_uin}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACCOUNT STATUS</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: user?.u_is_verified ? 'var(--primary)' : 'var(--error)' }}></span>
                  <p style={{ margin: 0, color: user?.u_is_verified ? 'var(--primary)' : 'var(--error)', fontWeight: '600', fontSize: '0.9rem' }}>
                    {user?.u_is_verified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="card-container" style={{ margin: 0, maxWidth: '100%' }}>
          <h3 className="mb-4">Security</h3>
          <form onSubmit={handleChangePassword} style={{ marginBottom: '2rem' }}>
            <div className="mb-4">
              <label>Current Password</label>
              <input type="password" value={passData.current_password} onChange={(e) => setPassData({ ...passData, current_password: e.target.value })} placeholder="••••••••" required />
            </div>
            <div className="mb-4">
              <label>New Password</label>
              <input type="password" value={passData.new_password} onChange={(e) => setPassData({ ...passData, new_password: e.target.value })} placeholder="Min. 8 characters" required />
            </div>
            <button type="submit" className="button" style={{ width: '100%' }}>Change Password</button>
          </form>

          <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0 }}>Two-Factor Authentication</h4>
              <p style={{ margin: '5px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Require an email OTP whenever you sign in.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: user?.u_2fa_enabled ? 'var(--primary)' : 'var(--text-muted)' }}>
                {user?.u_2fa_enabled ? "Enabled" : "Disabled"}
              </span>
              <button
                className="button"
                style={{
                  width: 'auto',
                  padding: '6px 15px',
                  fontSize: '13px',
                  background: user?.u_2fa_enabled ? 'var(--error)' : 'var(--primary)',
                  borderColor: user?.u_2fa_enabled ? 'var(--error)' : 'var(--primary)',
                  color: 'white'
                }}
                onClick={async () => {
                  try {
                    const res = await fetch(import.meta.env.VITE_API_KEY + "user/toggle-2fa", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                      },
                      body: JSON.stringify({ enabled: !user?.u_2fa_enabled })
                    });
                    if (res.ok) {
                      setMessage(`2FA ${!user?.u_2fa_enabled ? 'enabled' : 'disabled'} successfully!`);
                      fetchProfile();
                    } else {
                      setError("Failed to update 2FA setting.");
                    }
                  } catch (err) {
                    setError("Error updating 2FA setting.");
                  }
                }}
              >
                {user?.u_2fa_enabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {user?.u_is_admin && (
        <section className="card-container" style={{
          margin: '2rem 0',
          maxWidth: '100%',
          border: '1px solid var(--primary)',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--primary)', fontSize: '24px' }}>🛡️</span>
            </div>
            <h3 style={{ margin: 0 }}>Admin Panel</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Welcome to the management interface. As an administrator, you have access to student records and advising workflows.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="button" onClick={() => navigate("/admin")} style={{ width: 'auto', padding: '10px 20px' }}>Manage Users</button>
            <button className="button" onClick={() => navigate("/admin")} style={{ width: 'auto', padding: '10px 20px', background: 'rgba(51, 65, 85, 0.5)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>View Reports</button>
          </div>
        </section>
      )}
    </div>
  );
}