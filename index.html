/* =========================
   ELEMENTER
========================= */

const stickyGuide = document.getElementById("stickyGuide");
const stickyBubble = document.getElementById("stickyGuideBubble");
const guideClose = document.getElementById("guideClose");
const guideOpen = document.getElementById("guideOpen");
const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotFollowUps = document.getElementById("chatbotFollowUps");

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
   STICKY GUIDE
========================= */

if (guideClose && stickyGuide && stickyBubble) {
  guideClose.addEventListener("click", () => {
    stickyGuide.classList.add("is-hidden");
    stickyBubble.classList.add("is-visible");
  });
}

if (guideOpen && stickyGuide && stickyBubble) {
  guideOpen.addEventListener("click", () => {
    stickyGuide.classList.remove("is-hidden");
    stickyBubble.classList.remove("is-visible");
  });
}

/* =========================
   MENYTRACKING
========================= */

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const href = link.getAttribute("href");
    if (href) {
      trackCloudflareEvent(`menu_click_${href.replace("#", "")}`);
    }
  });
});

/* =========================
   REVEAL
========================= */

const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

/* =========================
   CHATBOT DATA
========================= */

const chatbotKnowledge = Array.isArray(window.chatbotKnowledgeBase)
  ? window.chatbotKnowledgeBase
  : [];

const chatbotState = {
  lastMatchId: null,
  lastSuggestions: [],
  lastUserMessage: "",
  turnCount: 0
};

const SMALL_TALK = {
  greetings: ["hei", "hallo", "hey", "god dag", "heisann"],
  thanks: ["takk", "tusen takk", "supert takk", "flott takk"],
  shortFollowUps: [
    "fortell mer",
    "mer",
    "utdyp",
    "kan du utdype",
    "hvordan da",
    "hva mener du",
    "si mer"
  ]
};

/* =========================
   HJELPEFUNKSJONER
========================= */

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:()]/g, "")
    .replace(/\s+/g, " ");
}

function splitWords(text) {
  return normalizeText(text)
    .split(" ")
    .filter(Boolean);
}

function addMessage(text, sender = "bot") {
  if (!chatbotMessages) return;

  const message = document.createElement("div");
  message.className = `chatbot-message chatbot-message--${sender}`;
  message.textContent = text;

  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function clearFollowUps() {
  if (!chatbotFollowUps) return;
  chatbotFollowUps.innerHTML = "";
}

function renderFollowUps(followUps = []) {
  if (!chatbotFollowUps) return;

  clearFollowUps();

  if (!followUps.length) return;

  followUps.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chatbot-followup";
    button.textContent = question;

    button.addEventListener("click", () => {
      if (chatbotInput) {
        chatbotInput.value = question;
      }
      handleChatbotMessage(question);
    });

    chatbotFollowUps.appendChild(button);
  });
}

function getRandomItems(items = [], count = 3, exclude = []) {
  const filtered = items.filter((item) => !exclude.includes(item));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function collectGeneralFollowUps(exclude = []) {
  const allFollowUps = chatbotKnowledge.flatMap((item) =>
    Array.isArray(item.followUps) ? item.followUps : []
  );

  const unique = [...new Set(allFollowUps)];
  return getRandomItems(unique, 3, exclude);
}

function isGreeting(text) {
  const normalized = normalizeText(text);
  return SMALL_TALK.greetings.some((word) => normalized === word);
}

function isThanks(text) {
  const normalized = normalizeText(text);
  return SMALL_TALK.thanks.some((word) => normalized.includes(word));
}

function isShortFollowUp(text) {
  const normalized = normalizeText(text);
  return (
    normalized.split(" ").length <= 4 &&
    SMALL_TALK.shortFollowUps.some((phrase) => normalized.includes(phrase))
  );
}

function isVeryShortMessage(text) {
  return splitWords(text).length <= 3;
}

function scoreTopic(entry, userText) {
  const normalizedInput = normalizeText(userText);
  const words = splitWords(userText);

  let score = 0;

  const keywords = Array.isArray(entry.keywords) ? entry.keywords : [];
  const synonyms = Array.isArray(entry.synonyms) ? entry.synonyms : [];
  const phrases = [...keywords, ...synonyms].map(normalizeText);

  phrases.forEach((phrase) => {
    if (!phrase) return;

    if (normalizedInput === phrase) {
      score += 12;
    } else if (normalizedInput.includes(phrase)) {
      score += phrase.split(" ").length > 1 ? 8 : 4;
    }

    const phraseWords = phrase.split(" ");
    const allWordsMatch = phraseWords.every((word) => words.includes(word));
    if (allWordsMatch) {
      score += phraseWords.length > 1 ? 6 : 2;
    }
  });

  if (chatbotState.lastMatchId === entry.id) {
    score += 1;
  }

  return score;
}

function findBestMatch(userText) {
  let bestMatch = null;
  let bestScore = 0;

  chatbotKnowledge.forEach((entry) => {
    const score = scoreTopic(entry, userText);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  if (bestScore < 3) {
    return null;
  }

  return bestMatch;
}

function findById(id) {
  return chatbotKnowledge.find((item) => item.id === id) || null;
}

function getContextAwareMatch(userText) {
  const directMatch = findBestMatch(userText);
  if (directMatch) return directMatch;

  if (
    chatbotState.lastMatchId &&
    (isShortFollowUp(userText) || isVeryShortMessage(userText))
  ) {
    return findById(chatbotState.lastMatchId);
  }

  return null;
}

function buildAnswer(match, userText) {
  if (chatbotState.lastMatchId === match.id && isShortFollowUp(userText)) {
    return `${match.answer} ${
      match.followUps && match.followUps.length
        ? "Du kan også spørre videre om et av forslagene under."
        : ""
    }`;
  }

  return match.answer;
}

function buildFollowUps(match) {
  const topicFollowUps = Array.isArray(match.followUps) ? match.followUps : [];
  const freshTopicFollowUps = topicFollowUps.filter(
    (item) => !chatbotState.lastSuggestions.includes(item)
  );

  let selected = freshTopicFollowUps.slice(0, 3);

  if (selected.length < 3) {
    const extra = collectGeneralFollowUps([
      ...selected,
      ...chatbotState.lastSuggestions
    ]);
    selected = [...selected, ...extra].slice(0, 3);
  }

  chatbotState.lastSuggestions = selected;
  return selected;
}

function getFallbackResponse() {
  const suggestions = collectGeneralFollowUps(chatbotState.lastSuggestions);

  chatbotState.lastSuggestions = suggestions;

  return {
    answer:
      "Jeg er ikke helt sikker på hva du mener ennå. Du kan gjerne spørre om erfaring, lederstil, resultater, CV eller hva Johan kan bidra med.",
    followUps: suggestions
  };
}

function handleSmallTalk(userText) {
  if (isGreeting(userText)) {
    const suggestions = collectGeneralFollowUps(chatbotState.lastSuggestions);
    chatbotState.lastSuggestions = suggestions;

    return {
      answer:
        "Hei! Du kan spørre meg om Johan Jørgen Fossli, erfaringen hans, lederstilen hans, resultatene hans eller hva han kan bidra med.",
      followUps: suggestions
    };
  }

  if (isThanks(userText)) {
    const suggestions = collectGeneralFollowUps(chatbotState.lastSuggestions);
    chatbotState.lastSuggestions = suggestions;

    return {
      answer: "Bare hyggelig. Hva vil du vite mer om?",
      followUps: suggestions
    };
  }

  return null;
}

function handleChatbotMessage(rawMessage) {
  const userText = rawMessage.trim();
  if (!userText) return;

  addMessage(userText, "user");
  clearFollowUps();

  chatbotState.lastUserMessage = userText;
  chatbotState.turnCount += 1;

  trackCloudflareEvent("chatbot_question_sent");

  const smallTalkResponse = handleSmallTalk(userText);
  if (smallTalkResponse) {
    addMessage(smallTalkResponse.answer, "bot");
    renderFollowUps(smallTalkResponse.followUps);
    return;
  }

  const match = getContextAwareMatch(userText);

  if (match) {
    chatbotState.lastMatchId = match.id;

    const answer = buildAnswer(match, userText);
    const followUps = buildFollowUps(match);

    addMessage(answer, "bot");
    renderFollowUps(followUps);

    trackCloudflareEvent(`chatbot_match_${match.id}`);
    return;
  }

  chatbotState.lastMatchId = null;

  const fallback = getFallbackResponse();
  addMessage(fallback.answer, "bot");
  renderFollowUps(fallback.followUps);

  trackCloudflareEvent("chatbot_fallback");
}

/* =========================
   CHATBOT EVENTS
========================= */

if (chatbotForm && chatbotInput) {
  chatbotForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = chatbotInput.value;
    handleChatbotMessage(message);

    chatbotInput.value = "";
    chatbotInput.focus();
  });
}

/* =========================
   STATISKE FORSLAGSKNAPPER
========================= */

function bindInitialSuggestionButtons() {
  const suggestionButtons = document.querySelectorAll(".chat-suggestion");

  suggestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const text = button.dataset.question || button.textContent.trim();

      if (chatbotInput) {
        chatbotInput.value = text;
      }

      handleChatbotMessage(text);
    });
  });
}

bindInitialSuggestionButtons();
