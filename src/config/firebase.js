const admin = require("firebase-admin");

const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_PATH; // Firebase service account path
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET; // Firebase storage bucket URL

admin.initializeApp({
   credential: admin.credential.cert(require(serviceAccountFile)),
   storageBucket: storageBucket,
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
