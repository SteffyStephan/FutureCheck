import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDjWctps1-JO3jC8DfLZA4BnYqHHmcaHy0",
    authDomain: "futurecheck-563ac.firebaseapp.com",
    projectId: "futurecheck-563ac",
    storageBucket: "futurecheck-563ac.firebasestorage.app",
    messagingSenderId: "779739665650",
    appId: "1:779739665650:web:d062ae92960f3350206c6b"
};

const weatherKey = "6b00b60fa01bc273a56e51358bfc2606";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 2. DOM ELEMENTS
const loginBtn = document.getElementById('login-btn');
const userDisplay = document.getElementById('user-display');
const searchBtn = document.getElementById('search-btn');

// 3. LOGIN & LOGOUT
if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            userDisplay.innerText = `Welcome, ${result.user.displayName} (Click to Logout)`;
            userDisplay.style.cursor = "pointer";
            userDisplay.classList.remove('hidden');
            loginBtn.classList.add('hidden');
        } catch (e) {
            console.error(e);
            alert("Login failed! Ensure Support Email and Authorized Domains are set in Firebase.");
        }
    };
}

if (userDisplay) {
    userDisplay.onclick = async () => {
        if (confirm("Do you want to logout?")) {
            await auth.signOut();
            window.location.reload();
        }
    };
}

// 4. ANALYZE LOGIC (Combined Fix)
async function runAnalysis() {
    console.log("Analyze button clicked!"); // Check your console (F12) for this!
    const city = document.getElementById('city-input').value.trim();
    const budget = document.getElementById('user-budget').value;

    if (!city || !budget) {
        alert("Please enter both City and Budget!");
        return;
    }

    try {
        // A. Weather & Coordinates
        const wResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherKey}`);
        const wData = await wResp.json();
        
        if (wData.cod !== 200) throw new Error("City not found");

        const lat = wData.coord.lat;
        const lon = wData.coord.lon;

        document.getElementById('temp').innerText = `${Math.round(wData.main.temp)}°C`;
        document.getElementById('weather-desc').innerText = wData.weather[0].description;

        // B. AQI (Air Quality)
        const aResp = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherKey}`);
        const aData = await aResp.json();
        
        if (aData.list && aData.list.length > 0) {
            const aqi = aData.list[0].main.aqi;
            const labels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
            document.getElementById('aqi-val').innerText = aqi;
            document.getElementById('aqi-status').innerText = `Status: ${labels[aqi]}`;
        }

        // C. Radar Simulation
        document.getElementById('map').innerHTML = `
            <div class="sim-map">
                <div class="pulse"></div>
                <h3 style="z-index:1">📍 Scanning ${city}...</h3>
                <p style="z-index:1">Lat: ${lat} | Lon: ${lon}</p>
            </div>
        `;

        // D. Rent & Budget
        let rent = city.toLowerCase().includes("mumbai") ? 35000 : 18000;
        document.getElementById('rent-estimate').innerText = `Avg Rent: ₹${rent}`;
        
        const badge = document.getElementById('budget-badge');
        badge.innerText = budget >= rent ? "Within Budget" : "Over Budget";
        badge.className = `badge ${budget >= rent ? 'badge-green' : 'badge-red'}`;

        // E. Show Dashboard
        document.getElementById('main-dashboard').classList.remove('hidden');

    } catch (e) {
        console.error(e);
        alert("City not found or API error. Check spelling!");
    }
}

// 5. ATTACH EVENT
if (searchBtn) {
    searchBtn.onclick = runAnalysis;
}