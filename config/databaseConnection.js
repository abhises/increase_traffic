const mysql = require("mysql2/promise");
const { returnDatabaseConfig } = require("./userConfig/returnDatabaseConfig");

let connection;

async function connectToDatabase() {
  if (!connection) {
    const config = await returnDatabaseConfig();
    if (!config) {
      console.error("Failed to load configuration");
      return null;
    }

    console.log(config);

    const dbConfig = {
      host: config.host,
      database: "u211633219_rank1db", // Use the database name you need
      port: config.port,
      user: config.user,
      password: config.pass,
      waitForConnections: true,
      connectionLimit: 10, // Adjust based on your needs
      queueLimit: 0,
    };

    try {
      connection = await mysql.createPool(dbConfig); // Use createPool for connection pooling

      connection.on("error", async (err) => {
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          console.error("Database connection was closed. Reconnecting...");
          connection = await connectToDatabase();
        } else {
          console.error("Database error:", err);
          connection = null;
        }
      });

      console.log("Database connected successfully");
    } catch (error) {
      console.error("Error connecting to the database:", error);
      connection = null;
    }
  }

  return connection;
}

module.exports = {
  connectToDatabase,
};
