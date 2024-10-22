import React from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import Navbar from "./Components/Navbar";
import DailyWeatherReport from "./Components/WeatherVisualization";
import WeatherSummary from "./Components/WeatherSummary";
import Alerts from "./Components/Alerts"; // Import the Alerts component

const App = () => {
    return (
        <Router>
            <div>
                <Navbar />
                <Routes>
                    {/* Redirect root path to daily weather report */}
                    <Route
                        path="/"
                        element={
                            <Navigate to="/daily-weather-report" replace />
                        }
                    />
                    <Route
                        path="/daily-weather-report"
                        element={<DailyWeatherReport />}
                    />
                    <Route
                        path="/weather-summary"
                        element={<WeatherSummary />}
                    />
                    <Route
                        path="/alerts" // Add this route for the Alerts component
                        element={<Alerts />}
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
