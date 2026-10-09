import express from "express";
import {
  createQuote,
  deleteQuote,
  getQuotes,
  updateQuote,
} from "./controller.js";

export const QuoteRoute = express.Router();

// Admin-only CRUD. There is deliberately no public read of other people's
// quotes: GET /api/quotes is a 404, and e2e.mjs asserts it stays one.
//
// List is newest first; POST is the dashboard's own create (the public path is
// POST /api/quotes); PUT is a partial update that emails the customer only on a
// real status change; DELETE also destroys the quote's stored artwork.
QuoteRoute.get("/", getQuotes);
QuoteRoute.post("/", createQuote);
QuoteRoute.put("/:id", updateQuote);
QuoteRoute.delete("/:id", deleteQuote);