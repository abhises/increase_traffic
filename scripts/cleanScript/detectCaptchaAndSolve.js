const fs = require("fs");
const ac = require("@antiadmin/anticaptchaofficial");
const { detectCaptcha } = require("./detectCaptch.js");

async function detectCaptchaAndSolve(page) {
  const captchaDetected = await detectCaptcha(page);

  if (!captchaDetected) return false;

  const solve = await ac.setAPIKey("1a8a8692be966618b42134bf73df9e51");

  // Check if it's reCAPTCHA
  const recaptchaElement = await page.$(".g-recaptcha");
  if (recaptchaElement) {
    const siteKey = await page.$eval(".g-recaptcha", (el) =>
      el.getAttribute("data-sitekey")
    );
    const pageUrl = page.url();
    console.log("pageurls", pageUrl);
    console.log("Solving reCAPTCHA...");
    const token = await ac.solveRecaptchaV2Proxyless(
      pageUrl,
      "6LdLLIMbAAAAAIl-KLj9p1ePhM-4LCCDbjtJLqRO"
    );
    console.log("token", token);

    if (!token) {
      console.error("Failed to solve reCAPTCHA");
      return false;
    }

    console.log("Inserting reCAPTCHA token...");
    await page.evaluate((token) => {
      document.querySelector("#g-recaptcha-response").innerHTML = token;
    }, token);

    return true;
  }

  // Otherwise, assume it's an image captcha
  console.log("Trying to solve Image CAPTCHA...");
  const captchaImage = await page.$("img[src*='captcha']");
  if (captchaImage) {
    const captchaBuffer = await captchaImage.screenshot(); // Take screenshot of image CAPTCHA
    const base64Captcha = captchaBuffer.toString("base64");
    const text = await solve.solveImage(base64Captcha, true);

    if (text) {
      console.log("CAPTCHA Solved Text:", text);
      // Now input the text into the correct field
      const inputSelector =
        (await page.$('input[name*="captcha"]')) || (await page.$("#captcha"));
      if (inputSelector) {
        await inputSelector.type(text);
        return true;
      }
    } else {
      console.error("Failed to solve image CAPTCHA");
      return false;
    }
  }

  return false;
}

module.exports = { detectCaptchaAndSolve };
