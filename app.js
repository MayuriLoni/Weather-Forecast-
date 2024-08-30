const apiKey = 'e7dfc1a56283e36bfe0cb2fea095a982'; // Replace with your OpenWeather API key

// Function to fetch weather data
function fetchWeather() {
    const city = document.getElementById("city-input").value.trim();
    if (city) {
        fetchWeatherByCity(city);
    } else {
        getWeatherByCurrentLocation();
    }
}

// Function to fetch weather by city name
function fetchWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (response.status === 401) {
                throw new Error("Invalid API key.");
            } else if (!response.ok) {
                throw new Error(`City not found: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            fetchForecastByCity(city); // Fetch 5-day forecast after getting current weather
        })
        .catch(error => displayError(`Error fetching data: ${error.message}`));
}

// Function to fetch weather by current location
function getWeatherByCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByLocation(lat, lon);
        }, error => {
            displayError("Unable to retrieve your location. Make sure location services are enabled.");
        });
    } else {
        displayError("Geolocation is not supported by this browser.");
    }
}

// Function to fetch weather by latitude and longitude
function fetchWeatherByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (response.status === 401) {
                throw new Error("Invalid API key.");
            } else if (!response.ok) {
                throw new Error(`Unable to retrieve weather data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            fetchForecastByLocation(lat, lon); // Fetch 5-day forecast after getting current weather
        })
        .catch(error => displayError(`Error fetching data: ${error.message}`));
}

// Function to fetch 5-day forecast by city
function fetchForecastByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (response.status === 401) {
                throw new Error("Invalid API key.");
            } else if (!response.ok) {
                throw new Error(`Unable to retrieve forecast data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => displayForecast(data))
        .catch(error => displayError(`Error fetching forecast data: ${error.message}`));
}

// Function to fetch 5-day forecast by latitude and longitude
function fetchForecastByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (response.status === 401) {
                throw new Error("Invalid API key.");
            } else if (!response.ok) {
                throw new Error(`Unable to retrieve forecast data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => displayForecast(data))
        .catch(error => displayError(`Error fetching forecast data: ${error.message}`));
}

// Function to display the current weather data
function displayWeather(data) {
    const weatherOutput = `
        <div class="text-center">
            <div class="text-2xl font-bold">${data.name}</div>
            <div class="text-lg my-2">${data.weather[0].description}</div>
            <div class="text-xl font-semibold">${data.main.temp}°C</div>
            <div class="text-sm">Humidity: ${data.main.humidity}%</div>
            <div class="text-sm">Wind Speed: ${data.wind.speed} m/s</div>
        </div>
    `;
    document.getElementById("weather-output").innerHTML = weatherOutput;
    document.getElementById("error-message").innerHTML = ""; // Clear error message if any
}

// Function to display the 5-day forecast
function displayForecast(data) {
    const forecastItems = data.list.filter(item => item.dt_txt.endsWith("12:00:00")); // Use daily forecast at 12:00 PM
    const forecastOutput = `
        <h2 class="text-xl font-bold mb-4 text-center">5-Day Forecast</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${forecastItems.map(item => `
                <div class="forecast-card p-4">
                    <div class="card-header">${new Date(item.dt_txt).toLocaleDateString()}</div>
                    <div class="card-content">
                        <div><i class="fas fa-cloud"></i> ${item.weather[0].description}</div>
                        <div>Temp: ${item.main.temp}°C</div>
                        <div>Humidity: ${item.main.humidity}%</div>
                        <div>Wind: ${item.wind.speed} m/s</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById("forecast-output").innerHTML = forecastOutput;
}

// Function to display error messages
function displayError(message) {
    document.getElementById("error-message").innerHTML = message;
}

// Function to toggle active state for the weather and forecast cards
function toggleActive(element) {
    element.classList.toggle('active');
}

// Attach the location button click event
document.getElementById("get-location-weather").addEventListener("click", getWeatherByCurrentLocation);
