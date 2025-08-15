import { insertHeaderFooter } from "../js/util.mjs";

const randomActivityBtn = document.getElementById("randomActivityBtn");
let hasClearedPlaceholder = false;
const activityDisplay = document.getElementById("activityDisplay");

const PLANS_KEY = "plans_v1";
const JSON_URL = "/json/activities.json"; 
const RESULTS_LIMIT = 10; 
const scheduleHeaderRow = document.getElementById("scheduleHeaderRow");
const scheduleBody = document.getElementById("scheduleBody");


const createBtn = document.getElementById("createBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const saveNotice = document.getElementById("saveNotice");
const searchinput = document.getElementById("activitySearch");
const btn = document.getElementById("searchActivityBtn");
const box = document.getElementById("activityResults");


const SLOT_MINUTES = 30;
const VISIBLE_COLUMNS = 16; 
const STORAGE_KEY = "schedule_v1";

// Helpers
function nextFullHour() {
  const d = new Date();
  if (d.getMinutes() > 0) d.setHours(d.getHours() + 1);
  d.setMinutes(0, 0, 0);
  return d;
}
function addMinutes(date, mins) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + mins);
  return d;
}


class Activity {
  constructor({ id, name, requiredSlots, startSlot, completed = false, createdAt = new Date().toISOString() }) {
    this.id = id || (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
    this.name = name;
    this.requiredSlots = requiredSlots; 
    this.startSlot = startSlot;
    this.completed = completed;
    this.createdAt = createdAt;
  }
}

class Schedule {
  constructor({ slotMinutes, visibleColumns, headerRowEl, bodyEl }) {
    this.slotMinutes = slotMinutes;
    this.visibleColumns = visibleColumns;
    this.headerRowEl = headerRowEl;
    this.bodyEl = bodyEl;
    this.baseTime = nextFullHour(); 
    this.slotMap = {};            
    this.activities = [];        
  }

  startNew() {

    this.slotMap = {};
    for (let i = 1; i <= this.visibleColumns; i++) this.slotMap[i] = false;
    this.activities = [];
    this.renderHeader();
    this.renderBody();
  }

  renderHeader() {
    this.headerRowEl.innerHTML = "<th>Activity</th>";
    for (let i = 0; i < this.visibleColumns; i++) {
      const th = document.createElement("th");
      const endTime = addMinutes(this.baseTime, (i + 1) * this.slotMinutes);
      th.textContent = endTime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      th.className = "slot";
      this.headerRowEl.appendChild(th);
    }
  }

  renderBody() {
    this.bodyEl.innerHTML = "";
    this.activities.forEach(a => this.appendRow(a));
  }

  findNextFreeBlock(requiredSlots) {
    for (let start = 1; start <= this.visibleColumns - requiredSlots + 1; start++) {
      let allFree = true;
      for (let j = 0; j < requiredSlots; j++) {
        if (this.slotMap[start + j]) { allFree = false; break; }
      }
      if (allFree) return start;
    }
    return -1;
  }

  markSlotsTaken(start, requiredSlots) {
    for (let k = start; k < start + requiredSlots; k++) this.slotMap[k] = true;
  }

  addActivity(name, requiredSlots) {
    const start = this.findNextFreeBlock(requiredSlots);
    if (start === -1) { alert("No space left in these 8 hours."); return null; }
    this.markSlotsTaken(start, requiredSlots);
    const activity = new Activity({ name, requiredSlots, startSlot: start });
    this.activities.push(activity);
    this.appendRow(activity);
    return activity; 
  }

  toggleCompleted(id, completed) {
    const a = this.activities.find(x => x.id === id);
    if (!a) return;
    a.completed = completed;
    const row = this.bodyEl.querySelector(`tr[data-id="${id}"]`);
    if (row) row.classList.toggle("completed", completed);
 
  }

  appendRow(activity) {
    const tr = document.createElement("tr");
    tr.dataset.id = activity.id;
    if (activity.completed) tr.classList.add("completed");

   
    const nameTd = document.createElement("td");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = activity.completed;
    cb.addEventListener("change", () => this.toggleCompleted(activity.id, cb.checked));
    const label = document.createElement("span");
    label.textContent = " " + activity.name;
    nameTd.appendChild(cb);
    nameTd.appendChild(label);
    tr.appendChild(nameTd);

  
    for (let i = 1; i <= this.visibleColumns; i++) {
      const td = document.createElement("td");
      td.className = "slot";
      if (i >= activity.startSlot && i < activity.startSlot + activity.requiredSlots) {
        td.classList.add("filled");
      }
      tr.appendChild(td);
    }

    this.bodyEl.appendChild(tr);
  }


  save() {
    const data = {
      baseTime: this.baseTime.toISOString(),
      slotMap: this.slotMap,
      activities: this.activities
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      this.baseTime = data.baseTime ? new Date(data.baseTime) : nextFullHour();
      this.slotMap = data.slotMap || {};
      this.activities = (data.activities || []).map(a => new Activity(a));
      this.renderHeader();
      this.renderBody();
      return true;
    } catch {
      return false;
    }
  }

  clearCurrentPlan() {
    this.startNew(); 
  }

  clearSavedCopy() {
    localStorage.removeItem(STORAGE_KEY);
  }
}


const schedule = new Schedule({
  slotMinutes: SLOT_MINUTES,
  visibleColumns: VISIBLE_COLUMNS,
  headerRowEl: scheduleHeaderRow,
  bodyEl: scheduleBody
});


if (!schedule.load()) schedule.startNew();


randomActivityBtn.addEventListener("click", async () => {
  try {
    const activityData = await fetchRandomActivity();

    if (!hasClearedPlaceholder) {
      activityDisplay.innerHTML = "";
      hasClearedPlaceholder = true;
    }

    const durationOptions = [1, 2, 3, 4, 5,6]; 
    const requiredSlots = durationOptions[Math.floor(Math.random() * durationOptions.length)];



    let action = schedule.addActivity(activityData.activity, requiredSlots);
    if (action) {
    const card = document.createElement("div");
    card.className = "border rounded p-3 mb-3 bg-light text-start";
    card.innerHTML = `
      <h5>${activityData.activity}</h5>
      <p><strong>Duration:</strong> ${requiredSlots * SLOT_MINUTES} minutes</p>
    `;
    activityDisplay.appendChild(card);
    }
  } catch (error) {
    console.error("Error fetching activity:", error);
  }
});

async function fetchRandomActivity() {
  const target = `https://bored-api.appbrewery.com/random?_=${Date.now()}`;
  const proxy  = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}


function handleActivitySelect(activityData) {
  const requiredSlots = activityData.duration;
  const card = document.createElement("div");
  card.className = "border rounded p-3 mb-3 bg-light text-start";
  card.innerHTML = `
    <h5>${activityData.activity}</h5>
    <p><strong>Duration:</strong> ${requiredSlots * SLOT_MINUTES} minutes</p>
  `;
  activityDisplay.appendChild(card);
  schedule.addActivity(activityData.activity, requiredSlots);
  }




saveBtn.addEventListener("click", () => {
  const name = prompt("Name this plan:", new Date().toLocaleString("de-DE")) || "Untitled Plan";
  saveCurrentPlanAsNew(name);        // append to PLANS_KEY array
  saveNotice.style.display = "inline";
  setTimeout(() => (saveNotice.style.display = "none"), 1500);
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear the current plan? (Saved copy will remain until you overwrite with Save Plan)")) return;
  schedule.clearCurrentPlan();
  activityDisplay.innerHTML = "";

});

createBtn.addEventListener("click", () => {

  schedule.baseTime = nextFullHour();
  schedule.startNew();               
});



function getAllPlans() {
  try { return JSON.parse(localStorage.getItem(PLANS_KEY) || "[]"); }
  catch { return []; }
}

function renderResults(items) {

  box.innerHTML = "";

  if (!items.length) {
    box.classList.remove("show");
    return;
  }

  items.forEach(item => {
    const btnEl = document.createElement("button");
    btnEl.type = "button";
    btnEl.className = "dropdown-item text-wrap";
    btnEl.innerHTML = `
      <div class="fw-semibold">${item.activity}</div>
      <div class="small text-muted">Type: ${item.type} · Duration: ${item.duration} · Participants: ${item.participants}</div>
    `;
    btnEl.addEventListener("click", () => {
      handleActivitySelect(item);
      searchinput.value = "";
      box.classList.remove("show");
    });
    box.appendChild(btnEl);
  });

  box.classList.add("show");
}



function normalize(str) {
  return String(str || "").toLowerCase().trim();
}


async function searchActivities(query) {
  const q = normalize(query);
  if (!q) return [];

  try {
    const res = await fetch(JSON_URL); 
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const activities = await res.json();

    return activities
      .filter(a => {
        const name = normalize(a.activity);
        const type = normalize(a.type);
        const durStr = String(a.duration ?? "").toLowerCase(); 
        return (
          name.includes(q) ||
          type.includes(q) ||
          durStr === q ||          
          durStr.includes(q)       
        );
      })
      .slice(0, RESULTS_LIMIT);
  } catch (err) {
    console.error("Failed to fetch activities:", err);
    return [];
  }
}



function saveCurrentPlanAsNew(name = new Date().toLocaleString("de-DE")) {
  const plans = getAllPlans();
  const nextId = plans.length ? Math.max(...plans.map(p => Number(p.id) || 0)) + 1 : 1; // 1,2,3,...

  const snapshot = {
    id: nextId,
    name,
    savedAt: new Date().toISOString(),
    baseTime: schedule.baseTime.toISOString(),
    slotMap: { ...schedule.slotMap },
    activities: schedule.activities.map(a => ({ ...a }))
  };
  plans.push(snapshot);
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

async function runSearch() {
  
    const q = searchinput.value;
    console.log("Searching for:", q);
    const results = await searchActivities(q);
    renderResults(results);
  }


btn.addEventListener("click", runSearch);
document.addEventListener("click", (e) => {
  const within = e.target.closest(".position-relative");
  if(!within) box.classList.remove("show");
});

insertHeaderFooter()
