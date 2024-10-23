import express from "express";
import cors from "cors";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing CLIENT_ID or CLIENT_SECRET in environment variables");
}

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.get("/getAccessToken", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Missing code parameter" });
    }

    const auth = createOAuthAppAuth({
      clientType: "oauth-app",
      clientId,
      clientSecret,
    });

    const { token } = await auth({
      type: "token",
      code,
    });

    res.json({ token });
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).json({ error: "Failed to get access token" });
  }
});

app.get("/getUserData", async (req, res) => {
  try {
    const authorization = req.get("Authorization");

    if (!authorization) {
      return res.status(400).json({ error: "Missing Authorization header" });
    }

    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const user = await response.json();
    res.json(user);
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});