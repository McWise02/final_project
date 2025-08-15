import { insertHeaderFooter } from "../js/util.mjs";
const unsplash_key = import.meta.env.VITE_UNSPLASH_API_KEY;
const PLANS_KEY = "plans_v1";
const url = "https://quotes15.p.rapidapi.com/quotes/random/?language_code=en";


function formatDT(iso) {
  try { return new Date(iso).toLocaleString("de-DE"); } catch { return iso; }
}

function getAllPlans() {
  try { return JSON.parse(localStorage.getItem(PLANS_KEY) || "[]"); }
  catch { return []; }
}

const options = {
	method: "GET",
	headers: {
		"x-rapidapi-key": "f7b2c7458dmshec854bed9253511p1fc532jsn5f12f98561ed",
		"x-rapidapi-host": "quotes15.p.rapidapi.com"
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.json();
	console.log(result);
  document.getElementById("quote").textContent = `"${result.content}"`;
  document.getElementById("author").textContent = `— ${result.originator.name}`;
} catch (error) {
	console.error(error);
  document.getElementById("quote").textContent = "Could not load quote.";
}
// Fetch ran
// Fetch quote
fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent("https://zenquotes.io/api/random"))
    .then(res => res.json())
    .then(data => {
    
    
    })
    .catch(() => {
    
    });

// Fetch random image from Unsplash (you can replace with your image API)

fetch(`https://api.unsplash.com/photos/random?query=motivation&client_id=${unsplash_key}`)
  .then((res) => res.json())
  .then((data) => {
    const imageUrl = data.urls.regular;
    document.getElementById("inspiration-img").src = imageUrl;
  })
  .catch((error) => console.error("Error fetching image:", error));

// Simulated check for existing plan from localStorage
const plans = getAllPlans();

if (plans.length > 0) {
  const firstPlan = plans[0];
  const actCount = (firstPlan.activities || []).length;
  document.getElementById("plan-display").textContent =
    `Today's Plan: ${firstPlan.name || "Plan " + firstPlan.id} — ${actCount} activities — Start: ${firstPlan.baseTime ? formatDT(firstPlan.baseTime) : "—"}`;
  document.querySelector("#current-plan a").style.display = "none";
} else {
  document.getElementById("plan-display").textContent = "No current plan available.";
}

insertHeaderFooter()


