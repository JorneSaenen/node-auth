import { getValues, baseUrl } from "./helpers.js";

// Reset Password Function
const resetForm = document.querySelector("#reset-password-form");
resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    // Getting the values from the pathname
    const [email, time, token] = window.location.pathname.split("/").slice(-3);

    // Getting the values from the form
    const formValues = getValues(resetForm);

    // Getting the values toghether
    const values = {
      ...formValues,
      email: decodeURIComponent(email),
      time,
      token,
    };

    await fetch(`${baseUrl}/api/reset`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        charset: "utf-8",
      },
      body: JSON.stringify(values),
    });
    resetForm.reset();
  } catch (error) {
    resetForm.reset();
    console.error(error);
  }
});
