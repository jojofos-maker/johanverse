/* =========================
   TRACKING
========================= */

function trackCloudflareEvent(name) {
  if (window.cloudflare && window.cloudflare.insights) {
    window.cloudflare.insights.track(name);
  }
}

window.trackCloudflareEvent = trackCloudflareEvent;

/* =========================
   DOM READY
========================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     STICKY GUIDE
  ========================== */

  const stickyGuide = document.getElementById("stickyGuide");
  const guideClose = document.getElementById("guideClose");
  const guideOpen = document.getElementById("guideOpen");
   const chatbotSection = document.getElementById("chatbot");
const chatbotInput = document.getElementById("chatbotInput");

  if (guideClose && stickyGuide) {
    guideClose.addEventListener("click", () => {
      stickyGuide.classList.add("is-closed");
      trackCloudflareEvent("sticky_closed");
    });
  }

  if (guideOpen && stickyGuide) {
    guideOpen.addEventListener("click", () => {
      stickyGuide.classList.remove("is-closed");
      trackCloudflareEvent("sticky_opened");
    });
  }
if (stickyGuide) {
  stickyGuide.addEventListener("click", (event) => {
    const clickedClose = event.target.closest("#guideClose");
    if (clickedClose) return;

    openChatbotFromGuide();
  });
}
  /* =========================
     SMOOTH SCROLL
  ========================== */

  document.querySelectorAll('a[href^="#"]').forEach(link => {
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
     REVEAL
  ========================== */

  const revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(el => observer.observe(el));
  }

  /* =========================
     SEKSJON TRACKING
  ========================== */

  const sections = document.querySelectorAll("section[id]");
  const seen = new Set();

  if (sections.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        if (seen.has(id)) return;

        seen.add(id);
        trackCloudflareEvent("section_" + id);
      });
    }, { threshold: 0.4 });

    sections.forEach(sec => observer.observe(sec));
  }
function openChatbotFromGuide() {
  if (chatbotSection) {
    chatbotSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  setTimeout(() => {
    if (chatbotInput) {
      chatbotInput.focus();
    }
  }, 500);

  trackCloudflareEvent("sticky_guide_to_chatbot");
}
  /* =========================
     FAQ TRACKING
  ========================== */

  document.querySelectorAll(".faq details").forEach((item, i) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        trackCloudflareEvent("faq_" + (i + 1));
      }
    });
  });

/* =========================
   CHATBOT
========================= */

const messagesEl = document.getElementById("chatbotMessages");
const form = document.getElementById("chatbotForm");
const input = document.getElementById("chatbotInput");
const followUpsEl = document.getElementById("chatbotFollowUps");

if (!messagesEl || !form || !input) {
  console.error("Chatbot init stoppet:", {
    messagesEl,
    form,
    input,
    followUpsEl
  });
  return;
}

let lastAnswerId = null;

function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = "chatbot-message " + sender;
  msg.textContent = text;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function scoreQuestion(q, item) {
  let score = 0;
  const text = q.toLowerCase();

  item.keywords?.forEach(k => {
    if (text.includes(k.toLowerCase())) score += 2;
  });

  item.synonyms?.forEach(s => {
    if (text.includes(s.toLowerCase())) score += 1;
  });

  return score;
}

function findBestAnswer(question) {
  if (!window.chatbotKnowledgeBase) return null;

  let best = null;
  let bestScore = 0;

  window.chatbotKnowledgeBase.forEach(item => {
    const score = scoreQuestion(question, item);

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });

  return bestScore > 0 ? best : null;
}

function showFollowUps(list) {
  if (!followUpsEl) return;

  followUpsEl.innerHTML = "";

  if (!list || !list.length) return;

  list.slice(0, 4).forEach(q => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chat-suggestion";
    btn.textContent = q;

    btn.addEventListener("click", () => {
      askQuestion(q);
    });

    followUpsEl.appendChild(btn);
  });
}

function askQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;

  addMessage(cleanQuestion, "user");

  const answer = findBestAnswer(cleanQuestion);

  if (answer) {
    addMessage(answer.answer, "bot");

    if (answer.id !== lastAnswerId) {
      showFollowUps(answer.followUps);
      lastAnswerId = answer.id;
    }
  } else {
    addMessage(
      "Godt spørsmål — det bør jeg kunne svare bedre på. Prøv å spørre om erfaring, lederstil eller hva Johan kan bidra med.",
      "bot"
    );

    showFollowUps([
      "Hvem er Johan?",
      "Hva slags erfaring har du?",
      "Hva slags leder er du?",
      "Hva kan du bidra med?"
    ]);
  }

  trackCloudflareEvent("chat_question");
  input.value = "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  askQuestion(input.value);
});

/* =========================
   SUGGESTION KNAPPER
========================= */

document.querySelectorAll(".chat-suggestion").forEach(btn => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.question || btn.textContent;
    if (!q) return;

    askQuestion(q);
  });
});

});
