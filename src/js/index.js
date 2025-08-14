import { insertHeaderFooter } from "../js/util.mjs";
const unsplash_key = import.meta.env.VITE_UNSPLASH_API_KEY;
const PLANS_KEY = "plans_v1";



function formatDT(iso) {
  try { return new Date(iso).toLocaleString("de-DE"); } catch { return iso; }
}

function getAllPlans() {
  try { return JSON.parse(localStorage.getItem(PLANS_KEY) || "[]"); }
  catch { return []; }
}

// Fetch quote
fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent("https://zenquotes.io/api/random"))
    .then(res => res.json())
    .then(data => {
    document.getElementById("quote").textContent = `"${data[0].q}"`;
    document.getElementById("author").textContent = `— ${data[0].a}`;
    })
    .catch(() => {
    document.getElementById("quote").textContent = "Could not load quote.";
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


