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

if (guideClose && stickyGuide) {
  guideClose.addEventListener("click", () => {
    stickyGuide.classList.add("is-hidden");
    trackCloudflareEvent("sticky_guide_closed");
  });
}

if (guideOpen && stickyGuide) {
  guideOpen.addEventListener("click", () => {
    stickyGuide.classList.remove("is-hidden");
    trackCloudflareEvent("sticky_guide_opened");
  });
}

if (stickyBubble) {
  stickyBubble.addEventListener("click", () => {
    if (stickyGuide) {
      stickyGuide.classList.remove("is-hidden");
      trackCloudflareEvent("sticky_bubble_clicked");
    }
  });
}

/* =========================
   MENYSPORING
========================= */

if (menuLinks.length) {
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";
      trackCloudflareEvent(`menu_click_${href.replace("#", "")}`);
    });
  });
}

/* =========================
   CHATBOT - HJELPEFUNKSJONER
========================= */

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[?.!,;:()]/g, "")
    .replace(/\s+/g, " ");
}

function escapeHTML(text) {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function capitalizeFirst(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getKnowledgeBase() {
  return Array.isArray(window.chatbotKnowledgeBase)
    ? window.chatbotKnowledgeBase
    : [];
}

/* =========================
   CHATBOT - SAMTALEKONTEKST
========================= */

const chatState = {
  lastIntentId: null,
  lastUserMessage: "",
  lastBotAnswer: "",
  recentIntentIds: [],
  lastFollowUps: []
};

function updateChatState({ intentId, userMessage, botAnswer, followUps = [] }) {
  chatState.lastIntentId = intentId || null;
  chatState.lastUserMessage = userMessage || "";
  chatState.lastBotAnswer = botAnswer || "";
  chatState.lastFollowUps = followUps || [];

  if (intentId) {
    chatState.recentIntentIds.push(intentId);
    chatState.recentIntentIds = [...new Set(chatState.recentIntentIds)].slice(-5);
  }
}

function getIntentById(intentId) {
  return getKnowledgeBase().find(item => item.id === intentId) || null;
}

/* =========================
   CHATBOT - FORSTÅ OPPFØLGING
========================= */

function isShortFollowUp(text) {
  const normalized = normalizeText(text);

  const shortPhrases = [
    "fortell mer",
    "mer",
    "utdyp",
    "kan du utdype",
    "hvordan da",
    "hvorfor det",
    "si mer",
    "ok",
    "ja",
    "interessant",
    "skjønner",
    "kan du si mer",
    "hva mener du",
    "hvordan det",
    "hvorfor da"
  ];

  return normalized.split(" ").length <= 4 || shortPhrases.includes(normalized);
}

function isContextQuestion(text) {
  const normalized = normalizeText(text);

  const patterns = [
    "fortell mer",
    "utdyp",
    "si mer",
    "hva mener du",
    "hvordan da",
    "hvorfor det",
    "kan du forklare",
    "kan du utdype",
    "hva betyr det"
  ];

  return patterns.some(pattern => normalized.includes(pattern));
}

/* =========================
   CHATBOT - MATCHING
========================= */

function scoreMatch(item, userMessage) {
  const normalizedMessage = normalizeText(userMessage);
  const keywords = item.keywords || [];
  const synonyms = item.synonyms || [];

  let score = 0;

  keywords.forEach(word => {
    const normalizedWord = normalizeText(word);
    if (!normalizedWord) return;

    if (normalizedMessage === normalizedWord) {
      score += 5;
    } else if (normalizedMessage.includes(normalizedWord)) {
      score += 3;
    }
  });

  synonyms.forEach(word => {
    const normalizedWord = normalizeText(word);
    if (!normalizedWord) return;

    if (normalizedMessage === normalizedWord) {
      score += 4;
    } else if (normalizedMessage.includes(normalizedWord)) {
      score += 2;
    }
  });

  return score;
}

function findBestMatch(userMessage) {
  const knowledgeBase = getKnowledgeBase();
  if (!knowledgeBase.length) return null;

  let bestMatch = null;
  let bestScore = 0;

  knowledgeBase.forEach(item => {
    const score = scoreMatch(item, userMessage);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  if ((!bestMatch || bestScore < 2) && chatState.lastIntentId && isShortFollowUp(userMessage)) {
    return getIntentById(chatState.lastIntentId);
  }

  if ((!bestMatch || bestScore < 2) && chatState.lastIntentId && isContextQuestion(userMessage)) {
    return getIntentById(chatState.lastIntentId);
  }

  return bestScore >= 2 ? bestMatch : null;
}

/* =========================
   CHATBOT - MER SAMTALETONE
========================= */

function getTopicBridge(currentIntent) {
  if (!chatState.lastIntentId || chatState.lastIntentId === currentIntent.id) {
    return "";
  }

  const previousIntent = getIntentById(chatState.lastIntentId);
  if (!previousIntent) return "";

  const bridges = [
    `Dette henger også sammen med ${previousIntent.title.toLowerCase()}.`,
    `Dette bygger videre på ${previousIntent.title.toLowerCase()}.`,
    `Her er det en naturlig kobling til ${previousIntent.title.toLowerCase()}.`
  ];

  return bridges[Math.floor(Math.random() * bridges.length)];
}

function buildConversationalIntro(currentIntent, userMessage) {
  if (
    chatState.lastIntentId &&
    currentIntent &&
    chatState.lastIntentId === currentIntent.id &&
    (isShortFollowUp(userMessage) || isContextQuestion(userMessage))
  ) {
    const intros = [
      "Ja, jeg kan bygge videre på det.",
      "Klart – her er litt mer om det.",
      "Absolutt, jeg utdyper gjerne.",
      "Ja, la oss gå litt dypere inn i det."
    ];

    return intros[Math.floor(Math.random() * intros.length)];
  }

  if (
    chatState.lastIntentId &&
    currentIntent &&
    chatState.lastIntentId !== currentIntent.id
  ) {
    const previousIntent = getIntentById(chatState.lastIntentId);

    if (previousIntent) {
      const intros = [
        `Du spurte nettopp om ${previousIntent.title.toLowerCase()}, så her er neste del av bildet.`,
        `Dette henger godt sammen med det du nettopp spurte om.`,
        `La oss bygge videre fra det forrige spørsmålet ditt.`
      ];

      return intros[Math.floor(Math.random() * intros.length)];
    }
  }

  const defaultIntros = [
    "Ja, gjerne.",
    "Klart.",
    "Her er det viktigste:",
    "Absolutt.",
    "Gjerne."
  ];

  return defaultIntros[Math.floor(Math.random() * defaultIntros.length)];
}

function buildContextualAnswer(intent, userMessage) {
  const intro = buildConversationalIntro(intent, userMessage);
  const bridge = getTopicBridge(intent);

  if (bridge) {
    return `${intro}\n\n${bridge}\n\n${intent.answer}`;
  }

  return `${intro}\n\n${intent.answer}`;
}

/* =========================
   CHATBOT - FOLLOW-UPS
========================= */

function getFallbackFollowUps(currentIntentId) {
  const fallbackMap = {
    experience: [
      "Hvilke roller har Johan hatt?",
      "Hvilke bransjer har han jobbet i?",
      "Hva er hans sterkeste kompetanseområder?"
    ],
    leadership: [
      "Hvordan beskrives Johan som leder?",
      "Hvordan jobber han med kultur og folk?",
      "Hva kjennetegner lederstilen hans?"
    ],
    results: [
      "Hvilke resultater har Johan skapt?",
      "Har han erfaring med vekst og omstilling?",
      "Hva har han levert som daglig leder?"
    ]
  };

  return fallbackMap[currentIntentId] || [
    "Hva slags erfaring har Johan?",
    "Hvordan er Johan som leder?",
    "Hva kan Johan bidra med?"
  ];
}

function getUniqueFollowUps(followUps, currentIntentId) {
  const previous = new Set(chatState.lastFollowUps || []);
  const cleaned = (followUps || [])
    .map(item => (item || "").trim())
    .filter(Boolean);

  const uniqueNew = cleaned.filter(item => !previous.has(item));

  const result = [...uniqueNew];

  const fallback = getFallbackFollowUps(currentIntentId);
  fallback.forEach(item => {
    if (!result.includes(item)) {
      result.push(item);
    }
  });

  return result.slice(0, 3);
}

/* =========================
   CHATBOT - RENDERING
========================= */

function renderMessage(text, sender = "bot") {
  if (!chatbotMessages) return;

  const message = document.createElement("div");
  message.className = `chat-message ${sender === "user" ? "chat-message-user" : "chat-message-bot"}`;

  const formattedText = escapeHTML(text).replace(/\n/g, "<br>");
  message.innerHTML = `<div class="chat-message-bubble">${formattedText}</div>`;

  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function renderBotMessage(text) {
  renderMessage(text, "bot");
}

function renderUserMessage(text) {
  renderMessage(text, "user");
}

function clearFollowUps() {
  if (!chatbotFollowUps) return;
  chatbotFollowUps.innerHTML = "";
}

function renderFollowUps(followUps) {
  if (!chatbotFollowUps) return;

  clearFollowUps();

  followUps.forEach(question => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chatbot-followup";
    button.textContent = question;

    button.addEventListener("click", () => {
      if (chatbotInput) {
        chatbotInput.value = question;
      }
      handleChatbotSubmit(question, true);
    });

    chatbotFollowUps.appendChild(button);
  });
}

/* =========================
   CHATBOT - FALLBACK
========================= */

function getFallbackReply() {
  if (chatState.lastIntentId) {
    const lastIntent = getIntentById(chatState.lastIntentId);

    if (lastIntent) {
      return `Jeg er ikke helt sikker på hva du mener, men det kan hende du vil videre i temaet ${lastIntent.title.toLowerCase()}. Du kan også spørre mer konkret om erfaring, lederstil, resultater, bransjer eller hva Johan kan bidra med.`;
    }
  }

  return "Jeg er ikke helt sikker på hva du mener ennå. Du kan gjerne spørre om erfaring, lederstil, resultater, bransjer eller hva Johan kan bidra med.";
}

/* =========================
   CHATBOT - HOVEDLOGIKK
========================= */

function handleChatbotSubmit(forcedMessage = null, fromFollowUp = false) {
  if (!chatbotInput && !forcedMessage) return;

  const rawInput = forcedMessage || chatbotInput.value;
  const userInput = (rawInput || "").trim();

  if (!userInput) return;

  renderUserMessage(userInput);

  if (chatbotInput) {
    chatbotInput.value = "";
  }

  const match = findBestMatch(userInput);

  if (match) {
    const reply = buildContextualAnswer(match, userInput);
    const followUps = getUniqueFollowUps(match.followUps || [], match.id);

    renderBotMessage(reply);
    renderFollowUps(followUps);

    updateChatState({
      intentId: match.id,
      userMessage: userInput,
      botAnswer: reply,
      followUps
    });

    trackCloudflareEvent(`chatbot_match_${match.id}`);
  } else {
    const fallbackReply = getFallbackReply();
    const fallbackFollowUps = getUniqueFollowUps([], null);

    renderBotMessage(fallbackReply);
    renderFollowUps(fallbackFollowUps);

    updateChatState({
      intentId: null,
      userMessage: userInput,
      botAnswer: fallbackReply,
      followUps: fallbackFollowUps
    });

    trackCloudflareEvent("chatbot_fallback");
  }

  trackCloudflareEvent(fromFollowUp ? "chatbot_followup_clicked" : "chatbot_user_question");
}

/* =========================
   CHATBOT - INIT
========================= */

if (chatbotForm) {
  chatbotForm.addEventListener("submit", event => {
    event.preventDefault();
    handleChatbotSubmit();
  });
}

function initChatbotWelcome() {
  if (!chatbotMessages) return;
  if (chatbotMessages.children.length > 0) return;

  const welcomeMessage =
    "Hei! Jeg kan svare på spørsmål om Johan Jørgen Fossli – for eksempel erfaring, lederstil, resultater, bransjer og hva han kan bidra med.";

  const welcomeFollowUps = [
    "Hva slags erfaring har Johan?",
    "Hvordan er Johan som leder?",
    "Hvilke resultater har han skapt?"
  ];

  renderBotMessage(welcomeMessage);
  renderFollowUps(welcomeFollowUps);

  updateChatState({
    intentId: null,
    userMessage: "",
    botAnswer: welcomeMessage,
    followUps: welcomeFollowUps
  });
}

initChatbotWelcome();
