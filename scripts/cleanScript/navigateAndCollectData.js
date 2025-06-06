const { waitForTimeout } = require("./waitForTimeout");

async function navigateAndCollectData(
  page,
  clickLinksCount,
  waitTimeOnWebsite,
  browser
) {
  // Select all anchor tags on the page
  let links = await page.$$("a[href]");

  // Get a random sample of links to click on
  let randomLinks = getRandomSample(links, clickLinksCount);

  for (const link of randomLinks) {
    try {
      // Click on the link and wait for navigation
      await Promise.all([
        link.click(),
        page.waitForNavigation({ waitUntil: "networkidle0" }),
      ]);

      // Wait for a random time on the new page
      await waitForTimeout(waitTimeOnWebsite * 1000 + Math.random() * 2000);

      // Scroll to the bottom of the page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Wait for an additional random time
      await waitForTimeout(4000 + Math.random() * 2000);

      // Go back to the previous page
      await browser.close();

      // Re-select the links on the page in case the DOM has changed
      links = await page.$$("a[href]");
      randomLinks = getRandomSample(links, clickLinksCount);
    } catch (error) {
      console.error("Error during navigation:", error);
      continue;
    }
  }

  // Scroll to the bottom of the original page after completing the loop
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}

// Helper function to get a random sample from an array
function getRandomSample(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = { navigateAndCollectData };
