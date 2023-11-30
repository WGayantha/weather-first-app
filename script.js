
const temp = document.getElementById("temp"),
    tempText = document.querySelector(".temp-unit"),
    date = document.getElementById("date-time"),
    currentLocation = document.getElementById("location"),
    todayCondition = document.getElementById("condition"),
    rain = document.getElementById("rain"),
    mainIcon = document.getElementById("icon"),
    uvIndex = document.querySelector(".uv-index"),
    uvText = document.querySelector(".uv-text"),
    windSpeed = document.querySelector(".wind-speed"),
    windText = document.querySelector(".wind-status"),
    sunRise = document.querySelector(".sunrise"),
    sunSet = document.querySelector(".sunset"),
    humidity = document.querySelector(".humidity"),
    humidiyStatus = document.querySelector(".humidity-status"),
    visibility = document.querySelector(".visibility"),
    visibilityStatus = document.querySelector(".visibility-status"),
    airQuality = document.querySelector(".air-quality"),
    airQualityStatus = document.querySelector(".air-quality-status"),
    weatherCards = document.querySelector("#weather-cards"),
    tempUnit = document.querySelectorAll(".temp-unit"),
    hourlyBtn = document.querySelector(".hourly"),
    weekBtn = document.querySelector(".week"),
    fahrenheitBtn = document.querySelector(".fahrenheit"),
    celciusBtn = document.querySelector(".celcius"),
    themeBtn = document.getElementById("btnTheme"),
    themeIcon = document.getElementById("themeIcon");


let currentunit = "C";
let hourlyOrWeek = "week";
let city = "";

function getDateTime() {
    let now = new Date(),
        hour = now.getHours(),
        minute = now.getMinutes(),
        seconds = now.getSeconds();


    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    hour = hour % 12;
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    let dayString = days[now.getDay()];
    return `${dayString}, ${hour}:${minute}:${seconds}`;

}

// update time every seconds
setInterval(() => {
    date.innerText = getDateTime();
}, 1000);

//function to get public ip with fetch

function getPublicIp() {
    fetch("https://geolocation-db.com/json/", {
        method: "GET",
    })
        .then((response) => response.json())
        .then((data) => {          
            city = data.city;
          getWeatherData(city);
        });
    return city;
}
getPublicIp();


const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");

searchBtn.addEventListener("click", () => {

    getWeatherData(searchBox.value);
    city = searchBox.value;
});

function getWeatherData(city) {

    const apiKey = "1ca103dd8f8d453da6265718230911";
    const apiUrl = "http://api.weatherapi.com/v1/forecast.json?days=7&aqi=yes&alerts=yes&q="
    fetch(apiUrl + city + `&key=${apiKey}`,
        {
            method: "GET",
        }
    )
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            let today = data.current;

            if (currentunit == "C") {
                temp.innerText = Math.round(today.temp_c);
                tempText.innerText = "°C"
            } else {
                temp.innerText = Math.round(today.temp_f);
                tempText.innerText = "°F";
            }

            todayCondition.innerText = today.condition.text;
            rain.innerText = "Precipitation " + today.precip_mm + " mm";
            uvIndex.innerText = today.uv;
            windSpeed.innerText = today.wind_kph + " Km/h";
            humidity.innerText = today.humidity;
            visibility.innerText = today.vis_km;
            mainIcon.src = today.condition.icon;
            airQuality.innerText = today.air_quality.so2;

            let astroData = data.forecast;
            sunRise.innerText = astroData.forecastday[0].astro.sunrise;
            sunSet.innerText = astroData.forecastday[0].astro.sunset;

            let currntLocation = data.location;
            currentLocation.innerText = currntLocation.name;

            measureUvIndex(today.uv);
            updateHumidityStatus(today.humidity);
            updateVisibilityStatus(today.vis_km);
            changeBackground(today.condition.text);
            measureAirQuality(today.air_quality.so2);
            measureWindSpeed(today.wind_kph);

            if (hourlyOrWeek == "week") {
                weatherCards.innerHTML = "";
                let d = 0;

                for (let i = 0; i < 7; i++) {
                    let card = document.createElement("div");
                    card.classList.add("card");
                    let dayMinTemp = "";
                    let dayMaxTemp = "";
                    if (currentunit === "C") {
                        dayMinTemp = Math.round(data.forecast.forecastday[d].day.mintemp_c);
                        dayMaxTemp = Math.round(data.forecast.forecastday[d].day.maxtemp_c);
                    } else {
                        dayMinTemp = Math.round(data.forecast.forecastday[d].day.mintemp_f);
                        dayMaxTemp = Math.round(data.forecast.forecastday[d].day.maxtemp_f);

                    }

                    let dayName = getDayName(data.forecast.forecastday[d].date);

                    let iconSrc = data.forecast.forecastday[d].day.condition.icon;

                    card.innerHTML = `
                
                <h2 class="day-name">${dayName}</h2>
                <div class="card-icon">
                    <img src="${iconSrc}" alt="" />
                </div>
                <div class="day-temp">
                    <h2 id="temp" class="">${dayMinTemp} / ${dayMaxTemp}</h2>
                    <span class="temp-unit"> °${currentunit} </span>
                </div>
                `;
                    weatherCards.appendChild(card);
                    d++;
                }
            } else {
                weatherCards.innerHTML = "";
                let d = 0;

                for (let i = 0; i < 24; i++) {
                    let card = document.createElement("div");
                    card.classList.add("card");
                    let dayTemp = "";
                    if (currentunit == "C") {
                        dayTemp = Math.round(data.forecast.forecastday[0].hour[d].temp_c);
                    } else {
                        dayTemp = Math.round(data.forecast.forecastday[0].hour[d].temp_f);

                    }
                    let hour = getHour(data.forecast.forecastday[0].hour[d].time);
                    let iconSrc = data.forecast.forecastday[0].hour[d].condition.icon;


                    card.innerHTML = `
                
                <h2 class="day-name">${hour}</h2>
                <div class="card-icon">
                    <img src="${iconSrc}" alt="" />
                </div>
                <div class="day-temp">
                    <h2 id="temp" class="">${dayTemp}</h2>
                    <span class="temp-unit"> °${currentunit}</span>
                </div>
                `;
                    weatherCards.appendChild(card);
                    d++;
                }
            }
        })

        .catch((err) => {
            alert("City not found")
        });
}

function getDayName(date) {
    let day = new Date(date);
    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    return days[day.getDay()];
}

function getHour(datetime) {
    let time = datetime.split(" ")[1];
    let hour = time.split(":")[0];

    return hour >= 12 ? (time + "PM") : (time + "AM");
}

function measureUvIndex(uvIndex) {
    if (uvIndex <= 2) {
        uvText.innerText = "Low";
    } else if (uvIndex <= 5) {
        uvText.innerText = "Moderate";
    } else if (uvIndex <= 7) {
        uvText.innerText = "High";
    } else if (uvIndex <= 10) {
        uvText.innerText = "Very High";
    } else {
        uvText.innerText = "Extreme";
    }
}

function updateHumidityStatus(humidity) {
    if (humidity <= 30) {
        humidiyStatus.innerText = "Low";
    } else if (humidity <= 60) {
        humidiyStatus.innerText = "Moderate";
    } else {
        humidiyStatus.innerText = "High";
    }

}

function updateVisibilityStatus(visibility) {
    if (visibility <= 0.3) {
        visibilityStatus.innerText = "Dense Fog";
    } else if (visibility <= 0.16) {
        visibilityStatus.innerText = "Moderate Fog"
    } else if (visibility <= 0.35) {
        visibilityStatus.innerText = "Light Fog"
    } else if (visibility <= 1.13) {
        visibilityStatus.innerText = "Very Light Fog"
    } else if (visibility <= 2.16) {
        visibilityStatus.innerText = "Light Mist"
    } else if (visibility <= 5.4) {
        visibilityStatus.innerText = "Very Light Mist"
    } else if (visibility <= 10.8) {
        visibilityStatus.innerText = "Clear Air"
    } else {
        visibilityStatus.innerText = "Very Clear Air"
    }

}
function measureAirQuality(index) {
    if (index <= 1) {
        airQualityStatus.innerText = "Good";
    } else if (index <= 2) {
        airQualityStatus.innerText = "Moderate";
    } else if (index <= 3) {
        airQualityStatus.innerText = "Unhealthy for sensitive group";
    } else if (index <= 4) {
        airQualityStatus.innerText = "Unhealthy";
    } else {
        airQualityStatus.innerText = "Hazardous";
    }
}
function measureWindSpeed(windSpeed){
    if (windSpeed <= 1) {
        windText.innerText = "Calm";
    } else if (windSpeed  <= 25) {
        windText.innerText = "Light";
    } else if (windSpeed  <= 40) {
        windText.innerText = "Moderate";
    } else if (windSpeed  <= 60) {
        windText.innerText = "Strong";
    } else {
        airQualityStatus.innerText = "Extreme";
    }
}
fahrenheitBtn.addEventListener("click", () => {
    changeUnit("F");
});

celciusBtn.addEventListener("click", () => {
    changeUnit("C");
});

function changeUnit(unit) {
    if (currentunit !== unit) {
        currentunit = unit;
        if (unit === "C") {
            celciusBtn.classList.add("active");
            fahrenheitBtn.classList.remove("active");
        } else {
            celciusBtn.classList.remove("active");
            fahrenheitBtn.classList.add("active");
        }
        getWeatherData(city);
    }
}

hourlyBtn.addEventListener("click", () => {
    changeTimeSpan("hourly");
});

weekBtn.addEventListener("click", () => {
    changeTimeSpan("week");
});

function changeTimeSpan(unit) {
    if (hourlyOrWeek !== unit) {
        hourlyOrWeek = unit;
        if (unit === "hourly") {
            hourlyBtn.classList.add("active");
            weekBtn.classList.remove("active");
        } else {
            hourlyBtn.classList.remove("active");
            weekBtn.classList.add("active");
        }
        getWeatherData(city);
    }
}

function changeBackground(condition) {
    const body = document.querySelector("body");
    let bg = "";
    if (condition === "Partly cloudy" || condition === "Cloudy") {
        bg = "images/cloudy.jpg";
    } else if (condition === "Patchy rain possible"
        || condition === "Moderate rain" || condition === "Light rain shower") {
        bg = "images/rain.jpg";
    } else if (condition === "Sunny") {
        bg = "images/sunny.jpg";
    } else if (condition === "Mist") {
        bg = "images/mist.jpg";
    } else {
        bg = "images/cloudy.jpg";
    }
    body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${bg})`;
}


themeBtn.onclick = function () {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        themeIcon.src = "images/sun.png";
    } else {
        themeIcon.src = "images/moon.png";
    }

}
