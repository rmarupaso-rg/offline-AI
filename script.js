const app = document.getElementById("app");
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const newChatBtn = document.getElementById("newChatBtn");
const clearChatsBtn = document.getElementById("clearChatsBtn");
const chatList = document.getElementById("chatList");
const chatSearchInput = document.getElementById("chatSearchInput");
const chatTitle = document.getElementById("chatTitle");
const statusEl = document.getElementById("status");
const messagesEl = document.getElementById("messages");
const typingEl = document.getElementById("typing");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const themeToggle = document.getElementById("themeToggle");
const resizeBar = document.getElementById("resizeBar");
const emojiBtn = document.getElementById("emojiBtn");
const onlineModeToggle = document.getElementById("onlineModeToggle");
const modeStatus = document.getElementById("modeStatus");

const appBg = document.getElementById("appBg");
const chatBg = document.getElementById("chatBg");
const sidebarBg = document.getElementById("sidebarBg");
const userBubble = document.getElementById("userBubble");
const botBubble = document.getElementById("botBubble");
const accentColor = document.getElementById("accentColor");
const glassMode = document.getElementById("glassMode");
const roundedMode = document.getElementById("roundedMode");
const presetButtons = document.querySelectorAll(".preset");

let state = JSON.parse(localStorage.getItem("neochat-state")) || {
  dark: true,
  collapsed: false,
  sidebarWidth: 330,
  onlineMode: false,
  theme: {
    appBg: "#090b14",
    chatBg: "#0f1527",
    sidebarBg: "#0b1020",
    user: "#7c5cff",
    bot: "#18223d",
    accent: "#7c5cff",
    glass: false,
    rounded: true,
    preset: "midnight"
  },
  chats: [],
  currentId: null
};

const presets = {
  midnight: { appBg:"#090b14", chatBg:"#0f1527", sidebarBg:"#0b1020", user:"#7c5cff", bot:"#18223d", accent:"#7c5cff" },
  ocean: { appBg:"#04131f", chatBg:"#0a2233", sidebarBg:"#071622", user:"#19c3ff", bot:"#12324a", accent:"#19c3ff" },
  sunset: { appBg:"#1d0f18", chatBg:"#301522", sidebarBg:"#180c14", user:"#ff7a18", bot:"#3d1b2e", accent:"#ff7a18" },
  emerald: { appBg:"#081610", chatBg:"#0e241a", sidebarBg:"#09130f", user:"#22c55e", bot:"#173326", accent:"#22c55e" },
  violet: { appBg:"#120d22", chatBg:"#1a1430", sidebarBg:"#100c1d", user:"#a855f7", bot:"#2a2148", accent:"#a855f7" },
  mono: { appBg:"#0b0c10", chatBg:"#111217", sidebarBg:"#090a0d", user:"#e5e7eb", bot:"#1f2937", accent:"#e5e7eb" }
};

function save() { localStorage.setItem("neochat-state", JSON.stringify(state)); }

function ensureChat() {
  if (!state.chats || state.chats.length === 0) {
    state.chats = [];
    createChat();
    return;
  }
  if (!state.currentId || !state.chats.some(c => c.id === state.currentId)) {
    state.currentId = state.chats[0].id;
  }
}

function currentChat() { 
  ensureChat();
  return state.chats.find(c => c.id === state.currentId); 
}

function createChat() {
  const id = crypto.randomUUID();
  const newChat = { id, title: `Chat Mpya`, messages: [] };
  state.chats.unshift(newChat);
  state.currentId = id;
  renderAll();
  save();
}

function setPreset(name) {
  const p = presets[name];
  state.theme = { ...state.theme, ...p, preset: name };
  applyTheme();
  save();
}

function applyTheme() {
  const t = state.theme;
  
  // Kama yuko Dark Mode tumia rangi zake, ikiwa Light Mode badili kidogo kupitia class
  app.classList.toggle("light", !state.dark);
  
  if (state.dark) {
    document.documentElement.style.setProperty("--app-bg", t.appBg);
    document.documentElement.style.setProperty("--chat-bg", t.chatBg);
    document.documentElement.style.setProperty("--sidebar-bg", t.sidebarBg);
  }
  
  document.documentElement.style.setProperty("--user", t.user);
  document.documentElement.style.setProperty("--bot", t.bot);
  document.documentElement.style.setProperty("--accent", t.accent);
  
  app.classList.toggle("glass", !!t.glass);
  app.classList.toggle("rounded", !!t.rounded);
  
  if (window.innerWidth > 860) {
    sidebar.style.width = state.sidebarWidth + "px";
  } else {
    sidebar.style.width = "82%";
  }

  if (appBg) appBg.value = t.appBg;
  if (chatBg) chatBg.value = t.chatBg;
  if (sidebarBg) sidebarBg.value = t.sidebarBg;
  if (userBubble) userBubble.value = t.user;
  if (botBubble) botBubble.value = t.bot;
  if (accentColor) accentColor.value = t.accent;
  if (glassMode) glassMode.checked = !!t.glass;
  if (roundedMode) roundedMode.checked = !!t.rounded;
  
  if (onlineModeToggle) onlineModeToggle.checked = !!state.onlineMode;
  if (modeStatus) {
    modeStatus.textContent = state.onlineMode ? "Hali: Online AI (Active)" : "Hali: Offline Mode";
  }
  
  document.querySelectorAll(".preset").forEach(b => b.classList.toggle("active", b.dataset.theme === t.preset));
}

function renderChats(filterText = "") {
  chatList.innerHTML = "";
  const filteredChats = state.chats.filter(chat => 
    chat.title.toLowerCase().includes(filterText.toLowerCase())
  );

  filteredChats.forEach(chat => {
    const el = document.createElement("div");
    el.className = `chat-item ${chat.id === state.currentId ? "active" : ""}`;
    
    const info = document.createElement("div");
    info.className = "chat-item-info";
    info.innerHTML = `<strong>${chat.title}</strong><div class="sub">${chat.messages.length} ujumbe</div>`;
    info.onclick = () => { 
      state.currentId = chat.id; 
      renderAll(); 
      save(); 
      if (window.innerWidth <= 860) app.classList.add("mobile-collapsed");
    };

    const delBtn = document.createElement("button");
    delBtn.className = "chat-item-del";
    delBtn.innerHTML = "✕";
    delBtn.title = "Futa chat hii";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      state.chats = state.chats.filter(c => c.id !== chat.id);
      ensureChat();
      renderAll();
      save();
    };

    el.appendChild(info);
    el.appendChild(delBtn);
    chatList.appendChild(el);
  });
}

function bubble(role, text) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderMessages() {
  const chat = currentChat();
  messagesEl.innerHTML = "";
  if (!chat || chat.messages.length === 0) {
    bubble("bot", "Habari! Mimi ni NeoChat. Chagua Offline ama Online Mode pembeni kukuanza.");
  } else {
    chat.messages.forEach(m => bubble(m.role, m.text));
  }
  chatTitle.textContent = chat ? chat.title : "New Chat";
}

function renderAll() {
  ensureChat();
  renderChats(chatSearchInput.value);
  renderMessages();
  applyTheme();
}

async function getBotReply(text) {
  if (state.onlineMode) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `[Online AI]: Nimepokea ujumbe wako: "${text}". Hapa ndipo majibu ya kiwango cha juu ya AI yatakuja kutoka mtandaoni.`;
    } catch (error) {
      return "Imeshindikana kuunganisha na mtandao. Tafadhali rudi kwenye Offline Mode.";
    }
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    const t = text.toLowerCase();
    if (t.includes("habari") || t.includes("mambo")) return "Poa sana! Niko kwenye Offline Mode.";
    if (t.includes("jina")) return "Mimi ni NeoChat (Offline Version).";
    return `[Offline]: Umesema "${text}". Nipo hapa kukusaidia hata bila intaneti.`;
  }
}

chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  
  ensureChat();
  const chat = currentChat();
  if (!chat) return;

  if (chat.messages.length === 0) {
    chat.title = text.length > 20 ? text.substring(0, 20) + "..." : text;
  }

  chat.messages.push({ role: "user", text });
  bubble("user", text);
  messageInput.value = "";
  messagesEl.scrollTop = messagesEl.scrollHeight;

  statusEl.textContent = state.onlineMode ? "Inawasiliana na AI..." : "Anatafakari (Offline)...";
  typingEl.classList.add("show");

  const reply = await getBotReply(text);

  typingEl.classList.remove("show");
  chat.messages.push({ role: "bot", text: reply });
  bubble("bot", reply);
  statusEl.textContent = "Ready";
  renderChats(chatSearchInput.value);
  save();
});

chatSearchInput.oninput = e => {
  renderChats(e.target.value);
};

newChatBtn.onclick = () => {
  createChat();
  if (window.innerWidth <= 860) app.classList.add("mobile-collapsed");
};

clearChatsBtn.onclick = () => {
  if(confirm("Una uhakika unataka kufuta mazungumzo yote?")) {
    state.chats = [];
    state.currentId = null;
    createChat();
    save();
  }
};

function toggleMenu() {
  if (window.innerWidth <= 860) {
    app.classList.toggle("mobile-collapsed");
  } else {
    state.collapsed = !state.collapsed;
    sidebar.classList.toggle("collapsed", state.collapsed);
    save();
  }
}

toggleSidebar.onclick = toggleMenu;
mobileMenuBtn.onclick = toggleMenu;

themeToggle.onclick = () => {
  state.dark = !state.dark;
  applyTheme();
  save();
};

onlineModeToggle.onchange = e => {
  state.onlineMode = e.target.checked;
  applyTheme();
  save();
};

emojiBtn.onclick = () => {
  const emojis = ["😀", "🚀", "🔥", "💡", "🤖", "⭐", "🎉", "👍", "💻", "❤️"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  messageInput.value += randomEmoji;
  messageInput.focus();
};

appBg.oninput = e => { state.theme.appBg = e.target.value; save(); applyTheme(); };
chatBg.oninput = e => { state.theme.chatBg = e.target.value; save(); applyTheme(); };
sidebarBg.oninput = e => { state.theme.sidebarBg = e.target.value; save(); applyTheme(); };
userBubble.oninput = e => { state.theme.user = e.target.value; save(); applyTheme(); };
botBubble.oninput = e => { state.theme.bot = e.target.value; save(); applyTheme(); };
accentColor.oninput = e => { state.theme.accent = e.target.value; save(); applyTheme(); };
glassMode.onchange = e => { state.theme.glass = e.target.checked; save(); applyTheme(); };
roundedMode.onchange = e => { state.theme.rounded = e.target.checked; save(); applyTheme(); };

presetButtons.forEach(btn => btn.onclick = () => setPreset(btn.dataset.theme));

let resizing = false;
resizeBar.addEventListener("mousedown", () => resizing = true);
document.addEventListener("mousemove", e => {
  if (!resizing || window.innerWidth <= 860) return;
  state.sidebarWidth = Math.min(480, Math.max(240, e.clientX));
  sidebar.style.width = state.sidebarWidth + "px";
});
document.addEventListener("mouseup", () => { if (resizing) save(); resizing = false; });

ensureChat();
applyTheme();
renderAll();

if (window.innerWidth <= 860) {
  app.classList.add("mobile-collapsed");
}
