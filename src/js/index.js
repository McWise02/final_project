import { insertHeaderFooter } from "../js/util.mjs";
const unsplash_key = import.meta.env.VITE_UNSPLASH_API_KEY;


// Fetch quote
fetch("https://zenquotes.io/api/quotes/random")
    .then(res => res.json())
    .then(data => {
    document.getElementById("quote").textContent = `"${data.q}"`;
    document.getElementById("author").textContent = `— ${data.a}`;
    })
    .catch(() => {
    document.getElementById("quote").textContent = "Could not load quote.";
    });

// Fetch random image from Unsplash (you can replace with your image API)

// fetch(`https://api.unsplash.com/photos/random?query=motivation&client_id=${unsplash_key}`)
//   .then((res) => res.json())
//   .then((data) => {
//     const imageUrl = data.urls.regular;
//     document.getElementById("inspiration-img").src = imageUrl;
//   })
//   .catch((error) => console.error("Error fetching image:", error));

// Simulated check for existing plan from localStorage
const plan = localStorage.getItem("currentPlan");
if (plan) {
    document.getElementById("plan-display").textContent = `Today's Plan: ${plan}`;
    document.querySelector("#current-plan a").style.display = "none";
}

insertHeaderFooter()


