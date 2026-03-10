/* =========================
   ELEMENTER
========================= */

const stickyGuide = document.getElementById("stickyGuide");
const stickyBubble = document.getElementById("stickyGuideBubble");
const guideClose = document.getElementById("guideClose");
const guideOpen = document.getElementById("guideOpen");
const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

/* =========================
   TEKSTER FOR STICKY GUIDE
========================= */

const sections = [
  {
    id: "historien",
    text: "Her er den korte versjonen av reisen min — fra Sørlandet til ledelse og selskapsbygging."
  },
  {
    id: "resultater",
    text: "Jeg liker ikke bare ideer. Jeg liker resultater."
  },
  {
    id: "faq",
    text: "Her kan du få et inntrykk av hvordan jeg tenker som leder."
  },
  {
    id: "kontakt",
    text: "Fikk du lyst til å ta en prat? Her finner du kontaktinfo."
  }
];

/* =========================
   MENYMARKERING
========================= */

function setActiveMenu(sectionId) {
  menuLinks.forEach((link) => {
    const target = link.getAttribute("href").replace("#", "");

    if (target === sectionId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* =========================
   STICKY GUIDE OPPDATERING
========================= */

function updateGuide() {
  const scrollY = window.scrollY;

  // Vis sticky guide etter litt scroll
  if (scrollY > 220) {
    stickyGuide?.classList.add("visible");
  } else {
    stickyGuide?.classList.remove("visible");
  }

  let currentText = "Hei! Jeg følger deg nedover siden.";
  let currentSection = "";

  sections.forEach((section) => {
    const el = document.getElementById(section.id);
    if (!el) return;

    const rect = el.getBoundingClientRect();

    if (rect.top <= window.innerHeight * 0.45) {
      currentText = section.text;
      currentSection = section.id;
    }
  });

  // Bytt tekst i boblen
  if (stickyBubble && stickyBubble.textContent !== currentText) {
    stickyBubble.style.opacity = "0";
    stickyBubble.style.transform = "translateY(8px)";

    setTimeout(() => {
      stickyBubble.textContent = currentText;
      stickyBubble.style.opacity = "1";
      stickyBubble.style.transform = "translateY(0)";
    }, 150);
  }

  // Marker aktiv seksjon i menyen
  if (currentSection) {
    setActiveMenu(currentSection);
  } else {
    menuLinks.forEach((link) => link.classList.remove("active"));
  }
}

/* =========================
   SMOOTH SCROLL
========================= */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

/* =========================
   LUKK / ÅPNE GUIDE
========================= */

// Husk hvis bruker tidligere har lukket guiden
if (localStorage.getItem("guideClosed") === "true") {
  if (stickyGuide) stickyGuide.style.display = "none";
  guideOpen?.classList.add("visible");
}

// Lukk guide
guideClose?.addEventListener("click", () => {
  if (stickyGuide) stickyGuide.style.display = "none";
  guideOpen?.classList.add("visible");
  localStorage.setItem("guideClosed", "true");
});

// Åpne guide igjen
guideOpen?.addEventListener("click", () => {
  if (stickyGuide) stickyGuide.style.display = "flex";
  guideOpen?.classList.remove("visible");
  localStorage.setItem("guideClosed", "false");
  updateGuide();
});

/* =========================
   EVENTS
========================= */

window.addEventListener("scroll", updateGuide);
window.addEventListener("load", updateGuide);
window.addEventListener("resize", updateGuide);
