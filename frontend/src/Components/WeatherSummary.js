import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/WeatherSummary.css"; // Import the CSS file

const WeatherSummary = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [city, setCity] = useState(""); // Start with an empty city field
    const [month, setMonth] = useState(1); // Store the selected month number
    const [year, setYear] = useState(new Date().getFullYear()); // Optional: Store the selected year
    const [error, setError] = useState(""); // State for error messages

    // Sample list of cities for the dropdown
    const cities = [
        "delhi",
        "mumbai",
        "bangalore",
        "chennai",
        "kolkata",
        "hyderabad",
    ];

    // Days in each month (assuming February has 28 days)
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Fetch weather data only when the user clicks the filter button
    const fetchWeatherData = async (
        selectedCity,
        selectedMonth,
        selectedYear
    ) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/weather/summary?city=${selectedCity}&month=${
                    selectedMonth % 13
                }&year=${selectedYear}`
            );
            console.log("Fetched weather data:", response.data);
            setWeatherData(response.data);
            setError(""); // Clear any previous errors
        } catch (error) {
            console.error("Error fetching weather data:", error);
            setWeatherData([]); // Clear data if error occurs
            setError("No data available for the selected city and month."); // Set error message for fetching error
        }
    };

    const handleFilter = () => {
        // Validate both city and month fields
        if (!city || !month) {
            setError("Select a valid city and month to fetch weather data."); // Set the error message
            setWeatherData([]); // Clear the weather data
            return; // Prevent further execution if validation fails
        }
        fetchWeatherData(city, month, year); // Fetch filtered data based on city, month, and year
    };

    // Prepare data for temperature charts
    const chartData = {
        labels: weatherData.length
            ? weatherData.map((item) => new Date(item.date).getDate()) // Use only the days of the month
            : ["No Data"], // Show "No Data" if no weather data exists
        datasets: [
            {
                label: "Max Temperature (°C)",
                data: weatherData.length
                    ? weatherData.map((item) => item.maxTemp)
                    : [0], // Show 0 if no data
                borderColor: weatherData.length
                    ? "rgba(255, 99, 132, 1)"
                    : "rgba(255, 0, 0, 1)", // Change to red if no data
                backgroundColor: weatherData.length
                    ? "rgba(255, 99, 132, 0.2)"
                    : "rgba(255, 0, 0, 0.2)", // Change to red if no data
                fill: true,
            },
            {
                label: "Min Temperature (°C)",
                data: weatherData.length
                    ? weatherData.map((item) => item.minTemp)
                    : [0],
                borderColor: weatherData.length
                    ? "rgba(54, 162, 235, 1)"
                    : "rgba(255, 0, 0, 1)", // Change to red if no data
                backgroundColor: weatherData.length
                    ? "rgba(54, 162, 235, 0.2)"
                    : "rgba(255, 0, 0, 0.2)", // Change to red if no data
                fill: true,
            },
            {
                label: "Avg Temperature (°C)",
                data: weatherData.length
                    ? weatherData.map((item) => item.avgTemp)
                    : [0],
                borderColor: weatherData.length
                    ? "rgba(75, 192, 192, 1)"
                    : "rgba(255, 0, 0, 1)", // Change to red if no data
                backgroundColor: weatherData.length
                    ? "rgba(75, 192, 192, 0.2)"
                    : "rgba(255, 0, 0, 0.2)", // Change to red if no data
                fill: true,
            },
        ],
    };

    // Function to check if a year is a leap year
    const isLeapYear = (year) => {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    };

    // Generate a simple array for the days based on the selected month and year
    const generateCalendarDays = () => {
        let adjustedMonth = month - 1; // Adjust to match JavaScript's 0-based month indexing
        let days = daysInMonth[adjustedMonth]; // Get days for the month

        // Handle leap year for February (adjustedMonth === 1 represents February)
        if (adjustedMonth === 1 && isLeapYear(year)) {
            days = 29; // February in a leap year
        }

        return Array.from({ length: days }, (_, i) => i + 1); // Generate days based on the length of the month
    };

    // Function to determine the dominant weather condition
    const getDominantCondition = (conditions) => {
        const conditionCount = {};
        // Count occurrences of each condition
        conditions.forEach((condition) => {
            conditionCount[condition] = (conditionCount[condition] || 0) + 1;
        });

        // Find the condition with the maximum count
        return Object.keys(conditionCount).reduce((a, b) =>
            conditionCount[a] > conditionCount[b] ? a : b
        );
    };

    // Map the fetched weather data into an object with day as key and dominant nature as value
    const weatherMap = weatherData.reduce((acc, item) => {
        const day = new Date(item.date).getDate();
        acc[day] = acc[day]
            ? [...acc[day], item.dominantCondition]
            : [item.dominantCondition];
        return acc;
    }, {});

    // Function to map weather conditions to colors
    const getWeatherColor = (condition) => {
        switch (condition) {
            case "Clear":
                return "yellow";
            case "Clouds":
                return "lightgray";
            case "Rain":
                return "lightblue";
            default:
                return "white"; // Default color for unknown conditions
        }
    };

    return (
        <div className="weather-summary-container">
            <h1>Weather Summary</h1>
            <div className="filters">
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="" disabled>
                        Choose City
                    </option>
                    {cities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                            {cityName.charAt(0).toUpperCase() +
                                cityName.slice(1)}
                        </option>
                    ))}
                </select>
                <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                    <option value="" disabled>
                        Choose Month
                    </option>
                    {[...Array(12).keys()].map((i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("en-US", {
                                month: "long",
                            })}
                        </option>
                    ))}
                </select>
                <button onClick={handleFilter}>Filter</button>
            </div>

            {/* Show validation message if weather data is empty */}
            {error && (
                <div className="no-data-message" style={{ color: "red" }}>
                    {error}
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                    style={{
                        width: "100%",
                        maxWidth: "800px",
                        height: "400px",
                    }}
                >
                    <Line data={chartData} />
                </div>
            </div>

            {/* Calendar component */}
            <div className="calendar-container">
                <h2>Dominant Weather Condition</h2>
                <div className="calendar-grid">
                    {generateCalendarDays().map((day) => {
                        const dominantCondition = weatherMap[day]
                            ? getDominantCondition(weatherMap[day])
                            : "No Data";

                        return (
                            <div
                                key={day}
                                className="calendar-day"
                                style={{
                                    backgroundColor:
                                        getWeatherColor(dominantCondition),
                                    padding: "10px",
                                    border: "1px solid lightgray",
                                    borderRadius: "5px",
                                    margin: "5px",
                                }}
                            >
                                <div style={{ fontWeight: "bold" }}>{day}</div>
                                <div>{dominantCondition}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeatherSummary;
