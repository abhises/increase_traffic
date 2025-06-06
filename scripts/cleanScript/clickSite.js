const { typeOne } = require("./typeOne");
const { detectCaptcha } = require("./detectCaptch");
const { handleCookies } = require("./handleCookies");
const { initiateBrowser } = require("./broswer"); // Make sure to reference the browser initialization
const { detectCaptchaAndSolve } = require("./detectCaptchaAndSolve");
async function clickSite(
  browser,
  page,
  keyword,
  site,
  keyword_id,
  campaign_id,
  uid
) {
  let pageNum = 1;
  let siteFound = false; // Flag to track if the site is found
  let retryCount = 0; // Retry counter for timeouts and CAPTCHA
  const maxRetries = 3; // Max retries for navigation timeout and CAPTCHA

  while (!siteFound && retryCount < maxRetries) {
    try {
      // Construct the search URL with pagination
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        keyword
      )}&start=${(pageNum - 1) * 10}`;

      console.log(`Navigating to: ${searchUrl}`);

      // Increase timeout for page.goto
      await page.goto(searchUrl, { waitUntil: "networkidle0", timeout: 60000 });

      console.log(await page.title());

      // Handle cookies if needed

      // Detect and handle CAPTCHA
      if ((await detectCaptcha(page)) || (await handleCookies(page))) {
        console.log(
          "CAPTCHA detected, retrying with a new browser and proxy..."
        );
        const captchaSolved = await detectCaptchaAndSolve(page);
        if (captchaSolved) {
          console.log("Captcha handled successfully!");
        } else {
          console.log("No captcha found or failed to solve.");
        }

        // Close the current browser
        // await browser.close();
        retryCount++;

        // Wait a bit before reinitializing the browser
        await waitForTimeout(5000);

        // Reinitialize the browser with a new IP (new proxy)
        const { browser: newBrowser, page: newPage } = await initiateBrowser();

        // Update the browser and page variables
        browser = newBrowser;
        page = newPage;

        continue; // Retry the loop with the new browser and IP
      }

      // Handle "Accept all" button if present
      try {
        await page.click("text/Accept all");
      } catch (error) {
        console.log("No accept button found");
      }

      await waitForTimeout(8000 + Math.random() * 2000);

      console.log(`Checking page ${pageNum}`);
      const result = await typeOne(
        browser,
        page,
        keyword,
        site,
        keyword_id,
        campaign_id,
        uid
      );
      console.log(result);

      if (result.found) {
        siteFound = true; // Site found
        await browser.close();
        return result.data; // Return the result
      }

      console.log(`Checking for next page button on page ${pageNum}`);
      await waitForTimeout(5000 + Math.random() * 2000);

      // Check if there's a "Next" page
      const nextPageSelectors = [
        "div.GNJvt.ipz2Oe",
        'a[aria-label="Next"]',
        "#pnnext",
        "text/Next",
      ];

      let nextPage = null;
      for (const selector of nextPageSelectors) {
        nextPage = await page.$(selector);
        if (nextPage) {
          console.log(`Next page button found with selector: ${selector}`);
          pageNum++;
          break;
        }
      }

      if (!nextPage) {
        console.log("Next page button not found, stopping search.");
        await browser.close();
        break;
      }
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.log(
          `Timeout occurred on page ${pageNum}, retrying... (${
            retryCount + 1
          }/${maxRetries})`
        );
        retryCount++;
        await waitForTimeout(3000); // Wait a bit before retrying
      } else {
        console.log("An error occurred:", error);
        await browser.close();
        return { found: false, message: error.message };
      }
    }
  }

  await browser.close();
  return { found: false, message: "Site not found after checking all pages" }; // Site not found
}

function waitForTimeout(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

module.exports = { clickSite };
