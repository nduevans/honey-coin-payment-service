import "dotenv/config";
import express from "express";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log(`[app] listening on port ${PORT}`);
});
