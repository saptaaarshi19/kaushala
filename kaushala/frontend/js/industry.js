(function () {
  const user = requireIndustrySession();
  if (!user) return;

  const EMP_THRESHOLD = 100;
  const OPP_THRESHOLD = 3;
  const TEAM_THRESHOLD = 1;

  /* ---------------- navigation ---------------- */
  const navButtons = document.querySelectorAll("#nav-list button");
  const views = document.querySelectorAll(".view");
  function goToView(name) {
    navButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.view === name));
    views.forEach((v) => v.classList.remove("is-active"));
    document.getElementById("view-" + name).classList.add("is-active");
  }
  navButtons.forEach((btn) => btn.addEventListener("click", () => goToView(btn.dataset.view)));

  document.getElementById("logout-btn").addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  /* ---------------- theme + notifications ---------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("theme-switch").classList.toggle("is-on", theme === "dark");
    document.getElementById("settings-theme-switch").classList.toggle("is-on", theme === "dark");
  }
  applyTheme(user.profile.settings.theme || "light");
  function toggleTheme() {
    user.profile.settings.theme = user.profile.settings.theme === "dark" ? "light" : "dark";
    saveUser(user);
    applyTheme(user.profile.settings.theme);
  }
  document.getElementById("theme-switch").addEventListener("click", toggleTheme);
  document.getElementById("settings-theme-switch").addEventListener("click", toggleTheme);

  const notifSwitch = document.getElementById("notif-switch");
  notifSwitch.classList.toggle("is-on", !!user.profile.settings.notifications);
  notifSwitch.addEventListener("click", () => {
    user.profile.settings.notifications = !user.profile.settings.notifications;
    saveUser(user);
    notifSwitch.classList.toggle("is-on", user.profile.settings.notifications);
    showToast(user.profile.settings.notifications ? "Notifications turned on." : "Notifications turned off.");
  });

  function logSaksham(text) {
    user.profile.sakshamLog.push({ t: new Date().toISOString(), text });
    saveUser(user);
  }
  function renderLog(container, entries) {
    container.innerHTML = "";
    entries.forEach((e) => {
      const li = document.createElement("li");
      const date = new Date(e.t);
      li.innerHTML = `<span class="t">${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>${e.text}`;
      container.appendChild(li);
    });
    if (!entries.length) container.innerHTML = '<li style="color:var(--text-muted); border:none; padding-left:0;">No activity yet.</li>';
  }

  function myOpportunities() {
    return getOpportunities().filter((o) => o.industryEmail === user.email);
  }

  /* ---------------- overview ---------------- */
  function renderOverview() {
    const p = user.profile;
    const companyName = p.companyName || p.name;
    document.getElementById("overview-title").textContent = `Welcome back, ${companyName}`;
    document.getElementById("profile-name").textContent = companyName;
    document.getElementById("profile-headline").textContent = p.headline || "Add a headline in Settings";
    document.getElementById("avatar-initial").textContent = companyName[0].toUpperCase();
    document.getElementById("sidebar-kid").textContent = user.kid;

    const opps = myOpportunities();
    const totalApplicants = opps.reduce((sum, o) => sum + (o.applications || []).length, 0);
    const researchOpps = opps.filter((o) => o.type === "research");
    const totalTeams = researchOpps.reduce((sum, o) => sum + findTeamsForOpportunity(o.id).length, 0);

    document.getElementById("stat-opps").textContent = opps.length;
    document.getElementById("stat-applicants").textContent = totalApplicants;
    document.getElementById("stat-teams").textContent = totalTeams;

    const empVerified = (p.employeeCount || 0) >= EMP_THRESHOLD;
    const activityVerified = opps.length >= OPP_THRESHOLD && totalTeams >= TEAM_THRESHOLD;
    const verified = empVerified || activityVerified;
    document.getElementById("verified-badge").style.display = verified ? "inline-flex" : "none";

    const badgeProgress = document.getElementById("badge-progress");
    if (verified) {
      badgeProgress.textContent = empVerified
        ? `Verified — ${p.employeeCount}+ employees on record.`
        : `Verified — active across ${opps.length} opportunities and ${totalTeams} student team${totalTeams === 1 ? "" : "s"}.`;
    } else {
      badgeProgress.textContent = `Verified recruiter unlocks at 100+ employees, or ${OPP_THRESHOLD}+ opportunities posted with at least one active student team. Currently: ${p.employeeCount || 0} employees, ${opps.length} opportunities, ${totalTeams} teams.`;
    }

    renderLog(document.getElementById("overview-log"), [...p.sakshamLog].reverse().slice(0, 8));
  }

  /* ---------------- opportunities list ---------------- */
  function renderOpportunities() {
    const container = document.getElementById("opp-list");
    const empty = document.getElementById("opp-empty");
    const opps = myOpportunities();
    container.innerHTML = "";
    if (!opps.length) { empty.style.display = "block"; return; }
    empty.style.display = "none";

    [...opps].reverse().forEach((opp) => {
      const count = opp.type === "internship" ? (opp.applications || []).length : findTeamsForOpportunity(opp.id).length;
      const countLabel = opp.type === "internship" ? `${count} applicant${count === 1 ? "" : "s"}` : `${count} team${count === 1 ? "" : "s"}`;
      const card = document.createElement("div");
      card.className = "panel span-6";
      card.innerHTML = `
        <div class="panel-head">
          <h2 style="font-size:1.05rem;">${opp.title}</h2>
          <span class="type-chip ${opp.type}">${opp.type}</span>
        </div>
        <p class="field-hint">Deadline ${new Date(opp.deadline).toLocaleDateString()} · ${countLabel}</p>
        <p style="font-size:.88rem;">${opp.summary}</p>
        <button class="btn btn-accent btn-sm" data-open-opp="${opp.id}">View</button>
      `;
      container.appendChild(card);
    });
    container.querySelectorAll("[data-open-opp]").forEach((btn) => {
      btn.addEventListener("click", () => openOppDetail(btn.dataset.openOpp));
    });
  }

  /* ---------------- post opportunity modal ---------------- */
  const oppModal = document.getElementById("opp-modal");
  let selectedOppType = "internship";
  document.querySelectorAll("#opp-type-picker .role-opt").forEach((opt) => {
    const select = () => {
      document.querySelectorAll("#opp-type-picker .role-opt").forEach((o) => o.classList.remove("is-selected"));
      opt.classList.add("is-selected");
      selectedOppType = opt.dataset.type;
    };
    opt.addEventListener("click", select);
    opt.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); } });
  });

  document.getElementById("post-opp-btn").addEventListener("click", () => oppModal.classList.add("is-open"));
  document.getElementById("opp-modal-close").addEventListener("click", () => oppModal.classList.remove("is-open"));
  oppModal.addEventListener("click", (e) => { if (e.target === oppModal) oppModal.classList.remove("is-open"); });

  document.getElementById("opp-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("opp-title").value.trim();
    const summary = document.getElementById("opp-summary").value.trim();
    const skills = document.getElementById("opp-skills").value.split(",").map((s) => s.trim()).filter(Boolean);
    const deadline = document.getElementById("opp-deadline").value;
    const companyName = user.profile.companyName || user.profile.name;

    createOpportunity({ industryEmail: user.email, industryName: companyName, type: selectedOppType, title, summary, skills, deadline });
    logSaksham(`Posted a new ${selectedOppType} opportunity: "${title}".`);
    e.target.reset();
    oppModal.classList.remove("is-open");
    showToast("Opportunity posted.");
    renderAll();
  });

  /* ---------------- opportunity detail ---------------- */
  let activeOppId = null;

  function openOppDetail(oppId) {
    activeOppId = oppId;
    renderOppDetail();
    goToView("opp-detail");
  }
  document.getElementById("back-to-opps").addEventListener("click", () => goToView("opportunities"));

  function renderOppDetail() {
    const opp = getOpportunities().find((o) => o.id === activeOppId);
    if (!opp) return;

    document.getElementById("detail-title").innerHTML = `${opp.title} <span class="type-chip ${opp.type}">${opp.type}</span>`;
    document.getElementById("detail-sub").textContent = `Deadline ${new Date(opp.deadline).toLocaleDateString()}`;
    document.getElementById("detail-summary").textContent = opp.summary;
    document.getElementById("detail-skills").innerHTML = (opp.skills || [])
      .map((s) => `<span class="paper-status pending" style="margin-right:.4rem;">${s}</span>`)
      .join("");

    // specialists
    const specList = document.getElementById("specialist-list");
    specList.innerHTML = "";
    if (!opp.specialists.length) {
      specList.innerHTML = '<div class="field-hint">No one has been granted access yet.</div>';
    } else {
      opp.specialists.forEach((s, idx) => {
        const row = document.createElement("div");
        row.className = "settings-row";
        row.style.padding = ".5em 0";
        row.innerHTML = `
          <div><div class="label">${s.name}</div><div class="desc">${s.email || "no email on file"}</div></div>
          <button class="btn btn-ghost btn-sm" data-revoke="${idx}">Revoke</button>
        `;
        specList.appendChild(row);
      });
      specList.querySelectorAll("[data-revoke]").forEach((btn) => {
        btn.addEventListener("click", () => {
          opp.specialists.splice(parseInt(btn.dataset.revoke, 10), 1);
          saveOpportunity(opp);
          renderOppDetail();
        });
      });
    }

    document.getElementById("applicants-panel").style.display = opp.type === "internship" ? "block" : "none";
    document.getElementById("teams-panel").style.display = opp.type === "research" ? "block" : "none";

    if (opp.type === "internship") renderApplicants(opp);
    else renderOppTeams(opp);
  }

  document.getElementById("specialist-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const opp = getOpportunities().find((o) => o.id === activeOppId);
    const name = document.getElementById("specialist-name").value.trim();
    const email = document.getElementById("specialist-email").value.trim();
    opp.specialists.push({ name, email, grantedAt: new Date().toISOString() });
    saveOpportunity(opp);
    logSaksham(`Granted ${name} access to "${opp.title}".`);
    e.target.reset();
    renderOppDetail();
    showToast("Access granted.");
  });

  function renderApplicants(opp) {
    const list = document.getElementById("applicants-list");
    const empty = document.getElementById("applicants-empty");
    const db = readDB();
    const apps = opp.applications || [];
    if (!apps.length) { empty.style.display = "block"; list.innerHTML = ""; return; }
    empty.style.display = "none";

    const ranked = apps
      .map((a) => {
        const student = db[a.studentEmail];
        if (!student) return null;
        const result = computeApplicantScore(student, opp);
        return { ...a, ...result, studentName: student.profile.name };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    list.innerHTML = "";
    ranked.forEach((a, i) => {
      const row = document.createElement("div");
      row.className = "ledger-row";
      row.style.gridTemplateColumns = "auto 1.4fr 1fr";
      row.innerHTML = `
        <div class="score-badge">${a.score}</div>
        <div>
          <div class="skill-name">#${i + 1} ${a.studentName}</div>
          <div class="skill-evidence">${a.studentKid} · applied ${new Date(a.appliedAt).toLocaleDateString()}</div>
        </div>
        <div class="skill-evidence">
          Skill match ${a.skillMatch}% · ${a.paperCount} paper${a.paperCount === 1 ? "" : "s"} (${a.reviewedCount} reviewed)
        </div>
      `;
      list.appendChild(row);
    });
  }

  function renderOppTeams(opp) {
    const list = document.getElementById("opp-teams-list");
    const empty = document.getElementById("opp-teams-empty");
    const teams = findTeamsForOpportunity(opp.id);
    if (!teams.length) { empty.style.display = "block"; list.innerHTML = ""; return; }
    empty.style.display = "none";
    list.innerHTML = "";
    teams.forEach(({ institutionName, institutionEmail, team }) => {
      const row = document.createElement("div");
      row.className = "ledger-row";
      row.style.gridTemplateColumns = "1.4fr 1fr auto";
      row.innerHTML = `
        <div>
          <div class="skill-name">${team.name}</div>
          <div class="skill-evidence">${institutionName} · mentor ${team.mentor} · ${team.memberKIDs.length} students</div>
        </div>
        <div class="skill-evidence">${team.notes.length} note${team.notes.length === 1 ? "" : "s"} · ${team.papers.length} paper${team.papers.length === 1 ? "" : "s"}</div>
        <button class="btn btn-ghost btn-sm" data-view-team="${institutionEmail}::${team.id}">Open</button>
      `;
      list.appendChild(row);
    });
    list.querySelectorAll("[data-view-team]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [instEmail, teamId] = btn.dataset.viewTeam.split("::");
        openTeamRead(instEmail, teamId);
      });
    });
  }

  /* ---------------- collaboration feed ---------------- */
  function renderCollabFeed() {
    const list = document.getElementById("collab-feed-list");
    const empty = document.getElementById("collab-feed-empty");
    const researchOpps = myOpportunities().filter((o) => o.type === "research");
    const rows = [];
    researchOpps.forEach((opp) => {
      findTeamsForOpportunity(opp.id).forEach((entry) => rows.push({ opp, ...entry }));
    });

    if (!rows.length) { empty.style.display = "block"; list.innerHTML = ""; return; }
    empty.style.display = "none";
    list.innerHTML = '<div class="grid" id="collab-feed-grid"></div>';
    const grid = document.getElementById("collab-feed-grid");
    rows.forEach(({ opp, institutionName, institutionEmail, team }) => {
      const card = document.createElement("div");
      card.className = "panel span-6";
      card.innerHTML = `
        <div class="panel-head"><h2 style="font-size:1rem;">${team.name}</h2></div>
        <p class="field-hint">On: ${opp.title}</p>
        <p class="field-hint">${institutionName} · mentor ${team.mentor} · ${team.memberKIDs.length} students</p>
        <button class="btn btn-accent btn-sm" data-open="${institutionEmail}::${team.id}">Open workspace</button>
      `;
      grid.appendChild(card);
    });
    grid.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [instEmail, teamId] = btn.dataset.open.split("::");
        openTeamRead(instEmail, teamId);
      });
    });
  }

  /* ---------------- read-only team view ---------------- */
  let activeReadTeam = null; // { institutionEmail, teamId }

  function openTeamRead(institutionEmail, teamId) {
    activeReadTeam = { institutionEmail, teamId };
    renderTeamRead();
    goToView("team-read");
  }
  document.getElementById("back-from-team").addEventListener("click", () => goToView("collab-feed"));

  function getReadTeam() {
    const db = readDB();
    const inst = db[activeReadTeam.institutionEmail];
    if (!inst) return null;
    const team = inst.profile.teams.find((t) => t.id === activeReadTeam.teamId);
    return { inst, team };
  }

  function renderTeamRead() {
    const found = getReadTeam();
    if (!found) return;
    const { inst, team } = found;
    document.getElementById("rt-title").textContent = team.name;
    document.getElementById("rt-subtitle").textContent = `${inst.profile.instituteName || inst.profile.name} · mentor ${team.mentor}`;

    renderLog(document.getElementById("rt-notes"), [...team.notes].reverse());

    const papersList = document.getElementById("rt-papers");
    papersList.innerHTML = "";
    if (!team.papers.length) {
      papersList.innerHTML = '<li style="color:var(--text-muted); font-size:.85rem;">No papers uploaded yet.</li>';
    } else {
      [...team.papers].reverse().forEach((paper) => {
        const li = document.createElement("li");
        li.className = "paper-item";
        li.innerHTML = `
          <div>
            <div class="paper-title">${paper.title}</div>
            <div class="paper-meta">${paper.fileName || "No file attached"} · ${new Date(paper.date).toLocaleDateString()}</div>
          </div>
          <span class="paper-status pending">For your review</span>
        `;
        papersList.appendChild(li);
      });
    }
  }

  document.getElementById("rt-note-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("rt-note-input");
    const text = input.value.trim();
    if (!text) return;
    const found = getReadTeam();
    if (!found) return;
    const companyName = user.profile.companyName || user.profile.name;
    found.team.notes.push({ t: new Date().toISOString(), text: `Specialist (${companyName}): ${text}` });
    saveUser(found.inst);
    logSaksham(`Left feedback on team "${found.team.name}".`);
    input.value = "";
    renderTeamRead();
  });

  /* ---------------- settings ---------------- */
  document.getElementById("settings-name").value = user.profile.companyName || "";
  document.getElementById("settings-headline").value = user.profile.headline || "";
  document.getElementById("settings-employees").value = user.profile.employeeCount || 0;
  document.getElementById("settings-kid").textContent = user.kid;
  document.getElementById("settings-email").textContent = user.email;

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    user.profile.companyName = document.getElementById("settings-name").value.trim();
    user.profile.headline = document.getElementById("settings-headline").value.trim();
    user.profile.employeeCount = parseInt(document.getElementById("settings-employees").value, 10) || 0;
    saveUser(user);
    renderAll();
    showToast("Profile updated.");
  });

  /* ---------------- render all ---------------- */
  function renderAll() {
    renderOverview();
    renderOpportunities();
    renderCollabFeed();
  }
  renderAll();
})();
