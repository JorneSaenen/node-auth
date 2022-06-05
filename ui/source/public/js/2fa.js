import { getValues, baseUrl } from "./helpers.js";

(async () => {
  // Building QR code
  const { otplib, QRCode } = window;
  const secret = otplib.authenticator.generateSecret();
  const otpauth = otplib.authenticator.keyuri("jorne@jsjj.be", "JSJJ Auth", secret);
  const imageURL = await QRCode.toDataURL(otpauth);

  // Display QR code
  const qrWrapper = document.getElementById("qr-wrapper");
  const qr = document.createElement("img");
  qr.src = imageURL;
  qrWrapper.appendChild(qr);
})();
