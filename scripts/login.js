function getId(id) {
  return document.getElementById(id);
}

function getIdAccount(email) {
  const data = localStorage.getItem("accounts");
  if (!data) return -1;
  let accounts;
  try {
    accounts = JSON.parse(data) || [];
  } catch (e) {
    return -1;
  }
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].email === email) {
      return accounts[i].password;
    }
  }
  return -1;
}

const btnLogin = getId("btnLogin");
const loginMessageEl = getId("loginMessage");

function showMessage(el, text, opts = {}) {
  if (!el) return;
  el.textContent = text || "";
  if (opts.color) el.style.color = opts.color;
  else el.style.color = "var(--red)";
}

btnLogin.onclick = function (e) {
  e.preventDefault();
  const lemail = (getId("loginEmail").value || "").toString().trim();
  const lpassword = (getId("loginPassword").value || "").toString().trim();

  // Validate required fields
  if (!lemail || !lpassword) {
    showMessage(loginMessageEl, "Please fill in all fields!");
    return; // don't proceed or redirect
  }

  const password = getIdAccount(lemail);
  if (password === -1) {
    showMessage(loginMessageEl, "Account doesn't exist!");
    return;
  } else if (password !== lpassword) {
    showMessage(loginMessageEl, "Incorrect password!");
    return;
  } else if (password === lpassword) {
    showMessage(loginMessageEl, "Login successful!", { color: "#1e8a3a" });
    // small delay so user can see the message before redirect
    setTimeout(() => (window.location.href = "index.html"), 350);
  }
};
