(function () {
  const tabs = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      forms.forEach((f) => f.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById(tab.dataset.target).classList.add("is-active");
    });
  });

  // ---- role picker ----
  let selectedRole = "student";
  const roleOpts = document.querySelectorAll(".role-opt");
  roleOpts.forEach((opt) => {
    const select = () => {
      roleOpts.forEach((o) => o.classList.remove("is-selected"));
      opt.classList.add("is-selected");
      selectedRole = opt.dataset.role;
    };
    opt.addEventListener("click", select);
    opt.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
    });
  });

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function clearError(fieldId) {
    document.getElementById(fieldId).classList.remove("has-error");
  }
  function setError(fieldId) {
    document.getElementById(fieldId).classList.add("has-error");
  }

  // ---- signup ----
  const signupForm = document.getElementById("signup-form");
  const kidReveal = document.getElementById("kid-reveal");
  let createdEmail = null;

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    clearError("signup-email-field");
    let valid = true;

    if (!email || !email.includes("@")) { setError("signup-email-field"); valid = false; }
    if (password.length < 6) {
      document.getElementById("signup-password-field").classList.add("has-error");
      valid = false;
    } else {
      document.getElementById("signup-password-field").classList.remove("has-error");
    }

    if (!valid) return;

    if (emailExists(email)) {
      setError("signup-email-field");
      return;
    }

    const user = createUser({ email, password, role: selectedRole, name });
    createdEmail = user.email;

    document.getElementById("kid-value").textContent = user.kid;
    kidReveal.classList.add("is-visible");
    document.getElementById("signup-submit").setAttribute("disabled", "true");
    showToast("Kaushala ID assigned. Welcome aboard.");
  });

  document.getElementById("go-to-profile").addEventListener("click", () => {
    setSession(createdEmail);
    const createdUser = getCurrentUser();
    if (createdUser.role === "student") window.location.href = "student (2).html";
    else if (createdUser.role === "industry") window.location.href = "industry.html";
    else window.location.href = "institution.html";
  });

  // ---- login ----
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const user = findUser(email, password);

    if (!user) {
      document.getElementById("login-error").style.display = "block";
      document.getElementById("login-password").closest(".field").classList.add("has-error");
      return;
    }
    setSession(user.email);
    if (user.role === "student") window.location.href = "student (2).html";
    else if (user.role === "industry") window.location.href = "industry.html";
    else window.location.href = "institution.html";
  });
})();
