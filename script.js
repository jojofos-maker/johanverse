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
   CHATBOT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const suggestionButtons = document.querySelectorAll(".chat-suggestion");

  if (!chatForm || !chatInput || !chatMessages) return;

 const knowledgeBase = [
  {
    id: "intro",
    keywords: ["hvem", "johan", "fossli", "bakgrunn", "profil", "fortell om johan"],
    answer:
      "Johan Jørgen Fossli bruker denne siden som en personlig kandidatprofil. Han presenteres som en erfaren leder og daglig leder med over 25 års erfaring fra ledelse, drift, strategi, organisasjonsutvikling og forretningsutvikling."
  },
  {
    id: "leadership-profile",
    keywords: ["lederprofil", "leder", "lederstil", "ledelse", "hvordan leder", "hva slags leder"],
    answer:
      "Johan beskrives som en operativ og menneskeorientert leder. Han liker å være tett på organisasjonen, skape retning, bygge kultur og få resultater gjennom andre. Han er opptatt av ro, struktur, tydelig kommunikasjon og å la andre skinne."
  },
  {
    id: "experience",
    keywords: ["erfaring", "karriere", "bakgrunn", "toppleder", "ledererfaring", "arbeidserfaring"],
    answer:
      "Johan har over 25 års erfaring som toppleder og operativ leder. Han har jobbet med strategi, drift, økonomi og organisasjon, og har erfaring med å bygge opp selskaper, skape vekst og lede virksomheter frem til salg og fusjon."
  },
  {
    id: "libir",
    keywords: ["libir", "libr", "daglig leder", "renovasjon", "lillesand", "birkenes", "interkommunalt renovasjonsselskap"],
    answer:
      "Johan var daglig leder i LiBiR IKS i 16 år. LiBiR er et interkommunalt renovasjonsselskap eid av Lillesand og Birkenes. I rollen hadde han helhetlig ansvar for strategi, drift, økonomi og organisasjon."
  },
  {
    id: "responsibility",
    keywords: ["ansvar", "strategi", "drift", "okonomi", "økonomi", "organisasjon", "helhetlig ansvar"],
    answer:
      "Johans ledererfaring spenner over strategi, daglig drift, økonomistyring og organisasjonsutvikling. Han har jobbet med både operativ gjennomføring og langsiktig utvikling."
  },
  {
    id: "company-building",
    keywords: ["bygget opp", "selskapsbygging", "bygge selskap", "entreprenørskap", "nye selskaper", "nye satsinger"],
    answer:
      "Johan har erfaring med å bygge opp selskaper og utvikle nye satsinger. På siden trekkes det særlig frem arbeid med Miljøpartner Sør og videre utvikling frem mot Lindum Sør."
  },
  {
    id: "growth",
    keywords: ["vekst", "skapt vekst", "omsetning", "forretningsutvikling", "kommersielt"],
    answer:
      "Johan har jobbet med forretningsutvikling og vekst i flere sammenhenger. Et konkret resultat som løftes frem er +50 % omsetningsvekst i Agder Miljø i en krevende oppbyggingsfase."
  },
  {
    id: "sale-fusion",
    keywords: ["salg", "fusjon", "ledet frem til salg", "ledet frem til fusjon", "transaksjon"],
    answer:
      "Johan har erfaring med å bygge opp virksomheter, skape vekst og lede utvikling frem til salg og fusjon. Dette løftes særlig frem i beskrivelsen av Miljøpartner Sør og Lindum Sør."
  },
  {
    id: "results",
    keywords: ["resultat", "resultater", "gjennomføring", "prestasjoner", "meritter"],
    answer:
      "Noen av resultatene som trekkes frem på siden er 16 år som daglig leder i LiBiR, 2× Gaselle knyttet til Miljøpartner Sør og Lindum Sør, og +50 % omsetningsvekst i Agder Miljø."
  },
  {
    id: "gaselle",
    keywords: ["gaselle", "gasellepris", "gaselleutmerkelse", "deloitte gaselle", "lindum sør 2019"],
    answer:
      "Gaselle-resultatet på siden er knyttet til Miljøpartner Sør og Lindum Sør. Gaselle-diplomet som vises gjelder Lindum Sør i 2019."
  },
  {
    id: "agder-miljo",
    keywords: ["agder miljø", "agder miljo", "biokull", "miljoløsninger", "miljøløsninger"],
    answer:
      "I Agder Miljø jobbet Johan med biokull og nye miljøløsninger. Det beskrives som en krevende, lærerik og fremtidsrettet fase som også ga tydelige kommersielle resultater."
  },
  {
    id: "technology",
    keywords: ["teknologi", "digital", "ai", "systemer", "digitalisering"],
    answer:
      "Johan jobber praktisk og nysgjerrig med teknologi. Tilnærmingen hans er at teknologi skal brukes til å forbedre drift, beslutninger og arbeidsflyt – ikke som et mål i seg selv."
  },
  {
    id: "crisis",
    keywords: ["krise", "kriser", "kriseledelse", "håndterer du kriser", "hvordan håndterer"],
    answer:
      "Når det blir krevende, beskrives Johan som rolig og strukturert. Han legger vekt på å skaffe oversikt, prioritere tydelig og gjennomføre med klar kommunikasjon."
  },
  {
    id: "first90",
    keywords: ["90", "første 90", "ny rolle", "første dager", "første 100 dager"],
    answer:
      'I en ny rolle vil Johan først lytte, analysere, bygge relasjoner og etablere tydelig retning før større grep tas.'
  },
  {
    id: "contribution",
    keywords: ["bidra", "hva kan du bidra med", "styrker", "hva tilfører", "verdi"],
    answer:
      "Johan løfter særlig frem evnen til å skape retning, bygge struktur, utvikle organisasjoner, drive forretningsutvikling og gjøre strategi om til handling."
  },
  {
    id: "people-culture",
    keywords: ["mennesker", "kultur", "organisasjon", "team", "ansatte"],
    answer:
      "En tydelig del av Johans lederfilosofi er at ledelse handler om mennesker. Han er opptatt av kultur, involvering, tydelighet og å få andre til å lykkes."
  },
  {
    id: "philosophy",
    keywords: ["filosofi", "lederskapsfilosofi", "innsikter", "verdier"],
    answer:
      "På siden trekkes det frem flere prinsipper: ledelse handler først og fremst om mennesker, teknologi er et verktøy – ikke en strategi, kultur slår strategi når hverdagen blir krevende, og ledelse handler om å la andre skinne."
  },
  {
    id: "cv",
    keywords: ["cv", "resume", "pdf", "kort cv", "full cv", "last ned cv"],
    answer:
      "Du finner både kort CV og full CV som PDF på siden. Lenker ligger både i chatbot-seksjonen og i kontaktseksjonen."
  },
  {
    id: "contact",
    keywords: ["kontakt", "e-post", "epost", "telefon", "linkedin", "intervju", "ta kontakt"],
    answer:
      "Du kan ta kontakt via kontaktseksjonen på siden, på e-post, telefon eller LinkedIn. Målet med siden er å gjøre det enkelt å invitere Johan til en prat eller et intervju."
  }
];
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

function getBotReply(question) {
  const ranked = knowledgeBase
    .map((item) => ({
      ...item,
      score: scoreQuestion(question, item)
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const secondBest = ranked[1];

  if (best && best.score > 0) {
    if (secondBest && secondBest.score >= 3 && secondBest.id !== best.id) {
      return `${best.answer} ${secondBest.answer}`;
    }

    return best.answer;
  }

  return "Det har jeg ikke nok informasjon om ennå. Prøv gjerne å spørre om erfaring, LiBiR, resultater, lederstil, teknologi, første 90 dager eller CV. Du kan også se FAQ-en eller kontakte Johan direkte.";
}

  function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `chatbot-message ${sender}`;
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleQuestion(question, source = "typed") {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) return;

    addMessage(cleanQuestion, "user");
    trackCloudflareEvent(`Chatbot Spørsmål: ${source}`);

    const reply = getBotReply(cleanQuestion);

    setTimeout(() => {
      addMessage(reply, "bot");
    }, 250);
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
   EVENTS
========================= */

window.addEventListener("scroll", updateGuide);
window.addEventListener("load", updateGuide);
window.addEventListener("resize", updateGuide);
