import { getValues, baseUrl } from "./helpers.js";

(async () => {
  // Building QR code
  const { otplib, QRCode } = window;

  // Get current user
  const userResponse = await fetch(`${baseUrl}/api/user`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
  const userData = await userResponse.json();

  // If user exists, Create QR code
  if (userData?.data?.user?.email?.address) {
    // Create QR code
    const secret = otplib.authenticator.generateSecret();
    const otpauth = otplib.authenticator.keyuri(userData?.data?.user?.email?.address, "JSJJ Auth", secret);
    const imageURL = await QRCode.toDataURL(otpauth);

    // Display QR code
    const qrWrapper = document.getElementById("qr-wrapper");
    const qr = document.createElement("img");
    qr.src = imageURL;
    qrWrapper.appendChild(qr);

    // Token verification Form
    const tokenForm = document.querySelector("#token");
    tokenForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const formValues = await getValues(tokenForm);
        const values = {
          ...formValues,
          secret,
        };

        const response = await fetch(`${baseUrl}/api/2fa-register`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(values),
        });
        console.log({ values, response });
        tokenForm.reset();
      } catch (error) {
        tokenForm.reset();
        console.error(error);
      }
    });
  }
})();
