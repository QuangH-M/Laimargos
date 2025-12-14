function getId(id) {
  return document.getElementById(id);
}
const registerMessageEl = getId("registerMessage");

function showMessage(el, text, opts = {}) {
  if (!el) return;
  el.textContent = text || "";
  if (opts.color) el.style.color = opts.color;
  else el.style.color = "var(--red)";
}

btnRegister.onclick = function (e) {
  e.preventDefault();
  const rusername = (getId("registerUsername").value || "").toString().trim();
  const remail = (getId("registerEmail").value || "").toString().trim();
  const rpassword = (getId("registerPassword").value || "").toString().trim();
  const rconfirmpassword = (getId("registerConfirmPassword").value || "")
    .toString()
    .trim();

  // Validate required fields
  if (!rusername || !remail || !rpassword || !rconfirmpassword) {
    showMessage(registerMessageEl, "Please fill in all fields!");
    return; // don't proceed or redirect
  }

  if (rpassword === rconfirmpassword) {
    const account = {
      username: rusername,
      email: remail,
      password: rpassword,
    };

    const data = localStorage.getItem("accounts");
    let accounts = JSON.parse(data);
    if (accounts === null) {
      accounts = [];
    }
    accounts.push(account);
    localStorage.setItem("accounts", JSON.stringify(accounts));
    showMessage(registerMessageEl, "Registration successful! Redirecting...", { color: "#1e8a3a" });
    setTimeout(() => (window.location.href = "login.html"), 450);
  } else {
    showMessage(registerMessageEl, "Passwords do not match!");
    return;
  }
};
