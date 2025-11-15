import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // serve dashboard

const apps = [
  { name: "Suite", url: "http://suite.darevel.local" },
  { name: "Auth", url: "http://auth.darevel.local" },
  { name: "Mail", url: "http://mail.darevel.local" },
  { name: "Drive", url: "http://drive.darevel.local" },
  { name: "Slides", url: "http://slides.darevel.local" },
  { name: "Excel", url: "http://excel.darevel.local" },
  { name: "Chat", url: "http://chat.darevel.local" },
  { name: "Notify", url: "http://notify.darevel.local" },
  { name: "Keycloak", url: "http://keycloak.darevel.local:8080" },
];

app.get("/health", async (req, res) => {
  const results = await Promise.all(
    apps.map(async (app) => {
      const start = Date.now();
      try {
        await fetch(app.url, { method: "HEAD", timeout: 3000 });
        const latency = Date.now() - start;
        return { ...app, status: "online", latency };
      } catch {
        return { ...app, status: "offline", latency: null };
      }
    })
  );
  res.json(results);
});

const PORT = 3010;
app.listen(PORT, () => {
  console.log(`✅ Darevel Status API live at http://localhost:${PORT}/health`);
});
