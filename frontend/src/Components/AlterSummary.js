import React, { useState } from "react";
import axios from "axios";
import "../styles/AlertSummary.css";

const AlertSummary = () => {
    const cities = [
        "delhi",
        "mumbai",
        "bangalore",
        "chennai",
        "kolkata",
        "hyderabad",
    ];
    const [city, setCity] = useState(""); // City from form
    const [date, setDate] = useState(""); // Date from form
    const [alerts, setAlerts] = useState([]); // Store alerts
    const [error, setError] = useState(null); // Store error message

    // Function to fetch alerts based on city and date
    const fetchAlerts = async () => {
        if (!city || !date) {
            setError("Please select a city and date.");
            return;
        }
        try {
            const response = await axios.get(
                `http://localhost:5000/alerts/summary?city=${city}&date=${date}`
            );
            setAlerts(response.data); // Store alerts in state
            setError(null); // Clear any previous errors
        } catch (err) {
            setError("Error fetching alert summary."); // Set error message
        }
    };

    return (
        <div className="alert-summary-container">
            <h2>Alert Summary</h2>
            <div className="alert-summary-form">
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="">Select City</option>
                    {cities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                            {cityName}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <button onClick={fetchAlerts}>Fetch Alerts</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            {alerts.length > 0 && (
                <table className="alert-summary-table">
                    <thead>
                        <tr>
                            <th>Alert Message</th>
                            <th>Datetime</th>
                            <th>City</th>
                            <th>Max Threshold</th>
                            <th>Min Threshold</th>
                            <th>Current Temp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map((alert) => (
                            <tr key={alert._id}>
                                <td>{alert.alertMessage}</td>
                                <td>
                                    {new Date(alert.datetime).toLocaleString()}
                                </td>
                                <td>{alert.city}</td>
                                <td>{alert.maxThreshold} °C</td>
                                <td>{alert.minThreshold} °C</td>
                                <td>{alert.currentTemp} °C</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AlertSummary;
