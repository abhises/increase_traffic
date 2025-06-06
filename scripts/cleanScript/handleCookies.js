async function handleCookies(page) {
  try {
    // Array of possible cookie consent button selectors, including the specific button you've shared
    const consentButtonSelectors = [
      "#L2AGLb", // Specific ID for the "Accept all" button you shared
      "button.tHlp8d", // Specific class for the button
      'div.QS5gu.sy4vM[role="none"]', // Specific div inside the button
      // Other general selectors to handle different languages
      'button[aria-label="Accept all"]',
      '//button[contains(text(), "Accept")]', // XPath for "Accept"
      '//div[contains(text(), "Accept all")]', // XPath targeting the div with text "Accept all"
    ];

    let consentButtonFound = false;

    // Loop through possible consent button selectors
    for (const selector of consentButtonSelectors) {
      let button;
      if (selector.startsWith("//")) {
        // Handle XPath
        button = await page.$x(selector);
        if (button.length > 0) {
          await button[0].click(); // Click the first matching button
          consentButtonFound = true;
          console.log("Cookie consent accepted via XPath:", selector);
          break;
        }
      } else {
        // Handle regular CSS selectors
        button = await page.$(selector);
        if (button) {
          await page.click(selector);
          consentButtonFound = true;
          console.log("Cookie consent accepted via CSS selector:", selector);
          break;
        }
      }
    }

    if (!consentButtonFound) {
      console.log("No cookie consent popup found, or already handled.");
      // Optionally log the page content for debugging
      const content = await page.content();
      console.log("Page HTML content for debugging:", content);
    }

    // Handle possible location permission popups
    const locationPopupSelectors = [
      'button[aria-label="Use precise location"]', // For precise location access
      'button[aria-label="Don’t allow"]', // Decline location access
      'button[class*="location"]', // Generic location selector
      '//button[contains(text(), "Allow")]', // XPath for location allow
      '//button[contains(text(), "Block")]', // XPath for location block
    ];

    for (const selector of locationPopupSelectors) {
      let locationButton;
      if (selector.startsWith("//")) {
        // Handle XPath
        locationButton = await page.$x(selector);
        if (locationButton.length > 0) {
          await locationButton[0].click(); // Click the first matching button
          console.log("Location popup handled via XPath:", selector);
          break;
        }
      } else {
        // Handle regular CSS selectors
        locationButton = await page.$(selector);
        if (locationButton) {
          await page.click(selector);
          console.log("Location popup handled via CSS selector:", selector);
          break;
        }
      }
    }
  } catch (error) {
    console.log(
      "Error handling cookie consent or location popup:",
      error.message
    );
  }
}

module.exports = { handleCookies };
