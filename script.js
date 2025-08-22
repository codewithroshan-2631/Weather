

    const apiKey = "4e73f678b1fe43a4993141419252208";
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    let isRecentListVisible = false;
    let currentUnit = 'c';
    let currentData = null;

    // Format current date
    function formatDate() {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return now.toLocaleDateString('en-US', options);
    }

    // Format forecast date
    function formatForecastDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    // Toggle recent searches list visibility
    function toggleRecentList() {
      const recentList = document.getElementById('recentList');
      const chevron = document.getElementById('chevron');
      
      isRecentListVisible = !isRecentListVisible;
      
      if (isRecentListVisible) {
        recentList.classList.add('show');
        chevron.classList.add('down');
      } else {
        recentList.classList.remove('show');
        chevron.classList.remove('down');
      }
    }

    // Update recent searches list
    function updateRecentSearches() {
      const recentList = document.getElementById('recentList');
      recentList.innerHTML = '';
      
      if (recentCities.length === 0) {
        recentList.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 10px; color: #7f8c8d;">No recent searches</div>';
        return;
      }
      
      recentCities.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.className = 'recent-item';
        
        cityElement.innerHTML = `
          <span>${city}</span>
          <span class="delete" onclick="removeRecentCity(event, '${city}')">×</span>
        `;
        
        cityElement.addEventListener('click', (e) => {
          if (!e.target.classList.contains('delete')) {
            document.getElementById('cityInput').value = city;
            getWeather();
            // Keep the list open after selecting a city
            isRecentListVisible = true;
            document.getElementById('chevron').classList.add('down');
            document.getElementById('recentList').classList.add('show');
          }
        });
        
        recentList.appendChild(cityElement);
      });
    }

    // Add city to recent searches
    function addToRecentSearches(city) {
      // Remove if already exists
      recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
      // Add to beginning
      recentCities.unshift(city);
      // Keep only last 5
      recentCities = recentCities.slice(0, 5);
      // Save to localStorage
      localStorage.setItem('recentCities', JSON.stringify(recentCities));
      // Update UI
      updateRecentSearches();
    }

    // Remove city from recent searches
    function removeRecentCity(event, city) {
      event.stopPropagation(); // Prevent triggering the parent click event
      recentCities = recentCities.filter(c => c !== city);
      localStorage.setItem('recentCities', JSON.stringify(recentCities));
      updateRecentSearches();
    }

    // Switch temperature unit
    function switchUnit(unit) {
      currentUnit = unit;
      
      // Update button states
      document.getElementById('celsiusBtn').classList.toggle('active', unit === 'c');
      document.getElementById('fahrenheitBtn').classList.toggle('active', unit === 'f');
      
      // Update displayed temperature if we have data
      if (currentData) {
        updateWeatherDisplay(currentData);
      }
    }

    // Update weather display with current unit
    function updateWeatherDisplay(data) {
      document.getElementById("cityName").innerText = `${data.location.name}, ${data.location.country}`;
      document.getElementById("date").innerText = formatDate();
      
      if (currentUnit === 'c') {
        document.getElementById("temperature").innerHTML = `${data.current.temp_c}°<span style="font-size: 0.6em;">C</span>`;
        document.getElementById("feelsLike").innerText = `Feels like: ${data.current.feelslike_c}°C`;
      } else {
        document.getElementById("temperature").innerHTML = `${data.current.temp_f}°<span style="font-size: 0.6em;">F</span>`;
        document.getElementById("feelsLike").innerText = `Feels like: ${data.current.feelslike_f}°F`;
      }
      
      document.getElementById("condition").innerText = data.current.condition.text;
      document.getElementById("weatherIcon").src = data.current.condition.icon;
      document.getElementById("wind").innerText = `${data.current.wind_kph} km/h`;
      document.getElementById("humidity").innerText = `${data.current.humidity}%`;
      document.getElementById("pressure").innerText = `${data.current.pressure_mb} mb`;
      document.getElementById("visibility").innerText = `${data.current.vis_km} km`;
      document.getElementById("uv").innerText = data.current.uv;
      document.getElementById("precip").innerText = `${data.current.precip_mm} mm`;
      
      // Update forecast if available
      if (data.forecast) {
        updateForecastDisplay(data.forecast.forecastday);
      }
      
      // Change background based on weather condition
      changeBackground(data.current.condition.text, data.current.is_day);
    }

    // Update forecast display
    function updateForecastDisplay(forecastDays) {
      const forecastItems = document.getElementById('forecastItems');
      forecastItems.innerHTML = '';
      
      forecastDays.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
          <div class="forecast-day">${formatForecastDate(day.date)}</div>
          <img class="forecast-icon" src="${day.day.condition.icon}" alt="${day.day.condition.text}">
          <div class="forecast-temp">${currentUnit === 'c' ? day.day.avgtemp_c + '°C' : day.day.avgtemp_f + '°F'}</div>
        `;
        
        forecastItems.appendChild(forecastItem);
      });
    }

    // Change background based on weather condition
    function changeBackground(condition, isDay) {
      const body = document.body;
      let gradient;
      
      if (!isDay) {
        // Night time
        gradient = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
      } else if (condition.toLowerCase().includes('sunny') || condition.toLowerCase().includes('clear')) {
        gradient = 'linear-gradient(135deg, #ff9a00, #ffde67)';
      } else if (condition.toLowerCase().includes('cloud')) {
        gradient = 'linear-gradient(135deg, #b6b6b6, #e6e6e6)';
      } else if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle')) {
        gradient = 'linear-gradient(135deg, #616161, #9bc5c3)';
      } else if (condition.toLowerCase().includes('snow')) {
        gradient = 'linear-gradient(135deg, #e6e9f0, #eef1f5)';
      } else {
        gradient = 'linear-gradient(135deg, #74ebd5, #9face6)';
      }
      
      body.style.background = gradient;
    }

    async function getWeather() {
      const city = document.getElementById("cityInput").value.trim();
      
      if (!city) {
        showError("Please enter a city name");
        return;
      }
      
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no`;
      
      // Show loading, hide error and weather info
      document.getElementById('loading').style.display = 'block';
      document.getElementById('errorMessage').style.display = 'none';
      document.getElementById('weatherInfo').style.display = 'none';
      document.getElementById('forecastContainer').style.display = 'none';
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("City not found");
        }
        const data = await response.json();
        
        // Store current data
        currentData = data;

        // Update UI with weather data
        updateWeatherDisplay(data);
        
        // Add to recent searches
        addToRecentSearches(data.location.name);
        
        // Show weather info with animation
        document.getElementById('weatherInfo').style.display = 'block';
        document.getElementById('forecastContainer').style.display = 'block';
        document.getElementById('weatherInfo').classList.add('fade-in');
        document.getElementById('forecastContainer').classList.add('fade-in');
        
      } catch (error) {
        showError("City not found. Please try another location.");
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    }

    function showError(message) {
      const errorElement = document.getElementById('errorMessage');
      errorElement.innerText = message;
      errorElement.style.display = 'block';
    }

    // Listen for Enter key
    document.getElementById("cityInput").addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        getWeather();
      }
    });

    // Toggle recent searches when header is clicked
    document.getElementById('recentHeader').addEventListener('click', toggleRecentList);

    // Load default weather and recent searches on page load
    window.onload = function() {
      // Set default city to user's location or a fallback
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            document.getElementById('cityInput').value = `${latitude},${longitude}`;
            getWeather();
          },
          error => {
            // Fallback to a default city if location access is denied
            document.getElementById('cityInput').value = {city};
            getWeather();
          }
        );
      } else {
        // Fallback if geolocation is not supported
        document.getElementById('cityInput').value = {city};
        getWeather();
      }
      
      updateRecentSearches();
    };

