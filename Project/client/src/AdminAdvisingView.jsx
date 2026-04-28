import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminAdvisingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [courses, setCourses] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    fetch(import.meta.env.VITE_API_KEY + `advising/admin/record/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status === 200) {
          setRecord(json.data.record);
          setCourses(json.data.courses);
        } else {
          setError(json.message || "Failed to load record");
        }
      })
      .catch(() => setError("Something went wrong"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (newStatus) => {
    if (!feedback.trim()) {
      setError("Please provide feedback before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(import.meta.env.VITE_API_KEY + `advising/admin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, feedback }),
      });
      const json = await res.json();
      if (res.ok) {
        navigate("/admin");
      } else {
        setError(json.message || "Submission failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card-container"><p className="text-center">Loading...</p></div>;

  return (
    <div className="card-container" style={{ maxWidth: "800px" }}>
      <button
        onClick={() => navigate("/admin")}
        style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.9rem", marginBottom: "1.5rem", padding: 0 }}
      >
        ← Back to All Records
      </button>

      <h2 style={{ marginBottom: "1.5rem" }}>Advising Record #{id}</h2>

      {error && <p className="error-text text-center">{error}</p>}

      {record && (
        <>
          {/* Student Info */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "1.5rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Student</p>
              <p style={{ fontWeight: 600, margin: "4px 0 0" }}>{record.u_first_name} {record.u_last_name}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Email</p>
              <p style={{ fontWeight: 600, margin: "4px 0 0" }}>{record.u_email}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Last Term</p>
              <p style={{ fontWeight: 600, margin: "4px 0 0" }}>{record.last_term}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Last GPA</p>
              <p style={{ fontWeight: 600, margin: "4px 0 0" }}>{record.last_gpa}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Advising Term</p>
              <p style={{ fontWeight: 600, margin: "4px 0 0" }}>{record.advising_term}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Current Status</p>
              <p style={{ fontWeight: 600, margin: "4px 0 0", color: record.status === "Approved" ? "#10b981" : record.status === "Rejected" ? "#ef4444" : "#f59e0b" }}>
                {record.status}
              </p>
            </div>
          </div>

          {/* Courses Table */}
          <h3 style={{ marginBottom: "1rem" }}>Requested Courses</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem", border: "1px solid var(--border-color)" }}>
            <thead>
              <tr style={{ background: "var(--bg-darker)" }}>
                <th style={{ padding: "10px", border: "1px solid var(--border-color)", color: "var(--text-main)", textAlign: "left" }}>Level</th>
                <th style={{ padding: "10px", border: "1px solid var(--border-color)", color: "var(--text-main)", textAlign: "left" }}>Course</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "10px", border: "1px solid var(--border-color)", color: "var(--text-main)" }}>{c.level}</td>
                  <td style={{ padding: "10px", border: "1px solid var(--border-color)", color: "var(--text-main)" }}>{c.course_name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Admin Decision */}
          {record.status === "Pending" ? (
            <>
              <h3 style={{ marginBottom: "1rem" }}>Admin Decision</h3>
              <div className="mb-4">
                <label>Feedback Message <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Provide detailed feedback for the student..."
                  style={{
                    width: "100%", padding: "12px", borderRadius: "8px",
                    background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
                    color: "var(--text-main)", resize: "vertical", fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  className="button"
                  onClick={() => handleSubmit("Approved")}
                  disabled={submitting}
                  style={{ flex: 1, background: "#10b981", borderColor: "#10b981" }}
                >
                  {submitting ? "Submitting..." : "✓ Approve"}
                </button>
                <button
                  className="button"
                  onClick={() => handleSubmit("Rejected")}
                  disabled={submitting}
                  style={{ flex: 1, background: "#ef4444", borderColor: "#ef4444" }}
                >
                  {submitting ? "Submitting..." : "✗ Reject"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "1.5rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Admin Feedback</h3>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>{record.feedback || "No feedback provided."}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
