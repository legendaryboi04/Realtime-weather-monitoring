// src/WeatherVisualization.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/WeatherVisualization.css"; // Import the CSS file

const WeatherVisualization = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [city, setCity] = useState(""); // Start with an empty city field
    const [date, setDate] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [tempScale, setTempScale] = useState("C"); // State for temperature scale
    const [error, setError] = useState(""); // State for error message

    // Sample list of cities for the dropdown
    const cities = [
        "delhi",
        "mumbai",
        "bangalore",
        "chennai",
        "kolkata",
        "hyderabad",
    ];

    useEffect(() => {
        fetchWeatherData(); // Fetch all data initially
    }, []);

    const fetchWeatherData = async (
        selectedCity = city,
        selectedDate = date
    ) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/weather?appid=${process.env.REACT_APP_API_KEY}&city=${selectedCity}&date=${selectedDate}`
            );
            setWeatherData(response.data);
            setFilteredData(response.data); // Initialize with all data
        } catch (error) {
            console.error("Error fetching weather data:", error);
            setFilteredData([]); // Set filtered data to an empty array on error
        }
    };

    const handleFilter = () => {
        // Validate both city and date fields
        if (!city || !date) {
            setError("Both city and date are required.");
            return; // Prevent further execution if validation fails
        }
        setError(""); // Clear any previous error message
        fetchWeatherData(city, date); // Fetch filtered data based on city and date
    };

    // Convert temperature based on the selected scale
    const convertTemperature = (temp) => {
        switch (tempScale) {
            case "F":
                return (temp * 9) / 5 + 32; // Convert to Fahrenheit
            case "K":
                return temp + 273.15; // Convert to Kelvin
            default:
                return temp; // Return Celsius as is
        }
    };

    // Prepare data for chart (use empty data if there's no available data)
    const chartData = {
        labels: filteredData.length
            ? filteredData.map((item) => new Date(item.dt).toLocaleTimeString())
            : ["No Data"],
        datasets: [
            {
                label: `Temperature (${tempScale})`, // Update label to reflect the scale
                data: filteredData.length
                    ? filteredData.map((item) => convertTemperature(item.temp)) // Convert temp for display
                    : [0], // Show 0 if no data
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
        ],
    };

    // Chart options to configure x-axis
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time",
                },
            },
            y: {
                title: {
                    display: true,
                    text: `Temperature (${tempScale})`, // Update y-axis title
                },
            },
        },
    };

    return (
        <div className="weather-container">
            <div className="weather-card">
                <h1>Daily Weather Report</h1>
                <div className="filters">
                    <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <option value="" disabled>
                            Choose City
                        </option>{" "}
                        {/* Placeholder option */}
                        {cities.map((cityName) => (
                            <option key={cityName} value={cityName}>
                                {cityName.charAt(0).toUpperCase() +
                                    cityName.slice(1)}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <select
                        value={tempScale}
                        onChange={(e) => setTempScale(e.target.value)} // Handle scale change
                    >
                        <option value="C">Celsius</option>
                        <option value="F">Fahrenheit</option>
                        <option value="K">Kelvin</option>
                    </select>
                    <button onClick={handleFilter}>Filter</button>
                </div>
                {error && <div className="error-message">{error}</div>}{" "}
                {/* Display error message */}
                {filteredData.length === 0 && (
                    <div className="no-data-message">
                        Data not available for the selected city and date.
                    </div>
                )}
                <div style={{ width: "100%", height: "400px" }}>
                    <Bar data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default WeatherVisualization;
