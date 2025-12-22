
const searchInput = document.querySelector('#search-input');
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error-box");
const errorText = document.getElementById("error-text");
const apiKey = '1f4f089e1af8d5b2637c6b22bf71d25e';

function showLoader() {
    loader.style.display = "block";
    errorBox.style.display = "none";
}

function hideLoader() {
    loader.style.display = "none";
}

function showError(message) {
    hideLoader();
    errorText.textContent = message;
    errorBox.style.display = "block";
}

let main = async (event, api = "") => {
    const city = searchInput.value.trim();
    if (city === "" && api == false) {
        searchInput.value = "";
        searchInput.focus();
        return;
    }
    let URL = "";
    if (api) {
        URL = api;
    } else {
        URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    }
    try {
        showLoader();
        let data = await getData(URL);
        hideLoader();
        if (data.cod == 404) {
            showError("City not found");
            searchInput.value = "";
            searchInput.focus();
            return;
        }
        displayWeather(data);
        getBgImage(data);
    } catch (err) {
        showError("City not found");
        searchInput.value = "";
        searchInput.focus();
        console.error("Error: ", err);
    }
}

const getData = async URL => {
    try {
        let response = await fetch(URL);
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('Getting weather details error:'), error;
    }
}

const displayWeather = (data) => {
    let weather = document.querySelector('.weather-display');
    weather.innerHTML = "";
    weather.innerHTML = `
    <div class="location-date">
        <h1 class="location">${data.name}, ${data.sys.country}</h1>
        <p class="date">${getLocalDateTime(data.timezone)}</p>
    </div>
    <div class="weather-main">
        <div class="temperature">
            <span class="temp-value">${data.main.temp}</span>
            <span class="temp-unit">°C</span>
        </div>
        <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="icon" />
        </div>
        <div class="weather-description">${data.weather[0].description}</div>
    </div>
    <div class="weather-details">
        <div class="detail">
            <i class="fas fa-temperature-high"></i>
            <span>Feels like: <span class="feels-like">${data.main.feels_like}°C</span></span>
        </div>
        <div class="detail">
            <i class="fas fa-tint"></i>
            <span>Humidity: <span class="humidity">${data.main.humidity}%</span></span>
        </div>
        <div class="detail">
            <i class="fas fa-wind"></i>
            <span>Wind: <span class="wind-speed">${data.wind.speed} km/h</span></span>
        </div>
        <div class="detail">
            <i class="fas fa-compress-arrows-alt"></i>
            <span>Pressure: <span class="pressure">${data.main.pressure} hPa</span></span>
        </div>
        <div class="detail">
            <i class="fas fa-eye"></i>
            <span>Visibility: <span class="visibility">${data.visibility} km</span></span>
        </div>
        <div class="detail">
            <i class="fas fa-temperature-low"></i>
            <span>Temp min: <span>${data.main.temp_min}</span></span>
        </div>
        <div class="detail">
            <i class="fas fa-temperature-high"></i>
            <span>Temp max: <span>${data.main.temp_max}</span></span>
        </div>
        <div class="detail">
            <i class="fas fa-cloud"></i>
            <span>Cloudy: <span>${data.clouds.all}%</span></span>
        </div>
    </div>
    `;
}

const ACCESS_KEY = '0NxMgA5WkM55Jxxun5eTm1dikozwgt-KF_kevyimjDk';

let getBgImage = async (data) => {
    let query = getQuery(data.weather[0].description);
    try {
        const res = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=${ACCESS_KEY}`);
        const data = await res.json();
        let body = document.body;
        body.style.backgroundImage = `url("${data.urls.regular}")`;
    } catch (err) {
        console.error('Getting background image error:', err);
    }
}

const currentLocation = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(position => {
            resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }, err => reject("Please allow location"));
    });
}

function getQuery(weatherCondition) {
    let query = '';
    switch(weatherCondition) {
        case "clear": query = "sunny sky"; break;
        case "clear sky": query = "clear sky"; break;
        case "clouds": query = "cloudy sky"; break;
        case "few clouds": query = "cloudy sky"; break;
        case "rain": query = "rainy weather"; break;
        case "thunderstorm": query = "stormy sky"; break;
        case "snow": query = "snowy landscape"; break;
        case "mist":
        case "fog": query = "foggy weather"; break;
        case "haze": query = "hazy sky"; break;
        case "dust": query = "dusty weather"; break;
        case "tornado": query = "tornado sky"; break;
        case "squall": query = "windy weather"; break;
        case "ash": query = "volcanic ash"; break;
        case "blizzard": query = "blizzard snowstorm"; break;
        default: query = "nature";
    }
    return query;
}

const getLocalDateTime = offsetInSeconds => {
    const utcTime = moment.utc();
    const localTime = utcTime.add(offsetInSeconds, 'seconds');
    return localTime.format("ddd MMMM DD YYYY, h:mm A");
}

document.addEventListener('DOMContentLoaded', (event) => {
    let currlocation = currentLocation();
    currlocation.then((res) => {
        const api = `https://api.openweathermap.org/data/2.5/weather?lat=${res.latitude}&lon=${res.longitude}&units=metric&appid=${apiKey}`;
        main("", api);
    }).catch((err) => console.error(err));
    document.querySelector('#search-btn').addEventListener('click', main);
    document.querySelector('#search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') main();
    });
});
