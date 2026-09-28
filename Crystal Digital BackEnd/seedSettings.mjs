// One-shot: put the real business details into the single settings doc.
//
// Unlike migrate.mjs this is NOT destructive by default. Settings are edited by
// hand in the admin panel, so a rerun must never clobber those edits — it only
// fills the fields that are still empty. Pass --force to overwrite everything.
//
//   npm run seed:settings            fill blanks only
//   npm run seed:settings -- --force overwrite every field

import "dotenv/config";
import mongoose from "mongoose";

import { SettingModel } from "./src/admin/settings/model.js";
import { SEED_SETTINGS } from "./src/seed/settings.mjs";

const FORCE = process.argv.includes("--force");

await mongoose.connect(process.env.MONGO_DB_URI, { serverSelectionTimeoutMS: 15000 });

let doc = await SettingModel.findOne();
const created = !doc;

if (!doc) {
  doc = new SettingModel();
}

const filled = [];
const kept = [];

for (const [key, value] of Object.entries(SEED_SETTINGS)) {
  const current = String(doc[key] ?? "").trim();

  if (FORCE || current === "") {
    doc[key] = value;
    filled.push(key);
  } else {
    kept.push(key);
  }
}

await doc.save();

console.log(`${created ? "Created" : "Updated"} the settings document.`);
console.log(`  filled: ${filled.length ? filled.join(", ") : "nothing"}`);
if (!FORCE && kept.length) {
  console.log(`  kept existing value: ${kept.join(", ")}`);
  console.log("  (re-run with --force to overwrite those too)");
}

console.log("\nVerify with: curl -s http://localhost:3000/api/settings");

await mongoose.disconnect();
