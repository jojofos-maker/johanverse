/* =========================
   ELEMENTER
========================= */

const stickyGuide = document.getElementById("stickyGuide");
const stickyBubble = document.getElementById("stickyGuideBubble");
const guideClose = document.getElementById("guideClose");
const guideOpen = document.getElementById("guideOpen");
const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

/* =========================
   TRACKING
========================= */

function trackCloudflareEvent(name) {
  if (window.cloudflare && window.cloudflare.insights) {
    window.cloudflare.insights.track(name);
  }
}

/* Gjør funksjonen tilgjengelig for inline onclick i HTML */
window.trackCloudflareEvent = trackCloudflareEvent;

/* =========================
   STICKY GUIDE TEKSTER
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
    id: "chatbot",
    text: "Her kan du stille korte spørsmål om erfaring, resultater, lederstil og CV."
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
    link.classList.toggle("active", target === sectionId);
  });
}

/* =========================
   STICKY GUIDE OPPDATERING
========================= */

function updateGuide() {
  const scrollY = window.scrollY;
  const guideClosed = localStorage.getItem("guideClosed") === "true";

  if (!guideClosed) {
    if (scrollY > 220) {
      stickyGuide?.classList.add("visible");
    } else {
      stickyGuide?.classList.remove("visible");
    }
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

/* =========================
   SMOOTH SCROLL
========================= */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    const target = document.querySelector(href);

    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

/* =========================
   NAV TRACKING
========================= */

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute("href").replace("#", "");
    trackCloudflareEvent(`Nav: ${target}`);
  });
});

/* =========================
   GUIDE ÅPNE / LUKKE
========================= */

if (localStorage.getItem("guideClosed") === "true") {
  if (stickyGuide) stickyGuide.style.display = "none";
  guideOpen?.classList.add("visible");
}

guideClose?.addEventListener("click", () => {
  if (stickyGuide) {
    stickyGuide.classList.remove("visible");
    stickyGuide.style.display = "none";
  }

  guideOpen?.classList.add("visible");
  localStorage.setItem("guideClosed", "true");
  trackCloudflareEvent("Guide Lukket");
});

guideOpen?.addEventListener("click", () => {
  if (stickyGuide) {
    stickyGuide.style.display = "flex";
    stickyGuide.classList.add("visible");
  }

  guideOpen?.classList.remove("visible");
  localStorage.setItem("guideClosed", "false");
  trackCloudflareEvent("Guide Åpnet");
  trackCloudflareEvent("Guide Open Scroll Chatbot");

  const chatbotSection = document.getElementById("chatbot");
  if (chatbotSection) {
    chatbotSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  updateGuide();
});

/* =========================
   SECTION TRACKING
========================= */

const trackedSections = new Set();

const insightSections = [
  { id: "historien", event: "Section Historien" },
  { id: "resultater", event: "Section Resultater" },
  { id: "faq", event: "Section FAQ" },
  { id: "chatbot", event: "Section Chatbot" },
  { id: "kontakt", event: "Section Kontakt" }
];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const match = insightSections.find(
        (section) => section.id === entry.target.id
      );

      if (!match || trackedSections.has(match.event)) return;

      trackedSections.add(match.event);
      trackCloudflareEvent(match.event);
    });
  },
  {
    threshold: 0.35
  }
);

insightSections.forEach((section) => {
  const el = document.getElementById(section.id);
  if (el) sectionObserver.observe(el);
});

/* =========================
   FAQ TRACKING
========================= */

const faqItems = document.querySelectorAll(".faq-list details");

faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    const summary = item.querySelector("summary");
    const question = summary?.textContent.trim();

    if (!question) return;

    trackCloudflareEvent(`FAQ: ${question}`);
  });
});

/* =========================
   CHATBOT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const suggestionButtons = document.querySelectorAll(".chat-suggestion");

  if (!chatForm || !chatInput || !chatMessages) return;

  const knowledgeBase = window.chatbotKnowledgeBase || [];

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\sæøå]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scoreQuestion(question, item) {
    const normalizedQuestion = normalizeText(question);
    let score = 0;

    item.keywords.forEach((keyword) => {
      const normalizedKeyword = normalizeText(keyword);

      if (normalizedQuestion.includes(normalizedKeyword)) {
        score += normalizedKeyword.includes(" ") ? 3 : 1;
      }
    });

    return score;
  }

  function findBestMatches(question) {
    return knowledgeBase
      .map((item) => ({
        ...item,
        score: scoreQuestion(question, item)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function createFollowUpButtons(followUps) {
    if (!followUps || !followUps.length) return null;

    const wrapper = document.createElement("div");
    wrapper.className = "chatbot-suggestions";

    followUps.forEach((question) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chat-suggestion";
      button.textContent = question;

      button.addEventListener("click", () => {
        trackCloudflareEvent(`Chatbot Oppfølging: ${question}`);
        handleQuestion(question, "followup");
      });

      wrapper.appendChild(button);
    });

    return wrapper;
  }

  function addMessage(text, sender, followUps = []) {
    const message = document.createElement("div");
    message.className = `chatbot-message ${sender}`;

    const textNode = document.createElement("div");
    textNode.textContent = text;
    message.appendChild(textNode);

    if (sender === "bot") {
      const followUpButtons = createFollowUpButtons(followUps);
      if (followUpButtons) {
        message.appendChild(followUpButtons);
      }
    }

    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getBotReply(question) {
    const matches = findBestMatches(question);
    const best = matches[0];
    const second = matches[1];

    if (!best) {
      return {
        text: "Det har jeg ikke nok informasjon om ennå. Prøv gjerne å spørre om erfaring, LiBiR, resultater, lederstil, teknologi, CV eller kontakt.",
        followUps: [
          "Hva slags erfaring har Johan?",
          "Hva er de viktigste resultatene hans?",
          "Hvordan er Johan som leder?"
        ]
      };
    }

    if (second && second.score >= 3 && second.id !== best.id) {
      return {
        text: `${best.answer} ${second.answer}`,
        followUps: best.followUps || []
      };
    }

    return {
      text: best.answer,
      followUps: best.followUps || []
    };
  }

  function handleQuestion(question, source = "typed") {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    addMessage(cleanQuestion, "user");
    trackCloudflareEvent(`Chatbot Spørsmål: ${source}`);

    const reply = getBotReply(cleanQuestion);

    setTimeout(() => {
      addMessage(reply.text, "bot", reply.followUps);
    }, 220);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleQuestion(chatInput.value, "typed");
    chatInput.value = "";
    chatInput.focus();
  });

  suggestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question || button.textContent || "";
      trackCloudflareEvent(`Chatbot Forslag: ${question}`);
      handleQuestion(question, "suggestion");
    });
  });
});
/* =========================
   SCROLL REVEAL
========================= */

const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.15
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});


/* =========================
   EVENTS
========================= */

window.addEventListener("scroll", updateGuide);
window.addEventListener("load", updateGuide);
window.addEventListener("resize", updateGuide);
