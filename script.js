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

  function openChatbotFromGuide() {
    if (chatbotSection) {
      chatbotSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    setTimeout(() => {
      const chatInput = document.getElementById("jj-input");
      if (chatInput) chatInput.focus();
    }, 500);

    trackCloudflareEvent("sticky_guide_to_chatbot");
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

});
/* =========================
   JJ CHATBOT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const messagesEl = document.getElementById("jj-messages");
  const chipsEl = document.getElementById("jj-chips");
  const inputEl = document.getElementById("jj-input");
  const sendBtn = document.getElementById("jj-send");
  const chatForm =
    document.getElementById("jj-form") ||
    document.getElementById("jj-inputform") ||
    document.getElementById("jj-chat-form") ||
    (inputEl ? inputEl.closest("form") : null);

  const knowledgeBase = Array.isArray(window.chatbotKnowledgeBase)
    ? window.chatbotKnowledgeBase
    : [];

  if (!messagesEl || !chipsEl || !inputEl || !sendBtn || !knowledgeBase.length) {
    return;
  }

  function normalizeText(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function scoreEntry(entry, query) {
    const q = normalizeText(query);
    if (!q) return 0;

    let score = 0;

    (entry.keywords || []).forEach((keyword) => {
      const k = normalizeText(keyword);
      if (q === k) score += 100;
      else if (q.includes(k)) score += 40;
      else if (k.includes(q)) score += 20;
    });

    (entry.synonyms || []).forEach((synonym) => {
      const s = normalizeText(synonym);
      if (q === s) score += 90;
      else if (q.includes(s)) score += 35;
      else if (s.includes(q)) score += 18;
    });

    const title = normalizeText(entry.title || "");
    if (q === title) score += 80;
    else if (q.includes(title)) score += 30;

    return score;
  }

  function findBestMatch(query) {
    let best = null;
    let bestScore = 0;

    knowledgeBase.forEach((entry) => {
      const score = scoreEntry(entry, query);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    return bestScore > 0 ? best : null;
  }

  function createMessage(role, text) {
    const row = document.createElement("div");
    row.className = `jj-msg ${role}`;

    if (role === "bot") {
      const avatarWrap = document.createElement("div");
      avatarWrap.className = "jj-av";

      const avatarImg = document.createElement("img");
      avatarImg.src = "assets/johan-cartoon.png";
      avatarImg.alt = "Johan";

      avatarWrap.appendChild(avatarImg);
      row.appendChild(avatarWrap);
    }

    const bubble = document.createElement("div");
    bubble.className = "jj-bubble";

    const paragraphs = String(text).split("\n\n");
    paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      bubble.appendChild(p);
    });

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderChips(followUps) {
    chipsEl.innerHTML = "";

    (followUps || []).forEach((question) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jj-chip";
      btn.textContent = question;
      btn.addEventListener("click", () => {
        jjAskChip(question);
      });
      chipsEl.appendChild(btn);
    });
  }

  function answerQuestion(question) {
    const match = findBestMatch(question);

    if (match) {
      createMessage("bot", match.answer);
      renderChips(match.followUps);
      return;
    }

    createMessage(
      "bot",
      "Jeg fant ikke helt et presist svar på det ennå. Prøv gjerne å spørre om erfaring, lederstil, resultater, endring eller hva Johan ser etter nå."
    );

    renderChips([
      "Hvem er Johan?",
      "Lederegenskaper",
      "Resultater",
      "Bidrag",
      "Endringsevne"
    ]);
  }

  function askQuestion(question) {
    const cleanQuestion = String(question || "").trim();
    if (!cleanQuestion) return;

    createMessage("user", cleanQuestion);
    inputEl.value = "";
    answerQuestion(cleanQuestion);
  }

  window.jjAskChip = function (question) {
    askQuestion(question);
  };

  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      askQuestion(inputEl.value);
    });
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      askQuestion(inputEl.value);
    });
  } else if (inputEl) {
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askQuestion(inputEl.value);
      }
    });
  }

  renderChips([
    "Hvem er Johan?",
    "Lederegenskaper",
    "Resultater",
    "Bidrag",
    "Endringsevne"
  ]);
});
