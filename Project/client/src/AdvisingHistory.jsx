import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css"; // Reuse existing styles or create new ones

export default function AdvisingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(import.meta.env.VITE_API_KEY + "advising/history", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const json = await res.json();
        if (res.ok) {
          setHistory(json.data);
        } else {
          setError(json.message || "Failed to load history");
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="card-container" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Course Advising History</h2>
        <Link to="/advising-form" className="button" style={{ textDecoration: 'none' }}>
          New Advising
        </Link>
      </div>

      {loading ? (
        <p className="text-center">Loading history...</p>
      ) : error ? (
        <p className="error-text text-center">{error}</p>
      ) : history.length === 0 ? (
        <p className="text-center" style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          No advising records found.
        </p>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', border: '1px solid var(--border-color)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-darker)', textAlign: 'left' }}>
                <th style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>Date</th>
                <th style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>Term</th>
                <th style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr 
                  key={record.id} 
                  onClick={() => navigate(`/advising-form/${record.id}`)}
                  style={{ cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid var(--border-color)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-dark)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>{formatDate(record.date)}</td>
                  <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>{record.advising_term}</td>
                  <td style={{ padding: '12px', border: '1px solid var(--border-color)' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: record.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : record.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: record.status === 'Approved' ? '#10b981' : record.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                      border: `1px solid ${record.status === 'Approved' ? '#10b981' : record.status === 'Rejected' ? '#ef4444' : '#f59e0b'}`
                    }}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
