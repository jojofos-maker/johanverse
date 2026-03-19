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
window.jjAskChip = function (question) {
  const input = document.getElementById("jj-input");
  const send = document.getElementById("jj-send");
  const form =
    document.getElementById("jj-form") ||
    document.getElementById("jj-inputform") ||
    document.getElementById("jj-chat-form") ||
    (input ? input.closest("form") : null);

  if (!input) return;

  input.value = question;
  input.dispatchEvent(new Event("input", { bubbles: true }));

  if (form) {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    return;
  }

  if (send) {
    send.click();
  }
};
