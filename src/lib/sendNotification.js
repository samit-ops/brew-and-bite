import admin from "./firebaseAdmin";

export const sendNotification = async (tokens, title, body) => {
  try {
    if (!tokens || tokens.length === 0) {
      console.log("No tokens provided");
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

console.log("Full response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Notification error:", error);
  }
};