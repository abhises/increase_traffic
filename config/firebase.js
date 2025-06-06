const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.js");

const app = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "config"
);

const db = admin.firestore(app);

module.exports = { db };
