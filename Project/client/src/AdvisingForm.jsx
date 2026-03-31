import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";

export default function AdvisingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [lastTerm, setLastTerm] = useState("");
  const [lastGPA, setLastGPA] = useState("");
  const [advisingTerm, setAdvisingTerm] = useState("");
  const [courses, setCourses] = useState([{ level: "", course_name: "" }]);
  const [status, setStatus] = useState("Pending");

  const [availableCourses, setAvailableCourses] = useState([]);
  const [takenCourses, setTakenCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isFrozen = status === "Approved" || status === "Rejected";
  
  const TERMS = [
    "Spring 2023", "Summer 2023", "Fall 2023",
    "Spring 2024", "Summer 2024", "Fall 2024",
    "Spring 2025", "Summer 2025", "Fall 2025"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch available courses for dropdown
        const availRes = await fetch(import.meta.env.VITE_API_KEY + "advising/available-courses", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const availJson = await availRes.json();
        if (availRes.ok) setAvailableCourses(availJson.data);

        // Fetch taken courses for validation
        const takenUrl = import.meta.env.VITE_API_KEY + "advising/taken-courses" + (isEditing ? `?exclude_id=${id}` : "");
        const takenRes = await fetch(takenUrl, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const takenJson = await takenRes.json();
        if (takenRes.ok) setTakenCourses(takenJson.data.map(c => c.course_name));

        // If editing, fetch record details
        if (isEditing) {
          const recordRes = await fetch(import.meta.env.VITE_API_KEY + `advising/record/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const recordJson = await recordRes.json();
          if (recordRes.ok) {
            const data = recordJson.data;
            setLastTerm(data.last_term);
            setLastGPA(data.last_gpa);
            setAdvisingTerm(data.advising_term);
            setCourses(data.courses.length > 0 ? data.courses : [{ level: "", course_name: "" }]);
            setStatus(data.status);
          } else {
            setError(recordJson.message || "Failed to load record");
          }
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, navigate]);

  const handleAddRow = () => {
    if (isFrozen) return;
    setCourses([...courses, { level: "", course_name: "" }]);
  };

  const handleRemoveRow = (index) => {
    if (isFrozen) return;
    if (courses.length > 1) {
      const newCourses = courses.filter((_, i) => i !== index);
      setCourses(newCourses);
    }
  };

  const handleCourseChange = (index, field, value) => {
    if (isFrozen) return;
    const newCourses = [...courses];
    newCourses[index][field] = value;
    setCourses(newCourses);
  };

  const validateForm = () => {
    if (!lastTerm || !lastGPA || !advisingTerm) {
      setError("Please fill all header fields.");
      return false;
    }

    if (courses.some(c => !c.level || !c.course_name)) {
      setError("Please select both level and course name for all rows.");
      return false;
    }

    // Rule: Prevent re-selecting courses taken in the "last term"
    const duplicates = courses.filter(c => takenCourses.includes(c.course_name));
    if (duplicates.length > 0) {
      setError(`Cannot add courses already taken: ${duplicates.map(d => d.course_name).join(", ")}`);
      return false;
    }

    const gpa = parseFloat(lastGPA);
    if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
      setError("GPA must be between 0.0 and 4.0.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFrozen) return;
    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const url = isEditing 
        ? import.meta.env.VITE_API_KEY + `advising/update/${id}`
        : import.meta.env.VITE_API_KEY + "advising/submit";
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          last_term: lastTerm,
          last_gpa: lastGPA,
          advising_term: advisingTerm,
          courses
        })
      });

      const json = await res.json();
      if (res.ok) {
        navigate("/advising-history");
      } else {
        setError(json.message || "Submission failed");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center">Loading form...</p>;

  return (
    <div className="card-container" style={{ maxWidth: '800px', width: '90%' }}>
      <h2 className="text-center">{isEditing ? `Course Advising Record (#${id})` : "New Course Advising"}</h2>
      {error && <div className="error-text text-center" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', background: 'var(--bg-dark)' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>History</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            <div className="mb-4">
              <label>Last Term</label>
              <select 
                value={lastTerm ?? ""} 
                onChange={(e) => setLastTerm(e.target.value)}
                disabled={isFrozen}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-darker)', color: 'var(--text-main)' }}
              >
                <option value="">Select Term</option>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label>Last GPA (0.0 - 4.0)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                max="4"
                value={lastGPA ?? ""} 
                onChange={(e) => setLastGPA(e.target.value)}
                disabled={isFrozen}
                placeholder="e.g. 3.50"
              />
            </div>
            <div className="mb-4">
              <label>Current Term</label>
              <select 
                value={advisingTerm ?? ""} 
                onChange={(e) => setAdvisingTerm(e.target.value)}
                disabled={isFrozen}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-darker)', color: 'var(--text-main)' }}
              >
                <option value="">Select Term</option>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px', background: 'var(--bg-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Course Plan</h3>
            <button 
              type="button" 
              onClick={handleAddRow} 
              className="button"
              style={{ padding: '0', borderRadius: '50%', width: '32px', height: '32px', minWidth: '32px' }}
              disabled={isFrozen}
            >
              +
            </button>
          </div>

          {courses.map((course, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '1rem', alignItems: 'end', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: index < courses.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
              <div className="mb-4" style={{ marginBottom: 0 }}>
                <label>Level</label>
                <select 
                  value={course.level} 
                  onChange={(e) => handleCourseChange(index, "level", e.target.value)}
                  disabled={isFrozen}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-darker)', color: 'var(--text-main)' }}
                >
                  <option value="">Select Level</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div className="mb-4" style={{ marginBottom: 0 }}>
                <label>Course Name</label>
                <select 
                  value={course.course_name} 
                  onChange={(e) => handleCourseChange(index, "course_name", e.target.value)}
                  disabled={isFrozen}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-darker)', color: 'var(--text-main)' }}
                >
                  <option value="">Select Course</option>
                  {availableCourses
                    .filter(c => (!course.level || c.level === course.level) && !takenCourses.includes(c.course_name))
                    .map(c => (
                      <option key={c.id} value={c.course_name}>{c.course_name}</option>
                    ))
                  }
                </select>
              </div>
              <button 
                type="button" 
                onClick={() => handleRemoveRow(index)} 
                className="button" 
                style={{ background: 'var(--error)', marginBottom: '0', height: '42px', color: 'white' }}
                disabled={isFrozen || courses.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          {!isFrozen && (
            <button className="button" type="submit" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Advising"}
            </button>
          )}
          <button type="button" className="button" style={{ background: 'var(--border-color)', color: 'var(--text-main)', flex: 1 }} onClick={() => navigate("/advising-history")}>
            Back to History
          </button>
        </div>
      </form>
    </div>
  );
}
