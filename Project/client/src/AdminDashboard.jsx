import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    fetch(import.meta.env.VITE_API_KEY + "advising/admin/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status === 200) setRecords(json.data);
        else setError(json.message || "Failed to load records");
      })
      .catch(() => setError("Something went wrong"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const statusColor = (s) =>
    s === "Approved" ? "#10b981" : s === "Rejected" ? "#ef4444" : "#f59e0b";

  return (
    <div className="card-container" style={{ maxWidth: "900px" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Admin Portal — Advising Records</h2>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="error-text text-center">{error}</p>}

      {!loading && !error && (
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--border-color)" }}>
            <thead>
              <tr style={{ background: "var(--bg-darker)", textAlign: "left" }}>
                {["Student Name", "Term", "GPA", "Status"].map((h) => (
                  <th key={h} style={{ padding: "12px", border: "1px solid var(--border-color)", color: "var(--text-main)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No advising records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/admin/${r.id}`)}
                    style={{ cursor: "pointer", borderBottom: "1px solid var(--border-color)" }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-dark)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px", border: "1px solid var(--border-color)", color: "#60a5fa", fontWeight: 600 }}>
                      {r.u_first_name} {r.u_last_name}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid var(--border-color)", color: "var(--text-main)" }}>
                      {r.advising_term}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid var(--border-color)", color: "var(--text-main)" }}>
                      {r.last_gpa}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid var(--border-color)" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 600,
                        color: statusColor(r.status),
                        backgroundColor: `${statusColor(r.status)}1a`,
                        border: `1px solid ${statusColor(r.status)}`,
                      }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
