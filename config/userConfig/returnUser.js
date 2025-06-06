const { userdb } = require("./firebase");

async function returnUsers() {
  try {
    // Fetch all documents from the 'users' collection
    const snapshot = await userdb.collection("users").get();

    // Check if the collection has documents
    if (snapshot.empty) {
      console.log("No documents found in the users collection!");
      return null;
    }

    // Iterate through the documents in the QuerySnapshot
    const users = [];
    snapshot.forEach((doc) => {
      console.log(`Found doc with id ${doc.id} => `, doc.data()); // Log each document's data
      users.push({ id: doc.id, ...doc.data() }); // Push each user's data and id to the array
    });

    console.log("Users:", users);
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    return null;
  }
}
async function returnUserById(uid) {
  try {
    // Fetch the document with the given user ID from the 'users' collection
    const userDoc = await userdb.collection("users").doc(uid).get();

    // Check if the document exists
    if (!userDoc.exists) {
      console.log(`No user found with ID: ${uid}`);
      return null;
    }

    // Return the user document data
    const userData = { id: userDoc.id, ...userDoc.data() };
    // console.log("User found:", userData);
    return userData;
  } catch (error) {
    console.error(`Error getting user with ID ${uid}:`, error);
    return null;
  }
}
async function returnUserByIdAndUpdateExecutions(uid) {
  try {
    // Fetch the document with the given user ID from the 'users' collection
    const userDoc = await userdb.collection("users").doc(uid).get();

    // Check if the document exists
    if (!userDoc.exists) {
      console.log(`No user found with ID: ${uid}`);
      return null;
    }

    // Get the user data
    const userData = { id: userDoc.id, ...userDoc.data() };
    console.log("userData:", userData);

    // Check if toolAccess and increaseTraffic and executionsUsed fields exist
    if (
      !userData.toolAccess ||
      !userData.toolAccess.increaseTraffic ||
      userData.toolAccess.increaseTraffic.executionsUsed === undefined
    ) {
      console.log(
        `The toolAccess or increaseTraffic or executionsUsed field does not exist for user: ${uid}`
      );
      return null;
    }

    // Increment the executionsUsed field by 1
    const newExecutionsUsed =
      userData.toolAccess.increaseTraffic.executionsUsed + 1;

    // Update the executionsUsed field in the database
    await userdb.collection("users").doc(uid).update({
      "toolAccess.increaseTraffic.executionsUsed": newExecutionsUsed,
    });

    console.log(`Updated executionsUsed for user ${uid}: ${newExecutionsUsed}`);

    // Return the updated user data
    const updatedUserDoc = await userdb.collection("users").doc(uid).get();
    const updatedUserData = { id: updatedUserDoc.id, ...updatedUserDoc.data() };

    return updatedUserData;
  } catch (error) {
    console.error(
      `Error updating executionsUsed for user with ID ${uid}:`,
      error
    );
    return null;
  }
}

module.exports = {
  returnUsers,
  returnUserById,
  returnUserByIdAndUpdateExecutions,
};
