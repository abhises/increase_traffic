const { initiateBrowser } = require("./broswer");
const { clickSite } = require("./clickSite");

async function main(keyword, site, keyword_id, campaign_id, uid) {
  let retryCount = 0;
  const maxRetries = 5; // Retry 5 times in case of CAPTCHA or other issues

  while (retryCount < maxRetries) {
    const { browser, page } = await initiateBrowser();
    try {
      const result = await clickSite(
        browser,
        page,
        keyword,
        site,
        keyword_id,
        campaign_id,
        uid
      );
      if (result) {
        console.log("Site found in main:", result);
        return { found: true, data: result };
      } else {
        console.log("Site not found after checking all pages.");
        return {
          found: false,
          message: "Site not found after checking all pages.",
        };
      }
    } catch (error) {
      console.error("An error occurred in main:", error);
      retryCount++;
      if (retryCount >= maxRetries) {
        console.log("Max retries reached. Aborting.");
        return { found: false, message: "CAPTCHA or errors encountered." };
      }
      console.log(`Retrying main function... (${retryCount}/${maxRetries})`);
      await waitForTimeout(5000); // Wait before retrying
    } finally {
      await browser.close();
    }
  }
}

// main().catch(console.error);

function waitForTimeout(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

module.exports = { main };
