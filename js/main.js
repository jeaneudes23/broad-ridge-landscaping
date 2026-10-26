/* Broad Ridge Landscaping — site behaviour */

// ===== Site settings: change the WhatsApp number here (country code, digits only) =====
const WHATSAPP_NUMBER = "250788000000"; // PLACEHOLDER

const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// ----- WhatsApp links -----
document.querySelectorAll("[data-wa]").forEach((el) => {
  el.href = waLink(el.dataset.wa);
  el.target = "_blank";
  el.rel = "noopener";
});

// ----- Footer year -----
document.getElementById("year").textContent = new Date().getFullYear();

// ----- Header shadow on scroll -----
const header = document.getElementById("header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ----- Mobile navigation -----
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navIcon = navToggle.querySelector("use");

function setNav(open) {
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  navIcon.setAttribute("href", open ? "#i-close" : "#i-menu");
}

navToggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) {
    setNav(false);
    navToggle.focus();
  }
});
window.matchMedia("(min-width: 1025px)").addEventListener("change", (e) => { if (e.matches) setNav(false); });

// ----- Highlight the nav link for the section in view -----
const navLinks = [...document.querySelectorAll(".nav__list a")];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => {
      if (a.getAttribute("href") === `#${entry.target.id}`) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((s) => sectionObserver.observe(s));

// ----- Before / after slider -----
const compare = document.getElementById("compare");
if (compare) {
  const range = compare.querySelector(".compare__range");
  const update = () => compare.style.setProperty("--pos", `${range.value}%`);
  range.addEventListener("input", update);
  update();
}

// ----- "Get a quote" links pre-select the service -----
const serviceSelect = document.getElementById("f-service");
document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => { serviceSelect.value = link.dataset.service; });
});

// ----- Consultation form -> WhatsApp -----
const form = document.getElementById("quoteForm");
const summary = document.getElementById("errorSummary");

const rules = {
  name: (v) => (v.trim().length >= 2 ? "" : "Enter your name."),
  phone: (v) => (v.replace(/\D/g, "").length >= 9 ? "" : "Enter a phone number with at least 9 digits, e.g. 078 000 0000."),
  service: (v) => (v ? "" : "Choose the service you're interested in."),
};

function validateField(field) {
  const rule = rules[field.name];
  if (!rule) return "";
  const message = rule(field.value);
  const errorEl = document.getElementById(`${field.id}-err`);
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (errorEl) errorEl.textContent = message;
  return message;
}

Object.keys(rules).forEach((name) => {
  const field = form.elements[name];
  field.addEventListener("blur", () => { if (field.value) validateField(field); });
  field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const errors = Object.keys(rules)
    .map((name) => ({ field: form.elements[name], message: validateField(form.elements[name]) }))
    .filter((x) => x.message);

  if (errors.length) {
    const list = summary.querySelector("ul");
    list.innerHTML = "";
    errors.forEach(({ field, message }) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${field.id}`;
      a.textContent = message;
      a.addEventListener("click", (ev) => { ev.preventDefault(); field.focus(); });
      li.append(a);
      list.append(li);
    });
    summary.hidden = false;
    summary.focus();
    return;
  }

  summary.hidden = true;
  const data = Object.fromEntries(new FormData(form));
  const details = [
    `Name: ${data.name.trim()}`,
    `Phone: ${data.phone.trim()}`,
    data.area.trim() && `Neighbourhood: ${data.area.trim()}`,
    `Service: ${data.service}`,
    data.message.trim() && `Details: ${data.message.trim()}`,
  ].filter(Boolean);
  const text = ["Hello Broad Ridge, I'd like to book a free consultation.", "", ...details].join("\n");

  window.open(waLink(text), "_blank", "noopener");
});

// ----- Reveal on scroll (skipped when reduced motion is preferred) -----
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const targets = document.querySelectorAll(".section-head, .service-card, .step, .post, .compare, .stats, .quote-form");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("is-visible");
      revealObserver.unobserve(el);
      // Hand transitions back to the element's own hover styles once revealed
      el.addEventListener("transitionend", () => {
        el.classList.remove("reveal", "is-visible");
        el.style.transitionDelay = "";
      }, { once: true });
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${(i % 4) * 40}ms`;
    revealObserver.observe(el);
  });
}
