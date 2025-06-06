const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const HttpsProxyAgent = require("https-proxy-agent");
const moment = require("moment");
const axios = require("axios");
const mysql = require("mysql2/promise");
const proxyChain = require("proxy-chain");
const { getConfig } = require("../config/config");
const { connectToDatabase } = require("../config/databaseConnection");

puppeteer.use(StealthPlugin());

async function initiateBrowser() {
  const config = await getConfig();
  if (!config) {
    console.error("Failed to load configuration");
    return;
  }
  const proxyUrl = config.proxy_url;

  //   console.log(`Launching browser with proxy: ${proxyUrl}`);
  const newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=${newProxyUrl}`,
      "--window-size=1920,1080",
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--enable-logging",
      "--v=1",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  return { browser, page };
}
async function navigateAndCollectData(
  page,
  clickLinksCount,
  waitTimeOnWebsite
) {
  const links = await page.$$("a");
  const randomLinks = getRandomSample(links, clickLinksCount);

  for (const link of randomLinks) {
    try {
      await link.click();
      await waitForTimeout(waitTimeOnWebsite * 1000 + Math.random() * 2000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await waitForTimeout(4000 + Math.random() * 2000);
      await page.goBack();
    } catch (error) {
      if (error.message.includes("Navigating frame was detached")) {
        console.error("Frame was detached, skipping link.");
        continue;
      }
      console.error("Error navigating:", error);
    }
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}
async function typeOne(page, keyword, site, tries = 0) {
  const links = await page.$$("div.kCrYT, div.yuRUbf");
  let position = 0;
  let totalPosition = 0;

  for (const link of links) {
    try {
      const website = await link.$eval('a[jsname="UWckNb"]', (el) => el.href);
      console.log(website, position);

      if (website.includes(site)) {
        console.log("Found in type");
        await page.evaluate((el) => el.scrollIntoView(), link);

        await page.waitForSelector('a[jsname="UWckNb"]', {
          visible: true,
        });

        // await link.click();
        // console.log("Going to the website!");

        // try {
        //   await page.waitForNavigation({
        //     waitUntil: "networkidle0",
        //     timeout: 60000,
        //   });
        //   console.log("Navigation successful!");
        // } catch (error) {
        //   console.error("Navigation failed:", error);
        //   continue;
        // }

        const startTime = Date.now();
        await waitForTimeout(1000);
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight)
        );
        await waitForTimeout(3000);

        await navigateAndCollectData(page, 3, 15);

        const endTime = Date.now();
        const total = (endTime - startTime) / 1000;
        totalPosition++;
        position++;
        console.log(totalPosition);

        const ip = await getIp();
        const data = {
          link: site,
          keywords: keyword,
          ranking: position,
          day: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm:ss"),
          spend_time: total,
          IP: ip,
          user: "user",
        };

        console.log("hi", data);
        await insertData(data);

        return { found: true, data };
      } else {
        position++;
      }
    } catch (error) {
      console.error("Error during link evaluation or click:", error);
      continue;
    }
  }

  return { found: false, data: null };
}

// async function typeOne(page, keyword, site, tries = 0, browser) {
//   while (true) {
//     const links = await page.$$("div.kCrYT, div.yuRUbf");
//     let position = 0;
//     let totalPosition = 0;
//     let found = false;

//     for (const link of links) {
//       try {
//         const website = await link.$eval('a[jsname="UWckNb"]', (el) => el.href);
//         console.log(website, position);

//         if (website.includes(site)) {
//           console.log("Found in type");
//           found = true;
//           await page.evaluate((el) => el.scrollIntoView(), link);

//           // Wait for the element to be clickable
//           await page.waitForSelector('a[jsname="UWckNb"]', {
//             visible: true,
//           });

//           // await link.click();
//           // console.log("Going to the website!");

//           // try {
//           //   await page.waitForNavigation({
//           //     waitUntil: "networkidle0",
//           //     timeout: 60000,
//           //   });
//           //   console.log("Navigation successful!");
//           // } catch (error) {
//           //   console.error("Navigation failed:", error);
//           //   continue;
//           // }

//           const startTime = Date.now();
//           await waitForTimeout(1000);
//           await page.evaluate(() =>
//             window.scrollTo(0, document.body.scrollHeight)
//           );
//           await waitForTimeout(3000);

//           await navigateAndCollectData(page, 3, 15);

//           const endTime = Date.now();
//           const total = (endTime - startTime) / 1000;
//           totalPosition++;
//           position++;
//           console.log(totalPosition);

//           const ip = await getIp();
//           const data = {
//             link: site,
//             keywords: keyword,
//             ranking: position,
//             day: moment().format("YYYY-MM-DD"),
//             time: moment().format("HH:mm:ss"),
//             spend_time: total,
//             IP: ip,
//             user: "user",
//           };

//           console.log("hi", data);
//           await insertData(data);
//           await browser.close();

//           return data; // This will now exit the function entirely
//         } else {
//           position++;
//         }
//       } catch (error) {
//         console.error("Error during link evaluation or click:", error);
//         continue;
//       }
//     }

//     if (found) break; // This is redundant now, but kept for clarity

//     tries++;
//     if (tries === 8) {
//       const ip = await getIp();
//       const data = {
//         link: site,
//         keywords: keyword,
//         ranking: "Not found",
//         day: moment().format("YYYY-MM-DD"),
//         time: moment().format("HH:mm:ss"),
//         spend_time: "Not found",
//         IP: ip,
//         user: "user",
//       };
//       await insertData(data);
//       await browser.close();
//       return null; // This will exit the function if not found after max tries
//     }

//     try {
//       const nextPageButton = await page.$("#pnnext");
//       if (nextPageButton) {
//         await nextPageButton.scrollIntoView();
//         await nextPageButton.click();
//         console.log("Navigating to next page...");
//         await page.waitForNavigation({
//           waitUntil: "networkidle0",
//           timeout: 60000,
//         });
//       } else {
//         throw new Error("Next page button not found");
//       }
//       await waitForTimeout(5000 + Math.random() * 5000);
//     } catch (error) {
//       console.error("Failed to navigate to the next page:", error);
//       await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
//       await waitForTimeout(5000 + Math.random() * 5000);
//     }
//   }
// }

// async function typeOne(page, keyword, site, tries = 0, browser) {
//   while (true) {
//     const links = await page.$$("div.kCrYT, div.yuRUbf");
//     let position = 0;
//     let totalPosition = 0;
//     let found = false;

//     for (const link of links) {
//       try {
//         const website = await link.$eval('a[jsname="UWckNb"]', (el) => el.href);
//         console.log(website, position);

//         if (website.includes(site)) {
//           console.log("Found in type");
//           found = true;
//           await page.evaluate((el) => el.scrollIntoView(), link);

//           // Wait for the element to be clickable
//           await page.waitForSelector('a[jsname="UWckNb"]', {
//             visible: true,
//           });

//           await link.click();
//           console.log("Going to the website!");

//           try {
//             await page.waitForNavigation({
//               waitUntil: "networkidle0",
//               timeout: 60000,
//             });
//             console.log("Navigation successful!");
//           } catch (error) {
//             console.error("Navigation failed:", error);
//             continue;
//           }

//           const startTime = Date.now();
//           await waitForTimeout(1000);
//           await page.evaluate(() =>
//             window.scrollTo(0, document.body.scrollHeight)
//           );
//           await waitForTimeout(3000);

//           await navigateAndCollectData(page, 3, 15);

//           const endTime = Date.now();
//           const total = (endTime - startTime) / 1000;
//           totalPosition++;
//           position++;
//           console.log(totalPosition);

//           const ip = await getIp();
//           const data = {
//             link: site,
//             keywords: keyword,
//             ranking: position,
//             day: moment().format("YYYY-MM-DD"),
//             time: moment().format("HH:mm:ss"),
//             spend_time: total,
//             IP: ip,
//             user: "user",
//           };

//           console.log("hi", data);
//           await insertData(data);
//           // console.log("Done");
//           await browser.close();

//           return data; // Return the position if found
//         } else {
//           position++;
//         }
//       } catch (error) {
//         console.error("Error during link evaluation or click:", error);
//         continue;
//       }
//     }

//     if (found) break;

//     tries++;
//     if (tries === 8) {
//       const ip = await getIp();
//       const data = {
//         link: site,
//         keywords: keyword,
//         ranking: "Not found",
//         day: moment().format("YYYY-MM-DD"),
//         time: moment().format("HH:mm:ss"),
//         spend_time: "Not found",
//         IP: ip,
//         user: "user",
//       };
//       await insertData(data);
//       return null; // Return null if not found after max tries
//     }

//     try {
//       const nextPageButton = await page.$("#pnnext");
//       if (nextPageButton) {
//         await nextPageButton.scrollIntoView();
//         await nextPageButton.click();
//         console.log("Navigating to next page...");
//         await page.waitForNavigation({
//           waitUntil: "networkidle0",
//           timeout: 60000,
//         });
//       } else {
//         throw new Error("Next page button not found");
//       }
//       await waitForTimeout(5000 + Math.random() * 5000);
//     } catch (error) {
//       console.error("Failed to navigate to the next page:", error);
//       await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
//       await waitForTimeout(5000 + Math.random() * 5000);
//     }
//   }
// }

// async function clickSite(browser, page, keyword, site) {
//   await page.goto("https://google.com");
//   console.log(await page.title());

//   await waitForTimeout(5000 + Math.random() * 1000);

//   try {
//     await page.click("text/Accept all");
//   } catch (error) {
//     console.log("No accept button found");
//   }

//   await waitForTimeout(8000 + Math.random() * 2000);

//   await page.type('textarea[name="q"]', keyword);
//   await page.keyboard.press("Enter");
//   console.log(`Searching for "${keyword}"`);

//   await waitForTimeout(10000 + Math.random() * 5000);
//   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

//   await typeOne(page, keyword, site, browser);

//   let pageNum = 1;
//   while (true) {
//     console.log(`Checking for next page button on page ${pageNum}`);
//     await waitForTimeout(5000 + Math.random() * 2000);

//     const nextPageSelectors = [
//       "div.GNJvt.ipz2Oe",
//       'a[aria-label="Next"]',
//       "#pnnext",
//       "text/Next",
//     ];

//     let nextPage = null;
//     for (const selector of nextPageSelectors) {
//       nextPage = await page.$(selector);
//       if (nextPage) {
//         console.log(`Next page button found with selector: ${selector}`);
//         break;
//       }
//     }

//     if (nextPage) {
//       console.log(`Attempting to navigate to page ${pageNum + 1}`);
//       try {
//         await Promise.all([
//           nextPage.click(),
//           page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
//         ]);
//         console.log(`Successfully navigated to page ${pageNum + 1}`);
//         pageNum++;
//         await typeOne(page, keyword, site);
//       } catch (error) {
//         console.error(`Failed to navigate to page ${pageNum + 1}:`, error);
//         break;
//       }
//     } else {
//       console.log("Next page button not found, stopping search.");
//       const pageContent = await page.content();
//       console.log("Page content:", pageContent);
//       break;
//     }
//   }
// }
async function clickSite(browser, page, keyword, site) {
  await page.goto("https://google.com");
  console.log(await page.title());

  await waitForTimeout(5000 + Math.random() * 1000);

  try {
    await page.click("text/Accept all");
  } catch (error) {
    console.log("No accept button found");
  }

  await waitForTimeout(8000 + Math.random() * 2000);

  await page.type('textarea[name="q"]', keyword);
  await page.keyboard.press("Enter");
  console.log(`Searching for "${keyword}"`);

  await waitForTimeout(10000 + Math.random() * 5000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  let pageNum = 1;
  while (true) {
    console.log(`Checking page ${pageNum}`);

    const result = await typeOne(page, keyword, site);
    if (result.found) {
      await browser.close();
      return result.data;
    }

    console.log(`Checking for next page button on page ${pageNum}`);
    await waitForTimeout(5000 + Math.random() * 2000);

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
        break;
      }
    }

    if (nextPage) {
      console.log(`Attempting to navigate to page ${pageNum + 1}`);
      try {
        await Promise.all([
          nextPage.click(),
          page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
        ]);
        console.log(`Successfully navigated to page ${pageNum + 1}`);
        pageNum++;
      } catch (error) {
        console.error(`Failed to navigate to page ${pageNum + 1}:`, error);
        await browser.close();

        break;
      }
    } else {
      console.log("Next page button not found, stopping search.");
      const pageContent = await page.content();
      console.log("Page content:", pageContent);
      break;
    }
  }

  await browser.close();
  return null; // Return null if the site was not found after checking all pages
}
function waitForTimeout(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

async function getIp() {
  try {
    const proxyAgent = new HttpsProxyAgent(proxyUrl);

    const response = await axios.get("https://httpbin.org/ip", {
      httpAgent: proxyAgent,
      httpsAgent: proxyAgent,
    });
    return response.data.origin;
  } catch (error) {
    console.error("Error getting IP via proxy:", error.message);

    try {
      const response = await axios.get("https://httpbin.org/ip");
      return response.data.origin;
    } catch (fallbackError) {
      console.error("Error getting IP directly:", fallbackError.message);
      throw new Error("Failed to get IP address via proxy and direct request");
    }
  }
}

// getIp()
//   .then((ip) => console.log("IP:", ip))
//   .catch((error) => console.error("Final error:", error.message));

async function insertData(data) {
  console.log("insertData", data);
  const config = await getConfig();
  if (!config) {
    console.error("Failed to load configuration");
    return;
  }
  // console.log(config);

  const connection = await connectToDatabase;
  if (!connection) {
    console.error("Failed to connect to the database");
    return;
  }
  try {
    const query = `
      INSERT INTO table1 (link, keywords, ranking, day, time, spend_time, IP,user)
      VALUES (?, ?, ?, ?, ?, ?, ?,?)
    `;

    const values = [
      data.link,
      data.keywords,
      data.ranking,
      data.day,
      data.time,
      data.spend_time,
      data.IP,
      data.user,
    ];

    const [result] = await connection.execute(query, values);

    console.log("Data inserted successfully:", result);
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    await connection.end();
  }
}

function getRandomSample(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main(keyword, site) {
  for (let i = 0; i < 1; i++) {
    const { browser, page } = await initiateBrowser();
    // console.log(page);
    try {
      const result = await clickSite(browser, page, keyword, site);
      if (result) {
        console.log("Site found:", result);
        return { found: true, data: result };
      } else {
        console.log("Site not found after checking all pages.");
        return {
          found: false,
          message: "Site not found after checking all pages.",
        };
      }
    } catch (error) {
      console.error("An error occurred:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}

// main().catch(console.error);

module.exports = { main };
