import express from "express";
import { generateRecap } from "./recap";
import NodeCache from "node-cache";
import path from "path";

const app = express();
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/generate-recap", async (req, res) => {
  const dateString = req.query.date as string;
  const language = (req.query.language as string) || "en";
  if (!dateString) {
    return res.status(400).json({ error: "Date is required" });
  }

  const date = new Date(dateString);
  const cacheKey = `recap_${dateString}_${language}`;

  try {
    let recap = cache.get(cacheKey);
    if (recap === undefined) {
      const result = await generateRecap(date, language);
      recap = result.recap;
      cache.set(cacheKey, result.recap);
    }
    res.json({ recap, language });
  } catch (error) {
    console.error("Error generating recap:", error);
    res.status(500).json({ error: "Failed to generate recap" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
