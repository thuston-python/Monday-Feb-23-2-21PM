const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setError(id, msg) {
  const el = document.querySelector(`[data-error-for="${id}"]`);
  if (el) el.textContent = msg || "";
}

function isValidPhone(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length === 10;
}

// Mobile nav
(function setupMobileNav(){
  const toggle = $(".nav-toggle");
  const links = document.querySelector("[data-navlinks]");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.addEventListener("click", (e) => {
    if (!e.target.closest("a")) return;
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
})();

// Footer year
(function setYear(){
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();

// Contact form: validate, then submit to Formspree via fetch (nice success message)
(function setupContactForm(){
  const form = $("#contactForm");
  const note = $("#formNote");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = $("#name")?.value.trim();
    const phone = $("#phone")?.value.trim();
    const service = $("#service")?.value.trim();
    const size = $("#size")?.value.trim();
    const vehicle = $("#vehicle")?.value.trim();
    const message = $("#message")?.value.trim();

    ["name","phone","service","size","vehicle","message"].forEach(id => setError(id, ""));
    if (note) note.textContent = "";

    let ok = true;
    if (!name) { setError("name", "Enter your name."); ok = false; }
    if (!isValidPhone(phone)) { setError("phone", "Enter a valid 10-digit number."); ok = false; }
    if (!service) { setError("service", "Select a service."); ok = false; }
    if (!size) { setError("size", "Select a size."); ok = false; }
    if (!vehicle) { setError("vehicle", "Enter your vehicle."); ok = false; }
    if (!message || message.length < 6) { setError("message", "Add a short note."); ok = false; }

    if (!ok) return;

    // Formspree submit
    try {
      if (note) note.textContent = "Sending…";

      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        if (note) note.textContent = "✅ Sent! We'll text/call you back ASAP.";
        form.reset();
      } else {
        if (note) note.textContent = "Something went wrong. Please text/call instead.";
      }
    } catch {
      if (note) note.textContent = "Network error. Please text/call instead.";
    }
  });
})();

// Pricing
const PRICING = {
  sizes: {
    small:  { label: "Small" },
    medium: { label: "Medium" },
    large:  { label: "Large" }
  },
  packages: [
    {
      name: "Interior",
      time: "1.5–3 hrs",
      bestFor: "Inside reset",
      prices: { small: 140, medium: 160, large: 180 },
      includes: ["Vacuum", "Wipe down", "Windows", "Light spot treatment"]
    },
    {
      name: "Exterior",
      time: "1–2.5 hrs",
      bestFor: "Outside reset",
      prices: { small: 100, medium: 120, large: 140 },
      includes: ["Hand wash", "Wheels + tires", "Bug removal", "Windows"]
    },
    {
      name: "Full Detail",
      time: "2.5–5 hrs",
      bestFor: "Best overall",
      prices: { small: 220, medium: 260, large: 300 },
      includes: ["Interior + Exterior", "Final inspection"]
    }
  ]
};

let selectedSizeKey = "small";

function renderPricing() {
  const grid = $("#pricingGrid");
  if (!grid) return;

  const sizeLabel = PRICING.sizes[selectedSizeKey].label;

  grid.innerHTML = PRICING.packages.map(pkg => {
    const price = pkg.prices[selectedSizeKey];
    return `
      <article class="card price-card">
        <div class="price-top-row">
          <div>
            <h3 class="h3">${pkg.name}</h3>
            <div class="meta">
              <span class="badge">${sizeLabel}</span>
              <span class="badge">${pkg.time}</span>
              <span class="badge">${pkg.bestFor}</span>
            </div>
          </div>
          <div class="price">$${price}</div>
        </div>

        <ul class="list">
          ${pkg.includes.map(x => `<li>${x}</li>`).join("")}
        </ul>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
          <a class="btn btn-primary" href="#contact">Request a Quote</a>
          <a class="btn btn-ghost" href="#services">Services</a>
        </div>
      </article>
    `;
  }).join("");
}

function setupSizeSelector() {
  const buttons = $$(".seg[data-size]");
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedSizeKey = btn.dataset.size;
      buttons.forEach(b => b.classList.toggle("is-active", b === btn));
      renderPricing();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderPricing();
  setupSizeSelector();
});
