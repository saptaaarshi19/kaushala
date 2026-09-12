(function () {
  const user = requireInstitutionSession();
  if (!user) return;

  user.profile.students = Array.isArray(user.profile.students) ? user.profile.students : [];
  user.profile.teams = Array.isArray(user.profile.teams) ? user.profile.teams : [];
  if (!user.profile.instituteName) user.profile.instituteName = user.profile.name;
  saveUser(user);

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

  /* ---------------- toast ---------------- */
  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  /* ---------------- theme ---------------- */
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

  /* ---------------- helpers ---------------- */
  const VERIFIED_THRESHOLD = 50;
  function studentRecord(rosterEntry) {
    const db = readDB();
    return db[rosterEntry.email] || null;
  }

  /* ---------------- overview ---------------- */
  function renderOverview() {
    const p = user.profile;
    document.getElementById("overview-title").textContent = `Welcome back, ${p.instituteName || p.name}`;
    document.getElementById("profile-name").textContent = p.instituteName || p.name;
    document.getElementById("profile-headline").textContent = p.headline || "Add a headline in Settings";
    document.getElementById("avatar-initial").textContent = (p.instituteName || p.name)[0].toUpperCase();
    document.getElementById("sidebar-kid").textContent = user.kid;

    const verified = p.students.length >= VERIFIED_THRESHOLD;
    const badge = document.getElementById("verified-badge");
    badge.style.display = verified ? "inline-flex" : "none";

    document.getElementById("stat-students").textContent = p.students.length;
    document.getElementById("stat-teams").textContent = p.teams.length;

    const skillSet = new Set();
    p.students.forEach((s) => {
      const rec = studentRecord(s);
      if (rec) rec.profile.skills.forEach((sk) => skillSet.add(sk.name));
    });
    document.getElementById("stat-skills").textContent = skillSet.size;

    const badgeProgress = document.getElementById("badge-progress");
    if (verified) {
      badgeProgress.textContent = `Verified — ${p.students.length} students on your roster.`;
    } else {
      badgeProgress.textContent = `${VERIFIED_THRESHOLD - p.students.length} more verified student${VERIFIED_THRESHOLD - p.students.length === 1 ? "" : "s"} until your institution badge unlocks.`;
    }

    renderLog(document.getElementById("overview-log"), [...p.sakshamLog].reverse().slice(0, 8));
  }

  /* ---------------- students / roster ---------------- */
  let pendingKid = null, pendingOtp = null;

  document.getElementById("kid-lookup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("add-kid-input");
    const kid = input.value.trim();
    document.getElementById("kid-lookup-error").parentElement.classList.remove("has-error");

    const student = findUserByKID(kid);
    if (!student || student.role !== "student") {
      document.getElementById("add-kid-input").closest(".field").classList.add("has-error");
      return;
    }
    if (user.profile.students.some((s) => s.kid.toUpperCase() === student.kid.toUpperCase())) {
      showToast("That student is already on your roster.");
      return;
    }

    pendingKid = student.kid;
    pendingOtp = generateOTP();
    document.getElementById("otp-sent-note").innerHTML =
      `Verification code for <strong>${student.profile.name}</strong> (${student.email}). Demo code: <strong style="font-family:var(--display); font-size:1.1rem;">${pendingOtp}</strong>`;
    document.getElementById("otp-step").style.display = "block";
    document.getElementById("otp-input").value = "";
    document.getElementById("otp-input").closest(".field").classList.remove("has-error");
  });

  document.getElementById("cancel-otp-btn").addEventListener("click", () => {
    pendingKid = null; pendingOtp = null;
    document.getElementById("otp-step").style.display = "none";
    document.getElementById("add-kid-input").value = "";
  });

  document.getElementById("confirm-otp-btn").addEventListener("click", () => {
    const code = document.getElementById("otp-input").value.trim();
    if (!pendingKid || code !== pendingOtp) {
      document.getElementById("otp-input").closest(".field").classList.add("has-error");
      return;
    }
    const student = findUserByKID(pendingKid);
    user.profile.students.push({
      kid: student.kid,
      name: student.profile.name,
      email: student.email,
      addedAt: new Date().toISOString(),
    });
    saveUser(user);
    logSaksham(`Added ${student.profile.name} (${student.kid}) to the roster after email verification.`);
    pendingKid = null; pendingOtp = null;
    document.getElementById("otp-step").style.display = "none";
    document.getElementById("add-kid-input").value = "";
    showToast("Student verified and added.");
    renderAll();
  });

  document.getElementById("seed-demo-btn").addEventListener("click", () => {
    const before = user.profile.students.length;
    const need = Math.max(0, VERIFIED_THRESHOLD - before);
    if (need === 0) { showToast("You're already past the verified threshold."); return; }
    for (let i = 0; i < need; i++) {
      user.profile.students.push({
        kid: `KSH-S-DEMO${(before + i).toString().padStart(3, "0")}`,
        name: `Demo Student ${before + i + 1}`,
        email: `demo${before + i + 1}@example.invalid`,
        addedAt: new Date().toISOString(),
      });
    }
    saveUser(user);
    logSaksham(`Added ${need} sample students (demo helper) to reach the verified threshold.`);
    showToast(`Added ${need} sample students.`);
    renderAll();
  });

  function renderRoster() {
    const list = document.getElementById("roster-list");
    const empty = document.getElementById("roster-empty");
    const p = user.profile;
    document.getElementById("roster-count").textContent = `${p.students.length} student${p.students.length === 1 ? "" : "s"}`;
    list.innerHTML = "";
    if (!p.students.length) { empty.style.display = "block"; return; }
    empty.style.display = "none";

    [...p.students].reverse().forEach((s) => {
      const rec = studentRecord(s);
      const skillCount = rec ? rec.profile.skills.length : 0;
      const row = document.createElement("div");
      row.className = "ledger-row";
      row.innerHTML = `
        <div>
          <div class="skill-name">${s.name}</div>
          <div class="skill-evidence">${s.kid} · ${s.email}</div>
        </div>
        <div class="skill-evidence">${skillCount} skill${skillCount === 1 ? "" : "s"} tracked</div>
        <div class="ledger-actions">
          <button class="btn btn-ghost btn-sm" data-remove-kid="${s.kid}">Remove</button>
        </div>
      `;
      list.appendChild(row);
    });
    list.querySelectorAll("[data-remove-kid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kid = btn.dataset.removeKid;
        user.profile.students = user.profile.students.filter((s) => s.kid !== kid);
        saveUser(user);
        logSaksham(`Removed a student (${kid}) from the roster.`);
        renderAll();
      });
    });
  }

  /* ---------------- skill analysis ---------------- */
  let institutionChart;
  function renderAnalysis() {
    const p = user.profile;
    const skillMap = {};
    p.students.forEach((s) => {
      const rec = studentRecord(s);
      if (!rec) return;
      rec.profile.skills.forEach((sk) => {
        skillMap[sk.name] = skillMap[sk.name] || { beginner: 0, amateur: 0, professional: 0, total: 0 };
        const bucket = sk.stage === "mastered" ? "professional" : sk.stage;
        skillMap[sk.name][bucket] = (skillMap[sk.name][bucket] || 0) + 1;
        skillMap[sk.name].total++;
      });
    });

    const skillNames = Object.keys(skillMap);
    const empty = document.getElementById("analysis-empty");
    const canvas = document.getElementById("chart-institution");

    if (!skillNames.length) {
      empty.style.display = "block";
      canvas.style.display = "none";
      document.getElementById("gap-list").innerHTML = "";
      return;
    }
    empty.style.display = "none";
    canvas.style.display = "block";

    if (institutionChart) institutionChart.destroy();
    institutionChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: skillNames,
        datasets: [
          { label: "Beginner", data: skillNames.map((n) => skillMap[n].beginner || 0), backgroundColor: "#FFD93D" },
          { label: "Amateur", data: skillNames.map((n) => skillMap[n].amateur || 0), backgroundColor: "#A78BFA" },
          { label: "Professional", data: skillNames.map((n) => skillMap[n].professional || 0), backgroundColor: "#4ECDC4" },
        ],
      },
      options: {
        responsive: true,
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { precision: 0 } } },
        plugins: { legend: { position: "bottom" } },
      },
    });

    const gaps = skillNames
      .map((name) => {
        const s = skillMap[name];
        const beginnerRatio = (s.beginner || 0) / s.total;
        return { name, beginnerRatio, total: s.total };
      })
      .sort((a, b) => b.beginnerRatio - a.beginnerRatio)
      .slice(0, 5);

    const gapList = document.getElementById("gap-list");
    gapList.innerHTML = "";
    gaps.forEach((g) => {
      const row = document.createElement("div");
      row.className = "ledger-row";
      row.style.gridTemplateColumns = "1.4fr 1fr";
      row.innerHTML = `
        <div>
          <div class="skill-name">${g.name}</div>
          <div class="skill-evidence">${g.total} student${g.total === 1 ? "" : "s"} tracking this skill</div>
        </div>
        <div>
          <div class="stage-track"><div class="stage-seg ${g.beginnerRatio > 0.3 ? "is-current" : ""}" style="flex:${Math.max(g.beginnerRatio, 0.05)};"></div><div class="stage-seg is-filled" style="flex:${Math.max(1 - g.beginnerRatio, 0.05)};"></div></div>
          <div class="stage-label">${Math.round(g.beginnerRatio * 100)}% still at beginner</div>
        </div>
      `;
      gapList.appendChild(row);
    });
  }

  /* ---------------- collaboration ---------------- */
  function renderCollab() {
    const container = document.getElementById("problem-list");
    container.innerHTML = "";
    INDUSTRY_PROBLEMS.forEach((problem) => {
      const myTeams = user.profile.teams.filter((t) => t.problemId === problem.id);
      const chipHtml = problem.skills.map((s) => `<span class="paper-status pending" style="margin-right:.4rem;">${s}</span>`).join("");
      const teamChips = myTeams
        .map((t) => `<button class="btn btn-ghost btn-sm" data-open-team="${t.id}" style="margin:.3rem .4rem 0 0;">${t.name} (${t.memberKIDs.length})</button>`)
        .join("");

      const card = document.createElement("div");
      card.className = "panel span-6";
      card.innerHTML = `
        <div class="panel-head">
          <h2 style="font-size:1.05rem;">${problem.title}</h2>
        </div>
        <p class="field-hint" style="margin-bottom:.6rem;">${problem.partner} · Specialist: ${problem.specialist} · Deadline ${new Date(problem.deadline).toLocaleDateString()}</p>
        <p style="font-size:.88rem;">${problem.summary}</p>
        <div style="margin:.6rem 0 1rem;">${chipHtml}</div>
        <button class="btn btn-accent btn-sm" data-form-team="${problem.id}">Form a team</button>
        <div style="margin-top:.8rem;">${teamChips || '<span class="field-hint">No teams formed yet for this problem.</span>'}</div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll("[data-form-team]").forEach((btn) => {
      btn.addEventListener("click", () => openTeamModal(btn.dataset.formTeam));
    });
    container.querySelectorAll("[data-open-team]").forEach((btn) => {
      btn.addEventListener("click", () => openTeamWorkspace(btn.dataset.openTeam));
    });
  }

  /* ---------------- form team modal ---------------- */
  const teamModal = document.getElementById("team-modal");
  let activeProblemId = null;

  function openTeamModal(problemId) {
    activeProblemId = problemId;
    const problem = INDUSTRY_PROBLEMS.find((p) => p.id === problemId);
    document.getElementById("team-modal-title").textContent = `Form a team — ${problem.title}`;
    document.getElementById("team-form").reset();
    document.getElementById("team-members-error").style.display = "none";
    teamModal.classList.add("is-open");
  }
  document.getElementById("team-modal-close").addEventListener("click", () => teamModal.classList.remove("is-open"));
  teamModal.addEventListener("click", (e) => { if (e.target === teamModal) teamModal.classList.remove("is-open"); });

  document.getElementById("team-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("team-name-input").value.trim();
    const mentor = document.getElementById("team-mentor-input").value.trim();
    const raw = document.getElementById("team-members-input").value.trim();
    const kids = raw.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);
    const errorEl = document.getElementById("team-members-error");

    if (!kids.length) {
      errorEl.textContent = "Add at least one student K.ID.";
      errorEl.style.display = "block";
      return;
    }

    const rosterKids = user.profile.students.map((s) => s.kid.toUpperCase());
    const invalid = kids.filter((k) => !rosterKids.includes(k.toUpperCase()));
    if (invalid.length) {
      errorEl.textContent = `Not on your verified roster: ${invalid.join(", ")}`;
      errorEl.style.display = "block";
      return;
    }

    const team = {
      id: "team-" + Date.now(),
      problemId: activeProblemId,
      name,
      mentor,
      memberKIDs: kids,
      notes: [],
      papers: [],
      createdAt: new Date().toISOString(),
    };
    user.profile.teams.push(team);
    saveUser(user);
    logSaksham(`Formed team "${name}" (mentor: ${mentor}) for an industry collaboration.`);
    teamModal.classList.remove("is-open");
    showToast("Team created.");
    renderAll();
  });

  /* ---------------- team workspace ---------------- */
  let activeTeamId = null;

  function openTeamWorkspace(teamId) {
    activeTeamId = teamId;
    renderTeamWorkspace();
    goToView("team");
  }
  document.getElementById("back-to-collab").addEventListener("click", () => goToView("collab"));

  function renderTeamWorkspace() {
    const team = user.profile.teams.find((t) => t.id === activeTeamId);
    if (!team) return;
    const problem = INDUSTRY_PROBLEMS.find((p) => p.id === team.problemId);

    document.getElementById("team-title").textContent = team.name;
    document.getElementById("team-subtitle").textContent = `Working on: ${problem.title}`;
    document.getElementById("team-problem-summary").textContent = problem.summary;
    document.getElementById("team-problem-meta").textContent = `${problem.partner} · Specialist: ${problem.specialist} · Deadline ${new Date(problem.deadline).toLocaleDateString()}`;
    document.getElementById("team-mentor").textContent = team.mentor;

    const membersEl = document.getElementById("team-members");
    membersEl.innerHTML = "";
    team.memberKIDs.forEach((kid) => {
      const rosterEntry = user.profile.students.find((s) => s.kid.toUpperCase() === kid.toUpperCase());
      const chip = document.createElement("span");
      chip.className = "paper-status reviewed";
      chip.textContent = rosterEntry ? `${rosterEntry.name} (${kid})` : kid;
      membersEl.appendChild(chip);
    });

    renderLog(document.getElementById("team-notes"), [...team.notes].reverse());
    renderTeamPapers(team);
  }

  function renderTeamPapers(team) {
    const list = document.getElementById("team-papers");
    list.innerHTML = "";
    if (!team.papers.length) {
      list.innerHTML = '<li style="color:var(--text-muted); font-size:.85rem;">No papers uploaded yet.</li>';
      return;
    }
    [...team.papers].reverse().forEach((paper) => {
      const li = document.createElement("li");
      li.className = "paper-item";
      li.innerHTML = `
        <div>
          <div class="paper-title">${paper.title}</div>
          <div class="paper-meta">${paper.fileName || "No file attached"} · ${new Date(paper.date).toLocaleDateString()}</div>
        </div>
        <span class="paper-status pending">Queued for specialist review</span>
      `;
      list.appendChild(li);
    });
  }

  document.getElementById("team-note-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("team-note-input");
    const text = input.value.trim();
    if (!text) return;
    const team = user.profile.teams.find((t) => t.id === activeTeamId);
    team.notes.push({ t: new Date().toISOString(), text: `${team.mentor}: ${text}` });
    saveUser(user);
    input.value = "";
    renderTeamWorkspace();
  });

  document.getElementById("team-paper-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("team-paper-title").value.trim();
    const fileInput = document.getElementById("team-paper-file");
    if (!title) return;
    const team = user.profile.teams.find((t) => t.id === activeTeamId);
    team.papers.push({
      title,
      fileName: fileInput.files[0] ? fileInput.files[0].name : null,
      date: new Date().toISOString(),
      status: "pending",
    });
    saveUser(user);
    logSaksham(`Team "${team.name}" submitted a research paper: "${title}".`);
    e.target.reset();
    renderTeamWorkspace();
    showToast("Uploaded to team workspace.");
  });

  /* ---------------- settings ---------------- */
  document.getElementById("settings-name").value = user.profile.instituteName || "";
  document.getElementById("settings-headline").value = user.profile.headline || "";
  document.getElementById("settings-kid").textContent = user.kid;
  document.getElementById("settings-email").textContent = user.email;

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    user.profile.instituteName = document.getElementById("settings-name").value.trim();
    user.profile.headline = document.getElementById("settings-headline").value.trim();
    saveUser(user);
    renderAll();
    showToast("Profile updated.");
  });

  /* ---------------- render all ---------------- */
  function renderAll() {
    renderOverview();
    renderRoster();
    renderAnalysis();
    renderCollab();
  }
  renderAll();
})();
