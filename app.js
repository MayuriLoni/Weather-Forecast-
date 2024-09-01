const apiKey = 'e7dfc1a56283e36bfe0cb2fea095a982';

// Function to fetch weather data
function fetchWeather() {
    const city = document.getElementById("city-input").value.trim();
    if (city) {
        fetchWeatherByCity(city);
        saveRecentCity(city); // Save city to recent searches
    } else {
        displayError("Location text should not be empty.");
    }
}

// Function to fetch weather by city name
function fetchWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => handleFetchResponse(response))
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
            const { latitude: lat, longitude: lon } = position.coords;
            fetchWeatherByLocation(lat, lon);
        }, () => displayError("Unable to retrieve your location. Make sure location services are enabled."));
    } else {
        displayError("Geolocation is not supported by this browser.");
    }
}

// Function to fetch weather by latitude and longitude
function fetchWeatherByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => handleFetchResponse(response))
        .then(data => {
            displayWeather(data);
            fetchForecastByLocation(lat, lon); // Fetch 5-day forecast after getting current weather
        })
        .catch(error => displayError(`Error fetching data: ${error.message}`));
}

// Function to handle fetch response and check for errors
function handleFetchResponse(response) {
    if (response.status === 401) {
        throw new Error("Invalid API key.");
    } else if (!response.ok) {
        throw new Error(`City not found: ${response.status}`);
    }
    return response.json();
}

// Function to fetch 5-day forecast by city
function fetchForecastByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => handleFetchResponse(response))
        .then(data => displayForecast(data))
        .catch(error => displayError(`Error fetching forecast data: ${error.message}`));
}

// Function to fetch 5-day forecast by latitude and longitude
function fetchForecastByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => handleFetchResponse(response))
        .then(data => displayForecast(data))
        .catch(error => displayError(`Error fetching forecast data: ${error.message}`));
}

// Function to display the current weather data
function displayWeather(data) {
    const weatherOutput = `
        <div class="text-center">
            <div class="text-2xl font-bold">${data.name}</div>
            <div class="text-lg my-2">${getWeatherIcon(data.weather[0].main)} ${data.weather[0].description}</div>
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
    let forecastOutput = `
        <h2 class="text-xl font-bold mb-4 text-center">5-Day Forecast</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    `;

    forecastItems.forEach(item => {
        forecastOutput += `
            <div class="forecast-item p-4 border rounded-lg text-center">
                <div class="font-semibold">${new Date(item.dt_txt).toLocaleDateString()}</div>
                <div class="my-2">${getWeatherIcon(item.weather[0].main)} ${item.weather[0].description}</div>
                <div class="text-lg font-semibold">${item.main.temp}°C</div>
                <div class="text-sm">Humidity: ${item.main.humidity}%</div>
                <div class="text-sm">Wind Speed: ${item.wind.speed} m/s</div>
            </div>
        `;
    });

    forecastOutput += `</div>`;
    document.getElementById("forecast-output").innerHTML = forecastOutput;
}

// Function to display error messages
function displayError(message) {
    document.getElementById("error-message").innerHTML = `<p>${message}</p>`;
    document.getElementById("weather-output").innerHTML = ""; // Clear weather data
    document.getElementById("forecast-output").innerHTML = ""; // Clear forecast data
}

// Function to get the appropriate weather icon
function getWeatherIcon(condition) {
    switch (condition.toLowerCase()) {
        case 'clear':
            return '<i class="fas fa-sun"></i>';
        case 'clouds':
            return '<i class="fas fa-cloud"></i>';
        case 'rain':
            return '<i class="fas fa-cloud-rain"></i>';
        case 'snow':
            return '<i class="fas fa-snowflake"></i>';
        default:
            return '<i class="fas fa-question"></i>';
    }
}

// Function to save the recent city to local storage
function saveRecentCity(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
    updateRecentCitiesDropdown();
}

// Function to update the dropdown with recent cities
function updateRecentCitiesDropdown() {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const dropdown = document.getElementById("recent-cities");
    dropdown.innerHTML = '';
    if (recentCities.length > 0) {
        document.getElementById("recent-cities-dropdown").classList.remove('hidden');
        recentCities.forEach(city => {
            let option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            dropdown.appendChild(option);
        });
    }
}

// Event listener for recent cities dropdown
document.getElementById("recent-cities").addEventListener('change', function () {
    const city = this.value;
    if (city) {
        fetchWeatherByCity(city);
    }
});

// Initialize the dropdown on page load
window.onload = function () {
    updateRecentCitiesDropdown();
};

// Event listener for the "Use Current Location" button
document.getElementById("get-location-weather").addEventListener('click', function () {
    getWeatherByCurrentLocation();
});
