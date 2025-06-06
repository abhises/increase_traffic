const { insertData } = require("./insertData");
const { waitForTimeout } = require("./waitForTimeout");
const { getIp } = require("./getIp");
const { navigateAndCollectData } = require("./navigateAndCollectData");
const moment = require("moment");
const { trackDataUsage } = require("./trackDataUsage");
const {
  returnUserByIdAndUpdateExecutions,
} = require("../../config/userConfig/returnUser");

async function typeOne(
  browser,
  page,
  keyword,
  site,
  keyword_id,
  campaign_id,
  uid,
  tries = 0
) {
  const getDataUsage = await trackDataUsage(page);
  let globalPosition = 0;

  while (true) {
    // Get the current list of links on the page
    const links = await page.$$("div.kCrYT a, div.yuRUbf a");
    let position = 0;
    let found = false;

    for (const link of links) {
      try {
        // Get the href of the current link
        const website = await page.evaluate((el) => el.href, link);
        console.log(website, globalPosition + position + 1);

        // Check if the website contains the target site
        if (website.includes(site)) {
          console.log("Found in type one");
          found = true;

          // Scroll to the link and attempt to click
          await page.evaluate(
            (el) => el.scrollIntoView({ behavior: "smooth", block: "center" }),
            link
          );
          console.log(
            "Attempting to click the link:",
            await link.evaluate((el) => el.outerHTML)
          );

          try {
            // Click the link and wait for navigation
            await Promise.all([
              link.click(),
              page.waitForNavigation({
                waitUntil: "networkidle2",
                timeout: 60000,
              }),
            ]);

            console.log("Navigation to the website!");
          } catch (clickError) {
            console.error(
              "Error clicking the link or waiting for navigation:",
              clickError
            );
          }

          const startTime = Date.now();
          await waitForTimeout(1000);
          await page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
          );
          await waitForTimeout(10000);

          await navigateAndCollectData(page, 3, 15, browser);

          const total = (Date.now() - startTime) / 1000;
          const accuratePosition = globalPosition + position + 1;
          const { totalDataUsedMB } = await getDataUsage();

          const ip = await getIp();
          const data = {
            link: site,
            keywords: keyword,
            ranking: accuratePosition,
            day: moment().format("YYYY-MM-DD"),
            time: moment().format("HH:mm:ss"),
            spend_time: total,
            IP: ip,
            user: uid,
            keyword_id: keyword_id,
            data_uses: totalDataUsedMB,
            campaign_id: campaign_id,
            found: true,
          };

          await insertData(data);
          await browser.close();
          await returnUserByIdAndUpdateExecutions(uid);

          return { found: true, data };
        } else {
          position++;
        }
      } catch (error) {
        console.error("Error during link evaluation or click:", error);
      }
    }

    if (found) break; // Exit the loop if the site is found

    // Update globalPosition to include the links counted on this page
    globalPosition += links.length;

    // Increment tries and check if max tries are reached
    tries++;
    if (tries === 10) {
      const ip = await getIp();
      const { totalDataUsedMB } = await getDataUsage();

      const data = {
        link: site,
        keywords: keyword,
        ranking: "Not found",
        day: moment().format("YYYY-MM-DD"),
        time: moment().format("HH:mm:ss"),
        spend_time: "Not found",
        IP: ip,
        user: uid,
        keyword_id: keyword_id,
        data_uses: totalDataUsedMB,
        campaign_id: campaign_id,
        found: false,
      };
      await insertData(data);
      await browser.close();
      await returnUserByIdAndUpdateExecutions(uid);

      return { found: false, data };
    }

    try {
      // Attempt to navigate to the next page
      const nextPageButton = await page.$("#pnnext");
      if (nextPageButton) {
        await page.evaluate(
          (el) => el.scrollIntoView({ behavior: "smooth", block: "center" }),
          nextPageButton
        );
        await Promise.all([
          nextPageButton.click(),
          page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
        ]);
        console.log("Navigating to next page...");
      } else {
        throw new Error("Next page button not found");
      }
      await waitForTimeout(5000 + Math.random() * 5000);
    } catch (error) {
      console.error("Failed to navigate to the next page:", error);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await waitForTimeout(5000 + Math.random() * 5000);
    }
  }
}

module.exports = { typeOne };
