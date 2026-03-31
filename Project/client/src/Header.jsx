import { NavLink, useNavigate } from "react-router-dom";
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInUser");
        navigate("/login");
    };

    return (
        <nav className="header-nav">
            <ul>
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? "active-link" : ""}
                        end
                    >
                        Home
                    </NavLink>
                </li>
                {!token ? (
                    <>
                        <li>
                            <NavLink
                                to="/login"
                                className={({ isActive }) => isActive ? "active-link" : ""}
                            >
                                Login
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/signup"
                                className={({ isActive }) => isActive ? "active-link" : ""}
                            >
                                Sign Up
                            </NavLink>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => isActive ? "active-link" : ""}
                            >
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/advising-history"
                                className={({ isActive }) => isActive ? "active-link" : ""}
                            >
                                Course Advising
                            </NavLink>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}