import admin from "firebase-admin";
import env from "./env";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.firebase_project_id,
    privateKey: env.firebase_private_key,
    clientEmail: env.firebase_client_email
  })
});

export default admin;
