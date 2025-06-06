const { proxyConfig } = require("./firebase"); // Ensure proxyConfig is correctly configured to interact with Firebase Firestore

async function returnProxyurl() {
  try {
    // Fetch all documents from the 'cre' collection
    const snapshot = await proxyConfig.collection("cre").get();

    // Check if the collection has documents
    if (snapshot.empty) {
      console.log("No documents found in the 'cre' collection!");
      return null;
    }

    // Iterate through the documents in the QuerySnapshot
    let pscrapData = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (doc.id === "pscrap") {
        pscrapData = { id: doc.id, ...data }; // Return only the document with id 'pscrap'
      }
    });

    if (pscrapData) {
      //   console.log("Found pscrap data:", pscrapData);
      return pscrapData;
    } else {
      console.log("No document with id 'pscrap' found.");
      return null;
    }
  } catch (error) {
    console.error("Error getting 'cre' documents:", error);
    return null;
  }
}

module.exports = { returnProxyurl };
