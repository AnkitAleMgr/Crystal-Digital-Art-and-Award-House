import "dotenv/config";
import mongoose from "mongoose";
import { DB_CONNECT } from "./src/utils/db.js";
import { ProductModel } from "./src/admin/products/model.js";

// One-shot: turns the old `customizable: [String]` marketing tags into the
// structured `customizationFields` the quote form now collects answers for.
//
// Each old string becomes { label, required: false, maxLength: 300 }. Optional,
// not required, on purpose — those strings were written as "we can do this for
// you" bullets ("Company or school logo"), so making them mandatory would block
// every quote on an existing product until the admin has reviewed each one. The
// admin flips a field to Required in the product modal once they have looked at
// it; that is the decision, not this script's.
//
// Idempotent: `customizable` is unset on the way through, and a document that
// already has customizationFields is left completely alone.
await DB_CONNECT();

const docs = await ProductModel.find({
  customizable: { $exists: true, $ne: [] },
}).lean();

let converted = 0;
let skipped = 0;

for (const doc of docs) {
  if ((doc.customizationFields ?? []).length > 0) {
    skipped++;
    continue;
  }

  const labels = (doc.customizable ?? [])
    .map((value) => String(value).trim())
    .filter(Boolean)
    // Case-insensitive de-dupe, because a repeated label would render twice in
    // the quote form and the Map the server builds would silently collapse them.
    .filter((label, i, all) => all.findIndex((l) => l.toLowerCase() === label.toLowerCase()) === i);

  await ProductModel.updateOne(
    { _id: doc._id },
    {
      $set: {
        customizationFields: labels.map((label) => ({ label, required: false, maxLength: 300 })),
      },
      $unset: { customizable: "" },
    }
  );

  converted++;
  console.log(`  ${doc.name}: ${labels.length} field(s)`);
}

console.log(
  `\nConverted ${converted} product(s). ${skipped} already had customizationFields and were left alone.`
);

const total = await ProductModel.aggregate([
  { $unwind: "$customizationFields" },
  { $group: { _id: null, fields: { $sum: 1 } } },
]);

console.log(`Products now carry ${total[0]?.fields ?? 0} customization field(s) in total.`);
console.log("They are all optional — review each product in the admin and tick Required where you want it enforced.");

await mongoose.disconnect();