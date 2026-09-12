/* ===========================================================
   KAUSHALA — data layer (localStorage-backed demo persistence)
   Everything here would move to a real backend/database later;
   the shapes below are written so that swap is mostly mechanical.
   =========================================================== */

const DB_KEY = "kaushala_users_v1";
const SESSION_KEY = "kaushala_session_v1";

const ROLE_PREFIX = { student: "S", institution: "I", industry: "X" };

function readDB() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function writeDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function generateKID(role) {
  const prefix = ROLE_PREFIX[role] || "U";
  const digits = Math.floor(10000 + Math.random() * 89999);
  return `KSH-${prefix}-${digits}`;
}

function emailExists(email) {
  const db = readDB();
  return !!db[email.toLowerCase()];
}

function createUser({ email, password, role, name }) {
  const db = readDB();
  const key = email.toLowerCase();
  if (db[key]) throw new Error("An account with this email already exists.");

  let kid = generateKID(role);
  // ensure uniqueness across the (small, local) demo dataset
  while (Object.values(db).some((u) => u.kid === kid)) kid = generateKID(role);

  const user = {
    kid,
    email: key,
    password, // demo-only: plaintext in localStorage. A real backend must hash + never expose this.
    role,
    createdAt: new Date().toISOString(),
    profile: {
      name: name || key.split("@")[0],
      headline: "",
      skills: [],
      researchPapers: [],
      sakshamLog: [
        {
          t: new Date().toISOString(),
          text: "Profile created. Saksham AI will begin analysing your skill evidence as soon as you add your first skill.",
        },
      ],
      settings: {
        theme: "light",
        notifications: true,
      },
    },
  };
  db[key] = user;
  writeDB(db);
  return user;
}

function findUser(email, password) {
  const db = readDB();
  const user = db[email.toLowerCase()];
  if (!user || user.password !== password) return null;
  return user;
}

function saveUser(user) {
  const db = readDB();
  db[user.email] = user;
  writeDB(db);
}

function getCurrentUser() {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const db = readDB();
  return db[email] || null;
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, email);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function requireStudentSession() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}
