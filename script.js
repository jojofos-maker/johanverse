const bubble = document.getElementById("speechBubble");

const sections = [
  {
    id: "top",
    text: "Hei! 👋 Scroll ned så skal jeg fortelle historien min."
  },
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

function updateSpeechBubble() {
  let currentText = sections[0].text;

  for (const section of sections) {
    const el = document.getElementById(section.id);
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.35) {
      currentText = section.text;
    }
  }

  if (bubble && bubble.textContent !== currentText) {
    bubble.style.opacity = "0";
    bubble.style.transform = "translateY(10px)";
    setTimeout(() => {
      bubble.textContent = currentText;
      bubble.style.opacity = "1";
      bubble.style.transform = "translateY(0)";
    }, 180);
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

window.addEventListener("scroll", updateSpeechBubble);
window.addEventListener("load", updateSpeechBubble);
