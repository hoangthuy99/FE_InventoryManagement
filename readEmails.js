require("dotenv").config();
const fs = require("fs");
const { google } = require("googleapis");

const TOKEN_PATH = "token.json";

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const token = fs.readFileSync(TOKEN_PATH);
oAuth2Client.setCredentials(JSON.parse(token));

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

async function listMessages() {
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 5,
  });

  const messages = res.data.messages;
  if (!messages || messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  console.log("Messages:");
  for (const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });

    const subjectHeader = msg.data.payload.headers.find(h => h.name === "Subject");
    console.log(`- Subject: ${subjectHeader ? subjectHeader.value : "No subject"}`);
  }
}

listMessages().catch(console.error);
