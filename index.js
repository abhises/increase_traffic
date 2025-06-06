const express = require("express");
const { main } = require("./scripts/cleanScript/main");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.post("/run-script", async (req, res) => {
  const { keyword, website, keyword_id, campaign_id, uid } = req.body;

  if (!keyword && !website) {
    return res.status(400).json({ error: "Keyword and website are required" });
  } else if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  } else if (!website) {
    return res.status(400).json({ error: "Website is required" });
  }

  try {
    const result = await main(keyword, website, keyword_id, campaign_id, uid);

    if (result.found) {
      return res.status(200).json({
        success: true,
        data: result.data,
        status: "success",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.message,
        status: "not found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while running the script",
      status: "error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
