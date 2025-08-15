import { insertHeaderFooter } from "../js/util.mjs";


const PLANS_KEY = "plans_v1";

function getAllPlans() {
    try { return JSON.parse(localStorage.getItem(PLANS_KEY) || "[]"); }
    catch { return []; }
}
function savePlans(plans) {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

function formatDT(iso) {
    try { return new Date(iso).toLocaleString("de-DE"); } catch { return iso; }
}

function renderPlans() {
    const container = document.getElementById("plansContainer");
    const emptyMsg = document.getElementById("noPlans");
    const plans = getAllPlans();

    container.innerHTML = "";
    emptyMsg.style.display = plans.length ? "none" : "block";

    plans.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    for (const p of plans) {
    const actCount = (p.activities || []).length;

    const card = document.createElement("div");
    card.className = "plan-card card";
    card.dataset.planId = p.id;

    const header = document.createElement("div");
    header.className = "card-header d-flex justify-content-between align-items-center";
    header.innerHTML = `
        <div>
        <strong>${p.name || ("Plan " + p.id)}</strong>
        <div class="text-muted small">
            Saved: ${formatDT(p.savedAt)} · Start: ${p.baseTime ? formatDT(p.baseTime) : "—"} · ${actCount} activities
        </div>
        </div>
        <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-danger" data-action="delete-plan" data-plan-id="${p.id}">Delete Plan</button>
        </div>
    `;
    card.appendChild(header);

    const body = document.createElement("div");
    body.className = "card-body p-0";

    if (!actCount) {
        body.innerHTML = `<div class="p-3 empty">No activities in this plan.</div>`;
    } else {
        const grid = buildPlanGridTable(p);
        body.appendChild(grid);
    }

    card.appendChild(body);
    container.appendChild(card);
    }
}


document.getElementById("plansContainer").addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches('input[type="checkbox"][data-action="toggle-activity"]')) {
    const planId = String(t.dataset.planId);
    const activityId = String(t.dataset.activityId);
    const completed = t.checked;

    const plans = getAllPlans();
    const plan = plans.find(pl => String(pl.id) === planId);
    if (!plan) return;

    const act = (plan.activities || []).find(ac => String(ac.id) === activityId);
    if (!act) return;

    act.completed = completed;
    savePlans(plans);


    const row = t.closest("tr");
    if (row) row.classList.toggle("completed-row", completed);
    }
});

document.getElementById("plansContainer").addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="delete-plan"]');
    if (!btn) return;

    const planId = String(btn.dataset.planId);
    if (!confirm("Delete this plan? This cannot be undone.")) return;

    let plans = getAllPlans();
    plans = plans.filter(pl => String(pl.id) !== planId);
    savePlans(plans);
    renderPlans();
});



function buildPlanGridTable(p) {
  const COLUMNS = 16; 
  const table = document.createElement("table");
  table.className = "table table-bordered mb-0 plan-grid";

  // THEAD
  const thead = document.createElement("thead");
  thead.className = "table-light";
  const headRow = document.createElement("tr");

  const thFirst = document.createElement("th");
  thFirst.className = "activity-col";
  thFirst.textContent = "Activity";
  headRow.appendChild(thFirst);

  const base = p.baseTime ? new Date(p.baseTime) : new Date(new Date().setMinutes(0, 0, 0));
  for (let i = 0; i < COLUMNS; i++) {
    const th = document.createElement("th");
    const end = new Date(base);
    end.setMinutes(end.getMinutes() + (i + 1) * 30); // show END time of each 30-min slot
    th.textContent = end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    th.className = "slot";
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);


  const tbody = document.createElement("tbody");

  (p.activities || []).forEach(a => {
    const tr = document.createElement("tr");
    tr.dataset.activityId = a.id;
    if (a.completed) tr.classList.add("completed-row");

    const nameTd = document.createElement("td");
    nameTd.innerHTML =
      `<input type="checkbox" data-action="toggle-activity" data-plan-id="${p.id}" data-activity-id="${a.id}" ${a.completed ? "checked" : ""} /> ` +
      `<span>${a.name || "Untitled"}</span>`;
    tr.appendChild(nameTd);

    for (let col = 1; col <= COLUMNS; col++) {
      const td = document.createElement("td");
      td.className = "slot";
      if (col >= a.startSlot && col < a.startSlot + a.requiredSlots) {
        td.classList.add("filled");
      }
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}



renderPlans();
insertHeaderFooter();