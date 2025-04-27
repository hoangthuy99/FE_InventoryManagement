require("dotenv").config();
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = "token.json";

// Khởi tạo OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
  process.env.REACT_APP_GOOGLE_CLIENT_ID,
  process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
  process.env.REACT_APP_REDIRECT_URI
);

// Check token có tồn tại không
try {
  const token = fs.readFileSync(TOKEN_PATH, "utf8");
  oAuth2Client.setCredentials(JSON.parse(token));
  console.log("Token loaded successfully! ✅");
} catch (error) {
  console.log("No token found, please authorize the app.");
  getAccessToken();
}

// Hàm lấy access token
function getAccessToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("Error retrieving access token", err);
        return;
      }
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log("Token stored to", TOKEN_PATH);
    });
  });
}
