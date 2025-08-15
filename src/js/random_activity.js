import { insertHeaderFooter } from "../js/util.mjs";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const testBtn = document.getElementById("test-btn");
const activityBox = document.getElementById("activity-box");
const findBtn = document.getElementById("find-activity-btn");
const updateBtn = document.getElementById("update-position-btn");

let selectedActivity = null;
let userCoords = null;



// Get user's current position
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// Haversine formula to calculate distance in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Estimate walk time (minutes)
function estimateWalkTime(distanceMeters) {
    return distanceMeters / 80; // ~80 meters per minute (average walk speed)
}

// Find a nearby place using Geoapify
async function findNearbyPlace(lat, lon) {
    const categories = [
    "entertainment",
    "leisure",
    "commercial",
    "education.library",
    "sport",
    "commercial.hobby.games",
    "catering.resteraunt.persian",
    "natural.forest",
    "natural.water.hot_spring",
    "natural.mountain",
    "pet.shop",
    "tourism"
    ];

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const url = `https://api.geoapify.com/v2/places?categories=${randomCategory}&filter=circle:${lon},${lat},5000&bias=proximity:${lon},${lat}&limit=1&apiKey=${GEOAPIFY_KEY}`;

    const res = await fetch(url);
    const data = await res.json();
    return data.features[0];
}

// When "Find Random Activity" is clicked
findBtn.addEventListener("click", async () => {
    activityBox.textContent = "Getting your position…";

    try {
    const pos = await getCurrentLocation();
    userCoords = pos.coords;

    const place = await findNearbyPlace(userCoords.latitude, userCoords.longitude);

    if (!place) {
        activityBox.textContent = "No nearby activity found.";
        return;

    

    }
    document.getElementById("activity-box").classList.add("loaded");
    console.log(place)

    selectedActivity = {
        name: place.properties.name || "Unknown Place",
        address: place.properties.formatted,
        lat: place.geometry.coordinates[1],
        lon: place.geometry.coordinates[0],
        category: place.properties.categories[place.properties.categories.length - 1]
    };

    activityBox.innerHTML = `
        <strong>Walk toward this location:</strong><br>
        ${place.properties.formatted}<br>
        (Activity will be revealed when you are close)
        `;
    updateBtn.disabled = false;
    } catch (err) {
    activityBox.textContent = "Error: " + err.message;
    }
});

// When "Update Position" is clicked
updateBtn.addEventListener("click", async () => {
    if (!selectedActivity) return;

    try {
    const pos = await getCurrentLocation();
    const { latitude, longitude } = pos.coords;

    const dist = getDistanceMeters(latitude, longitude, selectedActivity.lat, selectedActivity.lon);
    const walkTime = estimateWalkTime(dist);

    if (walkTime <= 10) {
        activityBox.innerHTML = `
            <strong>${selectedActivity.name}</strong><br>
             <em>Category:</em> ${selectedActivity.category}<br>
            ${selectedActivity.address}<br>
            You're close! (~${Math.round(walkTime)} min walk)
            `;
    } else {
        activityBox.textContent = `Keep going! You're about ${Math.round(walkTime)} minutes away.`;
    }
    } catch (err) {
    activityBox.textContent = "Error getting updated position.";
    }
});



testBtn.addEventListener("click", () => {
  if (!selectedActivity) {
    activityBox.textContent = "No activity selected yet.";
    return;
  }
  
  // Simulate a position ~150 meters away
  const simulatedLat = selectedActivity.lat + 0.001; // Roughly ~111m latitude shift
  const simulatedLon = selectedActivity.lon;

  const dist = getDistanceMeters(simulatedLat, simulatedLon, selectedActivity.lat, selectedActivity.lon);
  const walkTime = estimateWalkTime(dist);
  console.log("Selected Place:", selectedActivity.properties);

  if (walkTime <= 10) {
    activityBox.innerHTML = `
      <strong>${selectedActivity.name}</strong><br>
       <em>Category:</em> ${selectedActivity.category}<br>
      ${selectedActivity.address}<br>
      (Simulated) You're close! (~${Math.round(walkTime)} min walk)
    `;
  } else {
    activityBox.textContent = `(Simulated) Still far away (~${Math.round(walkTime)} min walk).`;
  }
});


insertHeaderFooter()