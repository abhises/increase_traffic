//  /src/config/config.js
const { db } = require("./firebase.js");

async function getConfig() {
  try {
    const doc = await db.collection("configurations").doc("current").get();

    if (!doc.exists) {
      console.log("No such document!");
      return null;
    } else {
      const data = doc.data();

      const config = {
        proxy_auth: data.proxy_auth || "",
        proxy_url: data.proxy_url || "",
        database: {
          host: data.database?.host || "",
          "database name": data.database?.["database name"] || "",
          port: data.database?.port || "",
          user: data.database?.user || "",
          pass: data.database?.pass || "",
        },
        keyword: data.keyword || "",
        search_engine: data.search_engine || "",
        website: data.website || "",
        number_to_run: data.number_to_run || 1,
        wait_time_on_website: data.wait_time_on_website || 15,
        click_links_count: data.click_links_count || 3,
        navigation_time: data.navigation_time || 90,
      };

      return config;
    }
  } catch (error) {
    console.error("Error getting configuration:", error);
    return null;
  }
}

require("dotenv").config(); // Load environment variables from a .env file

// Export both getConfig function and environment variables as a single object
module.exports = {
  getConfig,
  port: process.env.PORT, // Default to port 3000 if PORT is not set
};
