const { getConfig } = require("../../config/config");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const proxyChain = require("proxy-chain");
const tunnel = require("tunnel");
const { URL } = require("url"); // Built-in Node.js module to parse URLs
const { returnProxyurl } = require("../../config/userConfig/returnProxyurl");
const { formatProxyUrl } = require("./editProxyurl");
puppeteer.use(StealthPlugin());
const { proxyList } = require("./proxyList");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36",
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// function formatProxyUrl(proxyUrl) {
//   // Split the original proxy URL
//   const [host, port, username, password] = proxyUrl.split(":");
//   // Remove any whitespace from the password
//   const cleanedPassword = password.replace(/\s+/g, "");
//   // Construct the new proxy URL
//   return `http://${username}:${cleanedPassword}@${host}:${port}`;
// }

async function initiateBrowser() {
  const config = await getConfig();
  if (!config) {
    console.error("Failed to load configuration");
    return;
  }

  // const proxyUrls = await returnProxyurl();

  const proxyUrls =
    "https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all";

  if (!proxyUrls) {
    console.error("Failed to load configuration");
    return;
  }
  // console.log("hello proxy", proxyUrls.us);
  // const proxyUrl = formatProxyUrl(proxyUrls.us);
  // console.log("proxyUrl proxyUrl", proxyUrl);
  // console.log("proxyUrl proxyUrl", proxyUrl);
  const isHttpsProxy = proxyUrls.startsWith("https");

  // Parse the proxy URL to extract the necessary information for the tunnel
  const proxyParsed = new URL(proxyUrls);
  const proxyHost = proxyParsed.hostname;
  const proxyPort = proxyParsed.port || (isHttpsProxy ? 443 : 80);
  const proxyAuth =
    proxyParsed.username && proxyParsed.password
      ? `${proxyParsed.username}:${proxyParsed.password}`
      : null;

  console.log("Parsed Proxy Info:");
  console.log("Host:", proxyHost);
  console.log("Port:", proxyPort);
  if (proxyAuth) {
    console.log("Credentials:", proxyAuth);
  }

  // Create a tunnel agent for HTTPS or HTTP proxy
  const tunnelAgent = isHttpsProxy
    ? tunnel.httpsOverHttp({
        proxy: {
          host: proxyHost,
          port: proxyPort,
          proxyAuth: proxyAuth, // Optional, for basic authentication
        },
      })
    : tunnel.httpOverHttp({
        proxy: {
          host: proxyHost,
          port: proxyPort,
          proxyAuth: proxyAuth,
        },
      });

  const browserArgs = [
    "--window-size=1920,1080",
    "--start-maximized",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--enable-logging",
    "--v=1",
    // "--use-fake-ui-for-media-stream",
  ];

  // Apply proxy if it's a valid one and supports HTTPS
  if (proxyUrls) {
    const anonymizedProxyUrl = await proxyChain.anonymizeProxy(proxyUrls);
    browserArgs.push(`--proxy-server=${anonymizedProxyUrl}`);
    console.log("Using anonymized proxy:", anonymizedProxyUrl);
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: browserArgs,
    ignoreHTTPSErrors: true, // Ignore HTTPS errors
    agent: tunnelAgent, // Use the tunnel agent to route requests through the proxy
  });

  const page = await browser.newPage();
  const randomUserAgent = getRandomUserAgent();
  console.log("Random User Agent:", randomUserAgent);
  await page.setUserAgent(randomUserAgent);

  // Block known detection scripts
  await page.evaluateOnNewDocument(() => {
    delete navigator.__proto__.webdriver;
  });

  return { browser, page };
}

module.exports = { initiateBrowser };
