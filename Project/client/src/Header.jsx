import { NavLink } from "react-router-dom";
import './Header.css';

export default function Header() {
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
            </ul>
        </nav>
    );
}