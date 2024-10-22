import React, { useState } from "react";
import axios from "axios";
import "../styles/Alerts.css"; // Import the CSS file
import AlertSummary from "./AlterSummary"; // Import the AlertSummary component

const Alerts = () => {
    const cities = [
        "delhi",
        "mumbai",
        "bangalore",
        "chennai",
        "kolkata",
        "hyderabad",
    ];
    const [city, setCity] = useState(""); // City from form
    const [maxThreshold, setMaxThreshold] = useState(""); // Max Threshold from form
    const [minThreshold, setMinThreshold] = useState(""); // Min Threshold from form
    const [alert, setAlert] = useState(null); // Store alert message or error
    const [intervalId, setIntervalId] = useState(null); // Store interval ID to stop polling

    // Function to send the GET request to the backend
    const fetchAlert = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/alerts?city=${city}&maxThreshold=${maxThreshold}&minThreshold=${minThreshold}`
            );
            console.log("started");
            // If the status code is 200, everything is fine
            if (response.status === 200) {
                setAlert(response.data.message); // Display success message
            }
        } catch (error) {
            if (error.response) {
                // Error returned from the server
                setAlert(
                    error.response.data.error || "Error fetching weather data"
                );
            } else {
                // Other errors (e.g., network)
                setAlert("Failed to connect to the server.");
            }
        }
    };

    // Function to start the monitoring process every 5 seconds
    const startMonitoring = () => {
        if (!city || !maxThreshold || !minThreshold) {
            setAlert("Please fill all the fields.");
            return;
        }
        setAlert("Monitoring started...");
        // Start polling every 5 mins
        const id = setInterval(fetchAlert, 600000);
        setIntervalId(id);

        // Fetch immediately
        fetchAlert();
    };

    // Function to stop monitoring
    const stopMonitoring = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setAlert("Monitoring stopped."); // Set alert message to indicate monitoring has stopped
            setIntervalId(null);
        }
    };

    return (
        <>
            <div className="alerts-container">
                <h1>Alerts</h1> {/* Title Outside the Card */}
                <div className="alerts-card">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-row">
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            >
                                <option value="">Select City</option>
                                {cities.map((cityName) => (
                                    <option key={cityName} value={cityName}>
                                        {cityName}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Max Threshold (°C)"
                                value={maxThreshold}
                                onChange={(e) =>
                                    setMaxThreshold(e.target.value)
                                }
                            />
                            <input
                                type="number"
                                placeholder="Min Threshold (°C)"
                                value={minThreshold}
                                onChange={(e) =>
                                    setMinThreshold(e.target.value)
                                }
                            />
                        </div>
                        <div className="button-row">
                            <button
                                type="button"
                                className="start"
                                onClick={startMonitoring}
                            >
                                Start Monitoring
                            </button>
                            <button
                                type="button"
                                className="stop"
                                onClick={stopMonitoring}
                                disabled={!intervalId}
                            >
                                Stop Monitoring
                            </button>
                        </div>
                    </form>
                </div>
                {alert && (
                    <div className="alert-message">
                        <strong>{alert}</strong>
                    </div>
                )}
            </div>
            <AlertSummary />
        </>
    );
};

export default Alerts;
