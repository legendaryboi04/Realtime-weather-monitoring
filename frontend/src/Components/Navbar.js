// src/Components/Navbar.js

import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css"; // Import the CSS file

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li>
                    <Link to="/daily-weather-report" className="navbar-link">
                        Daily Weather Report
                    </Link>
                </li>
                <li>
                    <Link to="/weather-summary" className="navbar-link">
                        Weather Summary
                    </Link>
                </li>
                <li>
                    <Link to="/alerts" className="navbar-link">
                        {" "}
                        {/* Added Alerts Link */}
                        Alerts
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
