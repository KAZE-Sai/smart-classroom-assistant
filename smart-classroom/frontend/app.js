const API = "http://localhost:5000/api/chat";
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const suggestions = { style: { display: "none" } }; // replaced by right sidebar
const sessionList = document.getElementById("sessionList");

// Session management
let sessions = JSON.parse(localStorage.getItem("aria_sessions") || "[]");
let activeSessionId = null;
let history = [];

// Boot: load sessions or start fresh
window.addEventListener("DOMContentLoaded", () => {
  renderSessionList();
  if (sessions.length > 0) {
    loadSession(sessions[0].id);
  } else {
    newChat();
  }
});

function newChat() {
  const id = Date.now().toString();
  const session = { id, title: "New Chat", messages: [] };
  sessions.unshift(session);
  saveSessions();
  loadSession(id);
}

function loadSession(id) {
  activeSessionId = id;
  history = [];
  chatBox.innerHTML = "";
  suggestions.style.display = "flex";

  const session = sessions.find((s) => s.id === id);
  if (!session) return;

  if (session.messages.length === 0) {
    const welcomeText = "Hey! I'm Nyx, your AI study buddy. How can I help?";
    speakOnce(welcomeText);
    showGreeting();
    appendBotBubble(
      "Hey! 👋 I'm **Nyx**, your AI study buddy. How can I help?",
      false
    );
  } else {
    suggestions.style.display = "none";
    session.messages.forEach((msg) => {
      if (msg.role === "user") appendUserBubble(msg.content, false);
      else appendBotBubble(msg.content, false);
      history.push({ role: msg.role === "bot" ? "assistant" : "user", content: msg.content });
    });
  }

  renderSessionList();
  scrollDown();
}

function renderSessionList() {
  sessionList.innerHTML = "";
  if (sessions.length === 0) {
    sessionList.innerHTML = `<div class="empty-state"><div class="big-icon">💬</div><p>No chats yet.<br>Start a new one!</p></div>`;
    return;
  }
  sessions.forEach((s) => {
    const el = document.createElement("div");
    el.className = "session-item" + (s.id === activeSessionId ? " active" : "");
    el.innerHTML = `
      <span class="session-icon">💬</span>
      <span class="session-label" title="${escapeHtml(s.title)}">${escapeHtml(s.title)}</span>
      <div class="session-actions">
        <button class="session-btn" title="Rename" onclick="renameSession(event, '${s.id}')">✏️</button>
        <button class="session-btn delete" title="Delete" onclick="deleteSession(event, '${s.id}')">🗑️</button>
      </div>
    `;
    el.addEventListener("click", (e) => {
      if (!e.target.closest(".session-actions")) {
        // if in mini mode, expand on click
        const sidebar = document.getElementById("sidebar");
        if (sidebar.classList.contains("mini")) {
          sidebar.classList.remove("mini");
        }
        loadSession(s.id);
      }
    });
    sessionList.appendChild(el);
  });
}

function saveSessions() {
  // Keep max 30 sessions, trim message content to avoid localStorage bloat
  const trimmed = sessions.slice(0, 30);
  localStorage.setItem("aria_sessions", JSON.stringify(trimmed));
}

function updateSessionTitle(id, firstMessage) {
  const session = sessions.find((s) => s.id === id);
  if (session && session.title === "New Chat") {
    session.title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "…" : "");
    saveSessions();
    renderSessionList();
  }
}

function saveMessage(role, content) {
  const session = sessions.find((s) => s.id === activeSessionId);
  if (session) {
    session.messages.push({ role, content });
    saveSessions();
  }
}

function renameSession(e, id) {
  e.stopPropagation();
  const session = sessions.find((s) => s.id === id);
  if (!session) return;
  const newName = prompt("Rename chat:", session.title);
  if (newName && newName.trim()) {
    session.title = newName.trim().slice(0, 50);
    saveSessions();
    renderSessionList();
  }
}

function deleteSession(e, id) {
  e.stopPropagation();
  if (!confirm("Delete this chat?")) return;
  sessions = sessions.filter((s) => s.id !== id);
  saveSessions();
  if (activeSessionId === id) {
    if (sessions.length > 0) loadSession(sessions[0].id);
    else newChat();
  } else {
    renderSessionList();
  }
}


function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar.classList.contains("mini") && !sidebar.classList.contains("collapsed")) {
    // full → mini
    sidebar.classList.add("mini");
  } else if (sidebar.classList.contains("mini")) {
    // mini → hidden
    sidebar.classList.remove("mini");
    sidebar.classList.add("collapsed");
  } else {
    // hidden → full
    sidebar.classList.remove("collapsed");
  }
}

// Send shortcut
function send(text) {
  userInput.value = text;
  suggestions.style.display = "none";
  sendMessage();
}

userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  let text = userInput.value.trim();
  if (!text && !attachedFileContent) return;
  if (sendBtn.disabled) return;

  // Combine file content with message
  let fullMessage = text;
  if (attachedFileContent) {
    fullMessage = attachedFileContent + (text ? `\n\nUser note: ${text}` : "");
    clearFile();
  }

  suggestions.style.display = "none";
  appendUserBubble(text || `📎 ${attachedFileName}`);
  history.push({ role: "user", content: fullMessage });
  saveMessage("user", fullMessage);
  updateSessionTitle(activeSessionId, text || attachedFileName);

  userInput.value = "";
  userInput.style.height = "auto";
  sendBtn.disabled = true;
  showTyping();
  setMood("think");
  document.querySelector(".dot")?.classList.add("thinking");

  await sleep(500);

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: fullMessage, history: history.slice(-12) }),
    });

    const data = await res.json();
    removeTyping();
    document.querySelector(".dot")?.classList.remove("thinking");
    const reply = data.reply || data.error || "Hmm, something went wrong. Try again!";
    history.push({ role: "assistant", content: reply });
    saveMessage("bot", reply);
    setMood(detectMood(fullMessage || text));
    const botMsg = await typewriterMessage(reply);
    if (botMsg) addReactions(botMsg);
  } catch {
    removeTyping();
    document.querySelector(".dot")?.classList.remove("thinking");
    setMood("default");
    appendBotBubble("Oops! Can't reach the server. Make sure the backend is running on port 5000. 🔌");
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// DOM helpers
function appendUserBubble(text, animate = true) {
  const msg = document.createElement("div");
  msg.className = "message user";
  if (!animate) msg.style.animation = "none";
  msg.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  chatBox.appendChild(msg);
  scrollDown();
}

function appendBotBubble(text, animate = true) {
  const msg = document.createElement("div");
  msg.className = "message bot";
  if (!animate) msg.style.animation = "none";
  msg.innerHTML = `<div class="bubble">${formatText(text)}</div>`;
  chatBox.appendChild(msg);
  scrollDown();
}

function showTyping() {
  const el = document.createElement("div");
  el.className = "message bot";
  el.id = "typingIndicator";
  el.innerHTML = `
    <div class="eve-thinking">
      <svg class="eve-think-robot" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="teWhite" cx="35%" cy="25%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="70%" stop-color="#e8f4f8"/>
            <stop offset="100%" stop-color="#c8dde8"/>
          </radialGradient>
          <radialGradient id="teFace" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#1a1a2e"/>
            <stop offset="100%" stop-color="#0a0a14"/>
          </radialGradient>
          <radialGradient id="teEye" cx="30%" cy="25%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="30%" stop-color="#93c5fd"/>
            <stop offset="100%" stop-color="#1d4ed8"/>
          </radialGradient>
          <filter id="teGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="teEyeGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <ellipse cx="30" cy="58" rx="16" ry="20" fill="url(#teWhite)" filter="url(#teGlow)"/>
        <ellipse class="think-arm-l" cx="9" cy="54" rx="4" ry="11" fill="url(#teWhite)" transform="rotate(-20 9 54)"/>
        <ellipse class="think-arm-r" cx="51" cy="52" rx="4" ry="12" fill="url(#teWhite)" transform="rotate(35 51 52)"/>
        <ellipse cx="30" cy="37" rx="9" ry="3" fill="#0a0a0a"/>
        <ellipse cx="30" cy="26" rx="16" ry="14" fill="url(#teWhite)" filter="url(#teGlow)"/>
        <ellipse cx="30" cy="28" rx="11" ry="10" fill="url(#teFace)"/>
        <ellipse class="think-eye-l" cx="23" cy="27" rx="5" ry="4" fill="url(#teEye)" filter="url(#teEyeGlow)"/>
        <ellipse class="think-eye-r" cx="37" cy="27" rx="5" ry="4" fill="url(#teEye)" filter="url(#teEyeGlow)"/>
        <line x1="19" y1="25" x2="27" y2="25" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
        <line x1="19" y1="27" x2="27" y2="27" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
        <line x1="19" y1="29" x2="27" y2="29" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
        <line x1="33" y1="25" x2="41" y2="25" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
        <line x1="33" y1="27" x2="41" y2="27" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
        <line x1="33" y1="29" x2="41" y2="29" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
        <ellipse cx="23" cy="19" rx="5" ry="3" fill="#ffffff" opacity="0.35"/>
      </svg>
      <div class="think-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatBox.appendChild(el);
  scrollDown();
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

async function typewriterMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message bot";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  msg.appendChild(bubble);
  chatBox.appendChild(msg);

  const plain = text;
  let i = 0;
  const step = plain.length > 300 ? 4 : 2;

  await new Promise((resolve) => {
    const interval = setInterval(() => {
      i += step;
      bubble.innerHTML = formatText(plain.slice(0, i));
      scrollDown();
      if (i >= plain.length) {
        clearInterval(interval);
        bubble.innerHTML = formatText(plain);
        scrollDown();
        resolve();
      }
    }, 16);
  });
  return msg;
}

function formatText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code style="background:#0d1117;padding:2px 5px;border-radius:4px;font-size:0.88em">$1</code>')
    .replace(/\n/g, "<br>");
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Enhancements ──────────────────────────────────────────────────────

function scrollDown() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Scroll-to-bottom button
chatBox.addEventListener("scroll", () => {
  const btn = document.getElementById("scrollBtn");
  const nearBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 120;
  btn.style.display = nearBottom ? "none" : "flex";
});

// Ripple effect on all buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const r = document.createElement("span");
  r.className = "ripple-effect";
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.appendChild(r);
  setTimeout(() => r.remove(), 600);
});

// Particle burst on send
function burstParticles(x, y) {
  const colors = ["#38bdf8","#7dd3fc","#e0f2fe","#0ea5e9","#bae6fd"];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const angle = (i / 10) * 360;
    const dist = 40 + Math.random() * 30;
    p.style.left = x + "px";
    p.style.top  = y + "px";
    p.style.background = colors[i % colors.length];
    p.style.setProperty("--dx", Math.cos(angle * Math.PI/180) * dist + "px");
    p.style.setProperty("--dy", Math.sin(angle * Math.PI/180) * dist + "px");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 650);
  }
}

document.getElementById("sendBtn").addEventListener("click", (e) => {
  const r = e.target.getBoundingClientRect();
  burstParticles(r.left + r.width/2, r.top + r.height/2);
});

// Nyx mood — change EVE eye color based on topic
function setMood(mood) {
  const eve = document.querySelector(".eve");
  if (!eve) return;
  eve.className = "eve mood-" + mood;
  if (mood !== "default") {
    setTimeout(() => { eve.className = "eve mood-default"; }, 4000);
  }
}

function detectMood(text) {
  const t = text.toLowerCase();
  if (/quiz|test|question|mcq/.test(t))           return "quiz";
  if (/plan|schedule|exam in|days/.test(t))        return "plan";
  if (/missed|absent|skip/.test(t))                return "missed";
  if (/explain|what is|how|why|define/.test(t))    return "think";
  return "default";
}

// Add reaction buttons + speaker to bot messages
function addReactions(msgEl) {
  const reactions = document.createElement("div");
  reactions.className = "msg-reactions";

  // Speaker button
  const speakBtn = document.createElement("button");
  speakBtn.textContent = "🔊";
  speakBtn.title = "Read aloud";
  speakBtn.onclick = () => {
    const rawText = msgEl.querySelector(".bubble").innerText;
    speakNaturally(rawText, speakBtn);
  };
  reactions.appendChild(speakBtn);

  ["👍","❤️","📌","🔥"].forEach(emoji => {
    const btn = document.createElement("button");
    btn.textContent = emoji;
    btn.onclick = () => btn.classList.toggle("reacted");
    reactions.appendChild(btn);
  });
  msgEl.querySelector(".bubble").after(reactions);
}

// ── Natural speech ─────────────────────────────────────────────────────
let currentUtterance = null;

function cleanForSpeech(text) {
  return text
    // Remove markdown symbols
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/#{1,6}\s/g, "")
    // Convert bullet points to natural pauses
    .replace(/^[\s]*[•\-\*]\s+/gm, ". ")
    // Convert numbered lists
    .replace(/^\d+\.\s+/gm, ". ")
    // Remove URLs
    .replace(/https?:\/\/\S+/g, "")
    // Clean up multiple spaces/newlines
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ", ")
    .replace(/\s{2,}/g, " ")
    // Fix double punctuation
    .replace(/\.\s*\./g, ".")
    .replace(/,\s*,/g, ",")
    .trim();
}

function speakNaturally(rawText, btn) {
  // Stop any current speech
  if (currentUtterance) {
    speechSynthesis.cancel();
    if (btn) { btn.textContent = "🔊"; btn.classList.remove("reacted"); }
    currentUtterance = null;
    return;
  }

  const cleaned = cleanForSpeech(rawText);
  const utter = new SpeechSynthesisUtterance(cleaned);

  const voices = speechSynthesis.getVoices();
  const preferred =
    voices.find(v => v.name === "Microsoft Aria Online (Natural) - English (United States)") ||
    voices.find(v => v.name.includes("Aria"));
  if (preferred) utter.voice = preferred;

  utter.rate = 0.92;
  utter.pitch = 1.1;
  utter.volume = 1;

  if (btn) { btn.textContent = "⏹"; btn.classList.add("reacted"); }

  utter.onend = () => {
    currentUtterance = null;
    if (btn) { btn.textContent = "🔊"; btn.classList.remove("reacted"); }
  };

  currentUtterance = utter;
  speechSynthesis.speak(utter);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── File attachment ────────────────────────────────────────────────────
let attachedFileContent = null;
let attachedFileName = null;

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  attachedFileName = file.name;
  const preview = document.getElementById("filePreview");
  document.getElementById("filePreviewName").textContent = "📎 " + file.name;
  preview.style.display = "flex";

  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    // Read PDF as text using FileReader + basic extraction
    const reader = new FileReader();
    reader.onload = (e) => {
      // Send raw binary as base64 — backend will handle it
      // For now extract readable text from PDF bytes
      const text = extractPdfText(e.target.result);
      attachedFileContent = text
        ? `[PDF: ${file.name}]\n\n${text}`
        : `[PDF attached: ${file.name}] — Please summarize or explain this document.`;
    };
    reader.readAsText(file);
  } else {
    // Image — read as base64 data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      attachedFileContent = `[Image attached: ${file.name}]\n\nPlease describe or help me understand what's in this image.`;
      // Store data URL for display
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.cssText = "max-width:120px;max-height:80px;border-radius:6px;border:1px solid var(--border-dim);margin-top:4px;";
      document.getElementById("filePreview").appendChild(img);
    };
    reader.readAsDataURL(file);
  }

  // Reset input so same file can be re-selected
  event.target.value = "";
}

function extractPdfText(raw) {
  // Basic extraction of readable strings from PDF text stream
  const matches = raw.match(/\(([^)]{3,})\)/g);
  if (!matches) return null;
  return matches.map(m => m.slice(1, -1)).join(" ").slice(0, 3000);
}

function clearFile() {
  attachedFileContent = null;
  attachedFileName = null;
  const preview = document.getElementById("filePreview");
  preview.style.display = "none";
  document.getElementById("filePreviewName").textContent = "";
  // Remove any image preview
  const img = preview.querySelector("img");
  if (img) img.remove();
}

function showGreeting() {
  // Remove any existing greeting
  const existing = document.getElementById("eveGreeting");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.id = "eveGreeting";
  el.className = "eve-greeting";
  el.innerHTML = `
    <svg class="eve-wave" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gwWhite" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="70%" stop-color="#e8f4f8"/>
          <stop offset="100%" stop-color="#c8dde8"/>
        </radialGradient>
        <radialGradient id="gwFace" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#1a1a2e"/>
          <stop offset="100%" stop-color="#0a0a14"/>
        </radialGradient>
        <radialGradient id="gwEye" cx="30%" cy="25%" r="65%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#93c5fd"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </radialGradient>
        <filter id="gwGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="gwEyeGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Body -->
      <ellipse cx="30" cy="58" rx="16" ry="20" fill="url(#gwWhite)" filter="url(#gwGlow)"/>
      <!-- Left arm static -->
      <ellipse cx="9" cy="54" rx="4" ry="11" fill="url(#gwWhite)" transform="rotate(-20 9 54)"/>
      <!-- Right arm — waving -->
      <ellipse class="eve-wave-arm" cx="51" cy="45" rx="4" ry="12" fill="url(#gwWhite)" transform="rotate(-40 51 52)"/>
      <!-- Neck -->
      <ellipse cx="30" cy="37" rx="9" ry="3" fill="#0a0a0a"/>
      <!-- Head dome -->
      <ellipse cx="30" cy="26" rx="16" ry="14" fill="url(#gwWhite)" filter="url(#gwGlow)"/>
      <!-- Face panel -->
      <ellipse cx="30" cy="28" rx="11" ry="10" fill="url(#gwFace)"/>
      <!-- Eyes -->
      <ellipse cx="23" cy="27" rx="5" ry="4" fill="url(#gwEye)" filter="url(#gwEyeGlow)"/>
      <ellipse cx="37" cy="27" rx="5" ry="4" fill="url(#gwEye)" filter="url(#gwEyeGlow)"/>
      <!-- Shine -->
      <ellipse cx="23" cy="19" rx="5" ry="3" fill="#ffffff" opacity="0.35"/>
    </svg>
    <div class="eve-greeting-text">👋 Hey there!</div>
  `;

  document.body.appendChild(el);

  // Auto remove after animation completes
  setTimeout(() => {
    el.classList.add("eve-greeting-out");
    setTimeout(() => el.remove(), 600);
  }, 2800);
}

// Speak text using Web Speech API — only fires once per page load
let hasSpoken = false;
function speakOnce(text) {
  if (hasSpoken || !window.speechSynthesis) return;
  hasSpoken = true;

  const speak = () => {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    const preferred =
      voices.find(v => v.name === "Microsoft Aria Online (Natural) - English (United States)") ||
      voices.find(v => v.name.includes("Aria"));

    if (preferred) utter.voice = preferred;
    utter.rate = 0.95;   // slightly slower — more natural
    utter.pitch = 1.15;  // slightly higher — young female tone
    utter.volume = 1;
    speechSynthesis.speak(utter);
  };

  if (speechSynthesis.getVoices().length > 0) {
    speak();
  } else {
    speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
  }
}

// ── Voice Conversation Mode ────────────────────────────────────────────
let recognition = null;
let isRecording = false;
let voiceHistory = [];

function openVoiceMode() {
  document.getElementById("voiceModal").style.display = "flex";
  voiceHistory = [...history.slice(-6)]; // carry recent context
  setVoiceStatus("Tap the mic and start talking 🎤", "idle");
}

function closeVoiceMode() {
  stopMic();
  speechSynthesis.cancel();
  document.getElementById("voiceModal").style.display = "none";
}

function setVoiceStatus(msg, state) {
  document.getElementById("voiceStatus").textContent = msg;
  const eve = document.querySelector(".voice-eve");
  const bars = document.getElementById("voiceBars");
  if (!eve) return;
  eve.classList.remove("listening", "speaking");
  bars.classList.remove("active");
  if (state === "listening") { eve.classList.add("listening"); bars.classList.add("active"); }
  if (state === "speaking")  { eve.classList.add("speaking");  bars.classList.add("active"); }
}

function toggleMic() {
  if (isRecording) { stopMic(); return; }
  startMic();
}

function startMic() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setVoiceStatus("Sorry, your browser doesn't support voice input 😔", "idle");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    isRecording = true;
    document.getElementById("micBtn").classList.add("recording");
    document.getElementById("voiceTranscript").textContent = "";
    document.getElementById("voiceReply").style.display = "none";
    setVoiceStatus("Listening... speak now 🎤", "listening");
  };

  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
    document.getElementById("voiceTranscript").textContent = `"${transcript}"`;
  };

  recognition.onend = async () => {
    isRecording = false;
    document.getElementById("micBtn").classList.remove("recording");
    const transcript = document.getElementById("voiceTranscript").textContent.replace(/^"|"$/g, "").trim();
    if (!transcript) { setVoiceStatus("Didn't catch that — try again 🙂", "idle"); return; }
    await handleVoiceInput(transcript);
  };

  recognition.onerror = () => {
    isRecording = false;
    document.getElementById("micBtn").classList.remove("recording");
    setVoiceStatus("Couldn't hear you — try again 🙂", "idle");
  };

  recognition.start();
}

function stopMic() {
  if (recognition) { recognition.stop(); recognition = null; }
  isRecording = false;
  document.getElementById("micBtn").classList.remove("recording");
}

async function handleVoiceInput(text) {
  setVoiceStatus("Nyx is thinking... 🧠", "idle");

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: voiceHistory }),
    });
    const data = await res.json();
    const reply = data.reply || "Hmm, something went wrong!";

    voiceHistory.push({ role: "user", content: text });
    voiceHistory.push({ role: "assistant", content: reply });

    // Show text reply
    const replyEl = document.getElementById("voiceReply");
    replyEl.style.display = "block";
    replyEl.textContent = reply.length > 300 ? reply.slice(0, 300) + "…" : reply;

    // Speak it naturally
    setVoiceStatus("Nyx is speaking... 🔊", "speaking");
    await speakVoiceReply(cleanForSpeech(reply));
    setVoiceStatus("Tap the mic to continue 🎤", "idle");

  } catch {
    setVoiceStatus("Connection error — is the backend running? 🔌", "idle");
  }
}

function speakVoiceReply(text) {
  return new Promise((resolve) => {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.name === "Microsoft Aria Online (Natural) - English (United States)") ||
      voices.find(v => v.name.includes("Aria"));
    if (preferred) utter.voice = preferred;
    utter.rate = 0.93;
    utter.pitch = 1.1;
    utter.volume = 1;
    utter.onend = resolve;
    utter.onerror = resolve;
    speechSynthesis.speak(utter);
  });
}
