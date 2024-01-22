const weatherApiKey = 'd4d0c696373e77350837f5dc3b20d227'; 
const unsplashApiKey = 'QGlrpHX-4QbPzq06hzCLmVJJiqEujpW6vIBeUvwf-qo'; 
const rapidApiKey = 'f29bbe8780mshef3dd6651f12b99p1a30bcjsn5666b937801b';

document.getElementById('cityInput').addEventListener('input', (e) => {
    const userInput = e.target.value;
    if (userInput.length > 2) {
        fetchCities(userInput);
    } else {
        clearSuggestions();
    }
});

document.getElementById('cityInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            fetchWeather(city);
            fetchForecast(city);
            fetchCityImage(city);
            displayDateTime();
            clearSuggestions();
        }
    }
});

function clearSuggestions() {
    const suggestionsContainer = document.getElementById('citySuggestions');
    suggestionsContainer.innerHTML = '';
}

async function fetchCities(userInput) {
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${userInput}&limit=5&minPopulation=10000`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayCitySuggestions(data.data);
    } catch (error) {
        console.error("Erreur lors de la récupération des villes :", error);
    }
}


async function suggestionList(inputValue) {

    const suggestionListURL = `https://api.openweathermap.org/geo/1.0/direct?q=${inputValue}&limit=5&appid=${API_KEY}`;

    try {
        const response = await fetch(suggestionListURL);

        if (!response.ok) {
            throw new Error(response.status);
        }

        const data = await response.json();
        displaySuggestions(data);
    } catch (error) {
        console.error(error);
    }
}

function displaySuggestions(data){
    const autocompleteList = document.getElementById('autocompleteList')
    autocompleteList.innerHTML = ''

    data.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = city.name;
        suggestionItem.addEventListener('click', () => selectCity(city.name));
        autocompleteList.appendChild(suggestionItem);
    })
}

const cityInput = document.getElementById('cityInput');
cityInput.addEventListener('input', () => suggestionList(cityInput.value));

function selectCity(cityName) {
    const cityInput = document.getElementById('cityInput');
    cityInput.value = cityName;
    document.getElementById('autocompleteList').innerHTML = '';
}

document.getElementById('submitBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchWeather(city);
        fetchForecast(city);
        fetchCityImage(city);
        displayDateTime();
    } else {
        alert('Veuillez entrer un nom de ville.');
    }
});

async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric&lang=fr`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === 200) {
            displayCurrentWeather(data);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données météorologiques :", error);
    }
}

async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric&lang=fr`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === "200") {
            displayForecast(data);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des prévisions météorologiques :", error);
    }
}

async function fetchCityImage(city) {
    const url = `https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=${unsplashApiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            displayCityImage(data.results[0]);
        } else {
            console.log('Aucune image trouvée pour cette ville.');
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'image de la ville :", error);
    }
}

function displayCurrentWeather(weatherData) {
    const currentWeatherDiv = document.getElementById('currentWeather');
    const weatherIcon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;
    
    switch (weatherData.weather[0].main.toLowerCase()) {
        case 'clear':
            backgroundColor = 'yellow';
            break;
        case 'clouds':
            backgroundColor = 'gray';
            break;
        case 'rain':
        case 'drizzle':
            backgroundColor = 'lightblue';
            break;
        case 'thunderstorm':
            backgroundColor = 'darkgray';
            break;
        case 'snow':
            backgroundColor = 'white';
            break;
        default:
            backgroundColor = 'white'; 
    }
    
   
    document.body.style.backgroundColor = backgroundColor;
    
   
    currentWeatherDiv.innerHTML = `
        <h2>Météo actuelle à ${weatherData.name}</h2>
        <p><strong>Température:</strong> ${weatherData.main.temp} °C</p>
        <p><strong>Conditions:</strong> ${weatherData.weather[0].description}</p>
        <p><strong>Humidité:</strong> ${weatherData.main.humidity}%</p>
        <img src="${weatherIcon}" alt="Icône météo">
    `;
}


function displayForecast(forecastData) {
    const weatherForecastDiv = document.getElementById('weatherForecast');
    weatherForecastDiv.innerHTML = '<h2>Prévisions sur 5 jours</h2>';
    const dailyForecasts = forecastData.list.filter(f => f.dt_txt.endsWith("12:00:00"));

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const weatherIcon = `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
        weatherForecastDiv.innerHTML += `
            <div class="forecast-day">
                <h3>${date.toLocaleDateString()}</h3>
                <p><strong>Max:</strong> ${day.main.temp_max} °C</p>
                <p><strong>Min:</strong> ${day.main.temp_min} °C</p>
                <p><strong>Conditions:</strong> ${day.weather[0].description}</p>
                <img src="${weatherIcon}" alt="Icône météo">
            </div>
        `;
    });
}

function displayCityImage(imageData) {
    const cityImageDiv = document.getElementById('cityImage');
    cityImageDiv.innerHTML = `<img src="${imageData.urls.regular}" alt="Photo de ${imageData.alt_description}" style="max-width:100%; max-height:400px; width:auto; height:auto;">`;
}

function displayDateTime() {
    const now = new Date();
    const dateTimeDisplay = document.getElementById('currentDateTime');
    dateTimeDisplay.innerText = `Date et heure actuelles: ${now.toLocaleString()}`;
}



let backgroundColor = '';



setInterval(displayDateTime, 1000);
displayDateTime();


