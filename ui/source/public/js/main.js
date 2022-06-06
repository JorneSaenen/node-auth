import { baseUrl, getValues } from "./helpers.js";

// Register Function
const registerForm = document.querySelector("#registration-form");
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const values = getValues(registerForm);
    await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        charset: "utf-8",
      },
      body: JSON.stringify(values),
    });
    registerForm.reset();
  } catch (error) {
    console.error(error);
    registerForm.reset();
  }
});

// Login Function
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const values = getValues(loginForm);
    const response = await fetch(`${baseUrl}/api/authorize`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        charset: "utf-8",
      },
      body: JSON.stringify(values),
    });
    const {
      data: { status },
    } = await response.json();

    if (status === "2FA") {
      loginForm.reset();
      const tokenForm = document.querySelector("#token-form");

      tokenForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const tokenvalue = getValues(tokenForm);

          await fetch(`${baseUrl}/api/verify-2fa`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              charset: "utf-8",
            },
            body: JSON.stringify({ ...tokenvalue, ...values }),
          });
          tokenForm.reset();
        } catch (error) {
          console.error(error);
          tokenForm.reset();
        }
      });
    }
    loginForm.reset();
  } catch (error) {
    console.error(error);
    loginForm.reset();
  }
});

// Change Password Function
const changePassword = document.querySelector("#change-form");
changePassword.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const values = getValues(changePassword);
    await fetch(`${baseUrl}/api/change-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        charset: "utf-8",
      },
      body: JSON.stringify(values),
    });
    changePassword.reset();
  } catch (error) {
    console.error(error);
    changePassword.reset();
  }
});

// Forgot Password Function
const forgotForm = document.querySelector("#forgot-password-form");
forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const values = getValues(forgotForm);
    await fetch(`${baseUrl}/api/forgot-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        charset: "utf-8",
      },
      body: JSON.stringify(values),
    });
    forgotForm.reset();
  } catch (error) {
    forgotForm.reset();
    console.error(error);
  }
});

// Logout Function
const logoutBtn = document.querySelector("#logout-button");
const logout = async () => {
  try {
    await fetch(`${baseUrl}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error(error);
  }
};
logoutBtn.addEventListener("click", logout);
