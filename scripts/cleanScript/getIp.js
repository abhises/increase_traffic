const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { getConfig } = require("../../config/config");
const { returnProxyurl } = require("../../config/userConfig/returnProxyurl");
const { formatProxyUrl } = require("./editProxyurl");

async function getIp() {
  const config = await getConfig();
  if (!config) {
    console.error("Failed to load configuration");
    return;
  }
  const proxyUrls = await returnProxyurl();

  if (!proxyUrls) {
    console.error("Failed to load configuration");
    return;
  }
  // console.log("hello proxy", proxyUrls.us);
  const proxyUrl = formatProxyUrl(proxyUrls.us);
  // const proxyUrl = config.proxy_url;

  // console.log("proxyUrl", proxyUrl);

  try {
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    // console.log("proxyAgent", proxyAgent);
    const response = await axios({
      url: "https://httpbin.org/ip",
      method: "get",
      httpAgent: proxyAgent,
      httpsAgent: proxyAgent,
      timeout: 10000, // optional timeout
    });
    // console.log("response", response);

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

module.exports = { getIp };
