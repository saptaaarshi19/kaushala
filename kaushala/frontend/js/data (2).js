/* ===========================================================
   KAUSHALA — data layer (localStorage-backed demo persistence)
   Everything here would move to a real backend/database later;
   the shapes below are written so that swap is mostly mechanical.
   =========================================================== */

const DB_KEY = "kaushala_users_v1";
const SESSION_KEY = "kaushala_session_v1";
const OPPORTUNITIES_KEY = "kaushala_opportunities_v1";
const TEAMS_KEY = "kaushala_teams_v1";

const ROLE_PREFIX = { student: "S", institution: "I", industry: "X" };

const INDUSTRY_PROBLEMS = [
  {
    id: "ayush-quality",
    title: "Evidence-led AYUSH quality",
    partner: "AYUSH innovation partner",
    specialist: "Clinical research lead",
    deadline: "2026-12-15",
    summary: "Build a practical evidence workflow for documenting quality and outcomes.",
    skills: ["Research", "Documentation", "Clinical practice"],
  },
  {
    id: "wellness-access",
    title: "Accessible wellness programmes",
    partner: "Community health partner",
    specialist: "Programme designer",
    deadline: "2027-01-20",
    summary: "Design a measurable wellness programme that can reach more learners and communities.",
    skills: ["Yoga", "Communication", "Programme design"],
  },
];

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
      instituteName: role === "institution" || role === "industry" ? name || key.split("@")[0] : "",
      skills: [],
      researchPapers: [],
      students: [],
      teams: [],
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

function getOpportunities() {
  try {
    const opportunities = JSON.parse(localStorage.getItem(OPPORTUNITIES_KEY));
    return Array.isArray(opportunities) ? opportunities : [];
  } catch (e) {
    return [];
  }
}

function createOpportunity({ industryEmail, industryName, type, title, summary, skills, deadline }) {
  const opportunity = {
    id: `opp-${Date.now()}`,
    industryEmail,
    industryName,
    type,
    title,
    summary,
    skills,
    deadline,
    applications: [],
    specialists: [],
    createdAt: new Date().toISOString(),
  };
  const opportunities = getOpportunities();
  opportunities.push(opportunity);
  localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(opportunities));
  return opportunity;
}

function saveOpportunity(opportunity) {
  const opportunities = getOpportunities();
  const index = opportunities.findIndex((entry) => entry.id === opportunity.id);
  if (index === -1) opportunities.push(opportunity);
  else opportunities[index] = opportunity;
  localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(opportunities));
}

function findTeamsForOpportunity(opportunityId) {
  try {
    const teams = JSON.parse(localStorage.getItem(TEAMS_KEY));
    return Array.isArray(teams) ? teams.filter((team) => team.opportunityId === opportunityId) : [];
  } catch (e) {
    return [];
  }
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

function requireInstitutionSession() {
  const user = getCurrentUser();
  if (!user || (user.role !== "institution" && user.role !== "industry")) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

function requireIndustrySession() {
  const user = getCurrentUser();
  if (!user || user.role !== "industry") {
    window.location.href = "index.html";
    return null;
  }
  return user;
}
