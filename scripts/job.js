const cron = require("node-cron");

// Example campaign data
const campaignList = [
  {
    campaign_id: 21,
    campaign_type: "on",
    campaign_name: "First campaign",
    url_subdomain: "shopify.com",
    browser_language: "English",
    browser_timezone: "Eastern Standard Time (EST)",
    page_view: "1page",
    average_session_duration: "5mins",
    keyword_data: '[{"keyword":"onlinestore","daily_search_frequency":2000}]',
    created_by: "2",
  },
  // Add more campaigns here...
];

// Function to calculate the cron schedule based on the frequency
function calculateCronExpression(frequency) {
  const interval = 24 / frequency; // interval in hours
  const minutes = Math.round((interval - Math.floor(interval)) * 60);
  const hours = Math.floor(interval);
  return `*/${minutes} ${hours} * * *`; // runs every `interval` hours and `minutes`
}

// Function to start the cron jobs for all campaigns
function startCronJobs() {
  campaignList.forEach((campaign) => {
    const keywordData = JSON.parse(campaign.keyword_data);

    // Assuming each campaign has only one keyword with a daily_search_frequency
    keywordData.forEach((keyword) => {
      const frequency = keyword.daily_search_frequency;
      const cronExpression = calculateCronExpression(frequency);

      cron.schedule(cronExpression, () => {
        console.log(
          `Running job for Campaign ID: ${campaign.campaign_id}, Keyword: ${keyword.keyword}`
        );
        // Your job logic here, specific to the campaign and keyword
      });
    });
  });
}

// Start the cron jobs
startCronJobs();
