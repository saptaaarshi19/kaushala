(function () {
  const user = requireStudentSession();
  if (!user) return;

  /* ---------------- navigation ---------------- */
  const navButtons = document.querySelectorAll("#nav-list button");
  const views = document.querySelectorAll(".view");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navButtons.forEach((b) => b.classList.remove("is-active"));
      views.forEach((v) => v.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.getElementById("view-" + btn.dataset.view).classList.add("is-active");
      if (btn.dataset.view === "cv") renderCV();
    });
  });

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

  /* ---------------- notifications toggle ---------------- */
  const notifSwitch = document.getElementById("notif-switch");
  notifSwitch.classList.toggle("is-on", !!user.profile.settings.notifications);
  notifSwitch.addEventListener("click", () => {
    user.profile.settings.notifications = !user.profile.settings.notifications;
    saveUser(user);
    notifSwitch.classList.toggle("is-on", user.profile.settings.notifications);
    showToast(user.profile.settings.notifications ? "Notifications turned on." : "Notifications turned off.");
  });

  /* ---------------- charts ---------------- */
  let radarChart, gapChart;
  const stageScore = { beginner: 33, amateur: 66, professional: 100, mastered: 100 };

  function renderCharts() {
    if (typeof Chart === "undefined") return;
    const skills = user.profile.skills;
    const labels = skills.length ? skills.map((s) => s.name) : ["Add a skill"];
    const values = skills.length ? skills.map((s) => stageScore[s.stage] || 0) : [0];

    const radarCtx = document.getElementById("chart-radar");
    if (radarChart) radarChart.destroy();
    radarChart = new Chart(radarCtx, {
      type: "radar",
      data: {
        labels,
        datasets: [{
          label: "Verified level",
          data: values,
          backgroundColor: "rgba(31,111,99,0.18)",
          borderColor: "#1F6F63",
          pointBackgroundColor: "#E8A33D",
        }],
      },
      options: {
        scales: { r: { min: 0, max: 100, ticks: { display: false } } },
        plugins: { legend: { display: false } },
      },
    });

    const gapCtx = document.getElementById("chart-gap");
    if (gapChart) gapChart.destroy();
    gapChart = new Chart(gapCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Your level", data: values, backgroundColor: "#1F6F63" },
          { label: "Professional benchmark", data: labels.map(() => 100), backgroundColor: "#E8E1CB" },
        ],
      },
      options: {
        scales: { y: { min: 0, max: 100 } },
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  /* ---------------- overview render ---------------- */
  function renderOverview() {
    const p = user.profile;
    document.getElementById("overview-name-suffix").textContent = p.name ? `, ${p.name.split(" ")[0]}` : "";
    document.getElementById("profile-name").textContent = p.name || user.email;
    document.getElementById("profile-headline").textContent = p.headline || "Add a headline in Settings";
    document.getElementById("avatar-initial").textContent = (p.name || user.email)[0].toUpperCase();
    document.getElementById("sidebar-kid").textContent = user.kid;

    const professionalCount = p.skills.filter((s) => s.stage === "professional" || s.stage === "mastered").length;
    document.getElementById("stat-skills").textContent = p.skills.length;
    document.getElementById("stat-verified").textContent = professionalCount;
    document.getElementById("stat-papers").textContent = p.researchPapers.length;

    const badge = document.getElementById("overview-level-badge");
    if (!p.skills.length) {
      badge.textContent = "No skills yet";
    } else if (professionalCount > 0) {
      badge.textContent = `${professionalCount} skill${professionalCount > 1 ? "s" : ""} at professional level`;
    } else {
      badge.textContent = "Building evidence — keep testing";
    }

    renderLog(document.getElementById("overview-log"), p.sakshamLog.slice(-4).reverse());
    renderLog(document.getElementById("full-log"), [...p.sakshamLog].reverse());
  }

  function renderLog(container, entries) {
    container.innerHTML = "";
    entries.forEach((e) => {
      const li = document.createElement("li");
      const date = new Date(e.t);
      li.innerHTML = `<span class="t">${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>${e.text}`;
      container.appendChild(li);
    });
    if (!entries.length) {
      container.innerHTML = '<li style="color:var(--text-muted); border:none; padding-left:0;">No activity yet.</li>';
    }
  }

  function logSaksham(text) {
    user.profile.sakshamLog.push({ t: new Date().toISOString(), text });
    saveUser(user);
  }

  /* ---------------- skills ledger ---------------- */
  function renderSkills() {
    const ledger = document.getElementById("skills-ledger");
    const empty = document.getElementById("skills-empty");
    ledger.innerHTML = "";
    if (!user.profile.skills.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    user.profile.skills.forEach((skill, idx) => {
      const stageIndex = STAGES.indexOf(skill.stage);
      const row = document.createElement("div");
      row.className = "ledger-row";

      const segs = ["beginner", "amateur", "professional"].map((st, i) => {
        let cls = "stage-seg";
        if (i < stageIndex) cls += " is-filled";
        else if (i === stageIndex && skill.stage !== "mastered") cls += " is-current";
        else if (skill.stage === "mastered") cls += " is-filled";
        return `<div class="${cls}"></div>`;
      }).join("");

      const canTest = skill.stage !== "mastered";
      const nextLabel = skill.stage === "mastered" ? "Mastered" : `Test for ${nextStage(skill.stage)}`;

      row.innerHTML = `
        <div>
          <div class="skill-name">${skill.name}</div>
          <div class="skill-evidence">${skill.attempts} attempt${skill.attempts === 1 ? "" : "s"} · last score ${skill.lastScore != null ? skill.lastScore + "%" : "—"}</div>
        </div>
        <div>
          <div class="stage-track">${segs}</div>
          <div class="stage-label">${skill.stage}</div>
        </div>
        <div class="ledger-actions">
          <button class="btn btn-ghost btn-sm" data-remove="${idx}">Remove</button>
          ${canTest ? `<button class="btn btn-accent btn-sm" data-test="${idx}">${nextLabel}</button>` : ""}
        </div>
      `;
      ledger.appendChild(row);
    });

    ledger.querySelectorAll("[data-test]").forEach((btn) => {
      btn.addEventListener("click", () => startQuiz(parseInt(btn.dataset.test, 10)));
    });
    ledger.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.remove, 10);
        const removed = user.profile.skills[idx];
        user.profile.skills.splice(idx, 1);
        saveUser(user);
        logSaksham(`Removed "${removed.name}" from your skill record.`);
        renderAll();
      });
    });
  }

  /* ---------------- add skill ---------------- */
  const skillModal = document.getElementById("skill-modal");
  document.getElementById("add-skill-btn").addEventListener("click", () => skillModal.classList.add("is-open"));
  document.getElementById("skill-modal-close").addEventListener("click", () => skillModal.classList.remove("is-open"));
  skillModal.addEventListener("click", (e) => { if (e.target === skillModal) skillModal.classList.remove("is-open"); });

  document.getElementById("skill-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("skill-name-input");
    const name = input.value.trim();
    if (!name) return;
    if (user.profile.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      showToast("That skill is already on your ledger.");
      return;
    }
    user.profile.skills.push({ name, stage: "beginner", attempts: 0, lastScore: null });
    saveUser(user);
    logSaksham(`Added "${name}" to your skill record at beginner stage.`);
    input.value = "";
    skillModal.classList.remove("is-open");
    renderAll();
    showToast(`${name} added — take the beginner test whenever you're ready.`);
  });

  /* ---------------- quiz flow ---------------- */
  const quizModal = document.getElementById("quiz-modal");
  let quizState = null;

  function startQuiz(skillIdx) {
    const skill = user.profile.skills[skillIdx];
    const stage = skill.stage === "mastered" ? "professional" : skill.stage;
    const questions = getQuestionSet(skill.name, stage);
    quizState = { skillIdx, stage, questions, current: 0, answers: [] };
    document.getElementById("quiz-title").textContent = `${skill.name} — ${stage} test`;
    quizModal.classList.add("is-open");
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const { questions, current, answers } = quizState;
    document.getElementById("quiz-progress").textContent = `Question ${current + 1} of ${questions.length}`;
    const q = questions[current];
    const body = document.getElementById("quiz-body");
    body.innerHTML = `
      <div class="quiz-q">${q.prompt}</div>
      <div class="quiz-opts" id="quiz-opts"></div>
      <button class="btn btn-primary btn-block" id="quiz-next" disabled>${current === questions.length - 1 ? "See result" : "Next question"}</button>
    `;
    const opts = document.getElementById("quiz-opts");
    q.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      b.textContent = opt;
      b.addEventListener("click", () => {
        opts.querySelectorAll(".quiz-opt").forEach((o) => o.classList.remove("is-picked"));
        b.classList.add("is-picked");
        answers[current] = i;
        document.getElementById("quiz-next").removeAttribute("disabled");
      });
      opts.appendChild(b);
    });

    document.getElementById("quiz-next").addEventListener("click", () => {
      if (current < questions.length - 1) {
        quizState.current++;
        renderQuizQuestion();
      } else {
        finishQuiz();
      }
    });
  }

  function finishQuiz() {
    const { skillIdx, stage, questions, answers } = quizState;
    const result = scoreAttempt(questions, answers);
    const skill = user.profile.skills[skillIdx];
    skill.attempts++;
    skill.lastScore = Math.round(result.ratio * 100);

    let outcomeText;
    if (result.passed) {
      const upgraded = nextStage(skill.stage);
      skill.stage = upgraded;
      outcomeText = `Passed the ${stage} test for "${skill.name}" (${skill.lastScore}%). Unlocked: ${upgraded}.`;
    } else {
      outcomeText = `Attempted the ${stage} test for "${skill.name}" — scored ${skill.lastScore}%, below the pass mark. Stage unchanged.`;
    }
    saveUser(user);
    logSaksham(outcomeText);

    document.getElementById("quiz-body").innerHTML = `
      <div class="quiz-result">
        <div class="score">${result.correct}/${result.total}</div>
        <p style="margin-top:.6rem;">${result.passed ? `Evidence accepted. "${skill.name}" is now marked <strong>${skill.stage}</strong>.` : `Not quite at the pass threshold yet. Review and try again when ready — Saksham keeps every attempt on record.`}</p>
        <button class="btn btn-primary btn-block" id="quiz-done">Done</button>
      </div>
    `;
    document.getElementById("quiz-done").addEventListener("click", () => {
      quizModal.classList.remove("is-open");
      renderAll();
    });
  }

  document.getElementById("quiz-close").addEventListener("click", () => quizModal.classList.remove("is-open"));
  quizModal.addEventListener("click", (e) => { if (e.target === quizModal) quizModal.classList.remove("is-open"); });

  /* ---------------- research papers ---------------- */
  function renderPapers() {
    const list = document.getElementById("paper-list");
    const empty = document.getElementById("papers-empty");
    list.innerHTML = "";
    if (!user.profile.researchPapers.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    [...user.profile.researchPapers].reverse().forEach((paper) => {
      const li = document.createElement("li");
      li.className = "paper-item";
      li.innerHTML = `
        <div>
          <div class="paper-title">${paper.title}</div>
          <div class="paper-meta">${paper.fileName || "No file attached"} · ${new Date(paper.date).toLocaleDateString()}</div>
        </div>
        <span class="paper-status ${paper.status}">${paper.status === "pending" ? "Queued for Saksham review" : "Reviewed"}</span>
      `;
      list.appendChild(li);
    });
  }

  document.getElementById("paper-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("paper-title").value.trim();
    const fileInput = document.getElementById("paper-file");
    if (!title) return;
    user.profile.researchPapers.push({
      title,
      fileName: fileInput.files[0] ? fileInput.files[0].name : null,
      date: new Date().toISOString(),
      status: "pending",
    });
    saveUser(user);
    logSaksham(`Received research paper "${title}" — queued for evaluation.`);
    e.target.reset();
    renderAll();
    showToast("Paper submitted for Saksham review.");
  });

  /* ---------------- CV builder ---------------- */
  function renderCV() {
    const p = user.profile;
    const el = document.getElementById("cv-preview");
    const skillsHtml = p.skills.length
      ? `<ul>${p.skills.map((s) => `<li>${s.name} — ${s.stage}</li>`).join("")}</ul>`
      : `<p style="color:#888;">No verified skills yet.</p>`;
    const papersHtml = p.researchPapers.length
      ? `<ul>${p.researchPapers.map((r) => `<li>${r.title} (${r.status === "reviewed" ? "reviewed" : "pending review"})</li>`).join("")}</ul>`
      : `<p style="color:#888;">No research papers submitted yet.</p>`;

    el.innerHTML = `
      <h2>${p.name || user.email}</h2>
      <div class="cv-kid">Kaushala ID: ${user.kid} · ${user.email}</div>
      ${p.headline ? `<p style="margin-top:-.4em;">${p.headline}</p>` : ""}
      <h3>Verified skills</h3>
      ${skillsHtml}
      <h3>Research</h3>
      ${papersHtml}
      <h3>About this record</h3>
      <p>Every skill level shown above was unlocked through a Saksham AI evidence test, not self-reported. Full attempt history is available on request.</p>
    `;
  }
  document.getElementById("print-cv-btn").addEventListener("click", () => window.print());

  /* ---------------- settings ---------------- */
  document.getElementById("settings-name").value = user.profile.name || "";
  document.getElementById("settings-headline").value = user.profile.headline || "";
  document.getElementById("settings-kid").textContent = user.kid;
  document.getElementById("settings-email").textContent = user.email;

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    user.profile.name = document.getElementById("settings-name").value.trim();
    user.profile.headline = document.getElementById("settings-headline").value.trim();
    saveUser(user);
    renderAll();
    showToast("Profile updated.");
  });

  /* ---------------- render all ---------------- */
  function renderAll() {
    renderOverview();
    renderSkills();
    renderPapers();
    renderCharts();
  }
  renderAll();
})();
