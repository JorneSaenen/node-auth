// Register Function
(() => {
  const registerForm = document.querySelector("#registration-form");
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const values = Object.values(registerForm).reduce((obj, field) => {
        if (field.name) {
          obj[field.name] = field.value;
        }
        return obj;
      }, {});
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          charset: "utf-8",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      console.log(data);
      registerForm.reset();
    } catch (error) {
      console.error(error);
      registerForm.reset();
    }
  });
})();

// Login Function
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const values = Object.values(loginForm).reduce((obj, field) => {
      if (field.name) {
        obj[field.name] = field.value;
      }
      return obj;
    }, {});
    await fetch("/api/authorize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        charset: "utf-8",
      },
      body: JSON.stringify(values),
    });
    loginForm.reset();
  } catch (error) {
    console.error(error);
    loginForm.reset();
  }
});

// Logout Function
const logoutBtn = document.querySelector("#logout-button");
const logout = async () => {
  try {
    await fetch("/api/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error(error);
  }
};
logoutBtn.addEventListener("click", logout);
