const { connectToDatabase } = require("../../config/databaseConnection");

async function insertData(data) {
  console.log("insertData", data);

  const pool = await connectToDatabase();
  if (!pool) {
    console.error("Failed to connect to the database");
    return;
  }

  try {
    const query = `
      INSERT INTO traffic (link, keywords, ranking, day, time, spend_time, IP, user,keyword_id,data_uses,campaign_id,found)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
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
      data.keyword_id,
      data.data_uses,
      data.campaign_id,
      data.found,
    ];

    const [result] = await pool.query(query, values);

    console.log("Data inserted successfully:", result);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}
module.exports = { insertData };
