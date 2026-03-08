import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            padding: '0 20px'
        }}>
            <div className="card-container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    color: 'var(--primary)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}>
                    CS418 Project
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    color: 'var(--text-muted)',
                    marginBottom: '2.5rem',
                    lineHeight: '1.6'
                }}>
                    Welcome to my semester project. This is a secure course advising platform
                    built with React, Node.js, and MySQL. Use the navigation to explore features
                    like secure registration, 2FA login, and profile management.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <Link to="/signup" className="button" style={{ width: 'auto', padding: '12px 30px' }}>
                        Get Started
                    </Link>
                    <Link to="/login" className="button" style={{
                        width: 'auto',
                        padding: '12px 30px',
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)'
                    }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
