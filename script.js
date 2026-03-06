const guideOpen = document.getElementById("guideOpen");
const guideClose = document.getElementById("guideClose");
const stickyGuide = document.getElementById("stickyGuide");
const stickyBubble = document.getElementById("stickyGuideBubble");
const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

const sections = [
  {
    id: "historien",
    text: "Her er reisen min i korte trekk — fra Sørlandet til ledelse og selskapsbygging."
  },
  {
    id: "resultater",
    text: "Her er noen konkrete resultater jeg er stolt av."
  },
  {
    id: "faq",
    text: "Her kan du intervjue meg litt før vi snakker sammen."
  },
  {
    id: "kontakt",
    text: "Fikk du lyst til å ta en prat? Her finner du kontaktinfo."
  }
];

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

function updateGuide() {
  const scrollY = window.scrollY;

  if (scrollY > 220) {
    stickyGuide?.classList.add("visible");
  } else {
    stickyGuide?.classList.remove("visible");
  }

  let currentText = "Hei! Jeg følger deg nedover siden.";
  let currentSection = "";

  for (const section of sections) {
    const el = document.getElementById(section.id);
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.45) {
      currentText = section.text;
      currentSection = section.id;
    }
  }

  if (stickyBubble && stickyBubble.textContent !== currentText) {
    stickyBubble.style.opacity = "0";
    stickyBubble.style.transform = "translateY(8px)";
    setTimeout(() => {
      stickyBubble.textContent = currentText;
      stickyBubble.style.opacity = "1";
      stickyBubble.style.transform = "translateY(0)";
    }, 150);
  }

  if (currentSection) {
    setActiveMenu(currentSection);
  } else {
    menuLinks.forEach((link) => link.classList.remove("active"));
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("scroll", updateGuide);
window.addEventListener("load", updateGuide);
window.addEventListener("resize", updateGuide);
if (localStorage.getItem("guideClosed") === "true") {
  stickyGuide.style.display = "none";
}

guideClose?.addEventListener("click", () => {
  stickyGuide.style.display = "none";
  localStorage.setItem("guideClosed", "true");
});
if (localStorage.getItem("guideClosed") === "true") {
  stickyGuide.style.display = "none";
  guideOpen.classList.add("visible");
}

guideClose?.addEventListener("click", () => {
  stickyGuide.style.display = "none";
  guideOpen.classList.add("visible");
  localStorage.setItem("guideClosed", "true");
});

guideOpen?.addEventListener("click", () => {
  stickyGuide.style.display = "flex";
  guideOpen.classList.remove("visible");
  localStorage.setItem("guideClosed", "false");
});
