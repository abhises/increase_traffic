const { databaseConfig } = require("./firebase");

async function returnDatabaseConfig() {
  try {
    // Fetch all documents from the 'cre' collection
    const snapshot = await databaseConfig.collection("cre").get();

    // Check if the collection has documents
    if (snapshot.empty) {
      console.log("No documents found in the 'cre' collection!");
      return null;
    }

    // Iterate through the documents in the QuerySnapshot
    let databaseData = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (doc.id === "increaseTraffic") {
        databaseData = { id: doc.id, ...data }; // Return only the document with id 'pscrap'
      }
    });

    // console.log("databaseData", databaseData);

    if (databaseData) {
      //   console.log("Found pscrap data:", pscrapData);
      return databaseData;
    } else {
      console.log("No document with id 'pscrap' found.");
      return null;
    }
  } catch (error) {
    console.error("Error getting 'cre' documents:", error);
    return null;
  }
}

module.exports = { returnDatabaseConfig };
