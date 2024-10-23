# Realtime-weather-monitoring

## Overview
This Application is a real-time data processing system to monitor weather conditions and provide summarized insights using rollups, aggregates and alerts
![image](https://github.com/user-attachments/assets/77aef138-00e8-49c2-8b2d-78aa4bb4b537)

## Features
1) Visualization temperature trends for major metropolitan cities, updating every 5 minutes, with filtering options by date and temperature scale (Celsius, Fahrenheit, or Kelvin)
![image](https://github.com/user-attachments/assets/fd82b4ce-775d-4e3d-a181-31b0c0358d99)

2) Daily aggregates of temperature data, showing the maximum, minimum, and average temperatures, along with dominant conditions for each day of the selected month. Data can be filtered by month and city
![image](https://github.com/user-attachments/assets/05852025-61b4-4bb4-b87a-9cc755eb97c9)
Note: Please use October as the month and Hyderabad as the city, as data was not fetched for other cities.

3) This feature prompts users for a city and threshold, continuously monitoring temperature data every 5 minutes to check if it exceeds the specified limit, triggering alerts as needed
![image](https://github.com/user-attachments/assets/6d12f845-b70d-4e80-9dbe-06dc0d802cbe)
![image](https://github.com/user-attachments/assets/43527d91-ce95-43e3-bbf3-3f59d16a30c9)

4) Feature to display the triggered alerts for selected city and selected date
![image](https://github.com/user-attachments/assets/3824d6b0-0954-4012-8151-272b1a9261f8)


## Tech Stack
- Frontend :- ReactJS; Dependencies :- chart.js, react-calender, axios
- Backend :- NodeJS; Dependencies :- axios, cors, Nodemon
- Middleware :- Express; Dependencies :- express
- Database :- MongoDB; Dependencies :- mongoose

## Getting Started

### Prerequisites
- Nodejs and npm installed
- MongoDB atlas

### Installation and Setup
1) Clone the Repository
``` git clone https://github.com/legendaryboi04/Realtime-weather-monitoring.git ```

2) Navigate to Directory
``` cd Realtime-weather-monitoring ```

3) Start Frontend
<code>cd frontend
       npm install
       npm start
  </code>

4) Starting Backend Server
<code>cd backend
       npm install
       node index.js
 </code>

## API Endpoints
1) Fetch daily report ( Visualizes temperate every 5 mins in a bar graph )
   - Endpoint
     <code> /weather </code>
   - Method :- GET
   - Example
     <code> http://localhost:5000/weather?appid=42f3211dd66942736a27437f90e479ef&city=hyderabad&date=2024-10-23  </code>
   - Response 
     <code> [{
        "_id": "6718ca7eb47f9f25e5f8ac76",
        "city": "hyderabad",
        "temp": 30.23,
        "feels_like": 30.62,
        "main": "Haze",
        "dt": "2024-10-23T10:03:20.000Z",
        "__v": 0
    },{...}] </code>

2) Daily Aggregates 
   - Endpoint 
     <code> /weather/summary </code>
   - Method :- GET 
   - Example
     <code> http://localhost:5000/weather/summary?city=hyderabad&month=10 </code>
   - Response 
     <code>[{
        "_id": "67113df3c64b93db197a6c26",
        "date": "2024-10-01T00:00:00.000Z",
        "city": "hyderabad",
        "avgTemp": 28.5,
        "maxTemp": 32.1,
        "minTemp": 24.6,
        "dominantCondition": "Clouds"
    },{...}] </code>

3) Alerts & Thresholds
   - Endpoint
     <code> /alerts </code>
   - Method :- GET
   - Example
     <code> http://localhost:5000/alerts?city=delhi&maxThreshold=12&minThreshold=15 </code>
   - Response
     <code>{
    "message": "Alert created successfully.",
    "alert": {
        "alertMessage": "Alert! Temperature in delhi is 31.05°C, which is outside the specified thresholds.",
        "datetime": "2024-10-23T11:43:02.324Z",
        "city": "delhi",
        "maxThreshold": 12,
        "minThreshold": 15,
        "currentTemp": 31.05,
        "_id": "6718e146540c2906c84212cd",
        "__v": 0
    }
} </code>

4) Alert Summary
   - Endpoint
     <code> /alerts/summary </code>
   - Method :- GET
   - Example
     <code>http://localhost:5000/alerts/summary?city=hyderabad&date=2024-10-18 </code>
   - Response
     <code> [{
        "_id": "67125c4cd0dcb3bc55c342f9",
        "alertMessage": "Alert! Temperature in hyderabad is 26.73°C, which is outside the specified thresholds.",
        "datetime": "2024-10-18T13:02:04.290Z",
        "city": "hyderabad",
        "maxThreshold": 15,
        "minThreshold": 10,
        "currentTemp": 26.73,
        "__v": 0
    },{...}]</code>

## Additional Features
- Temperature Conversion to various scales realtime
  ![image](https://github.com/user-attachments/assets/c3d9976d-af41-4a70-8edc-a28666bcd7ca)
- Daily updates for every 5 mins visualized in a graph
  ![image](https://github.com/user-attachments/assets/7703c407-1b93-4cc3-8f4f-2cae7a9f53a3)

## Test Cases
- All the required functionalities are implemented and tested.
- You can add and run tests to ensure everything is working correctly.


Note :- If the server is running 24/7 , every functionality will work as expected, I have added dummy data to simulate aggregates 
#### Created by : Tarun Sai Phani Varma
