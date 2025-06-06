const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.js");

const users = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "user"
);

const cre = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "cre"
);

const database = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "database"
);

const userdb = admin.firestore(users);
const proxyConfig = admin.firestore(cre);
const databaseConfig = admin.firestore(database);

module.exports = { userdb, proxyConfig, databaseConfig };
