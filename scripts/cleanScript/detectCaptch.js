async function detectCaptcha(page) {
  const captchaSelectors = [
    'form[action*="captcha"]',
    'input[name*="captcha"]',
    'img[src*="captcha"]',
    'div[class*="captcha"]',
    "#captcha",
    ".g-recaptcha",
  ];

  for (const selector of captchaSelectors) {
    if (await page.$(selector)) {
      console.log("Captcha detected");
      return true;
    }
  }

  // Check for specific text that might indicate a captcha
  const pageText = await page.evaluate(() => document.body.innerText);
  if (
    pageText.toLowerCase().includes("captcha") ||
    pageText.toLowerCase().includes("verify you are human")
  ) {
    console.log("Captcha detected through text");
    return true;
  }

  return false;
}

module.exports = { detectCaptcha };
