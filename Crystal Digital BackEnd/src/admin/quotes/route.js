import express from "express";
import {
  createQuote,
  deleteQuote,
  getQuotes,
  updateQuote,
} from "./controller.js";

export const QuoteRoute = express.Router();

QuoteRoute.get("/", getQuotes);
QuoteRoute.post("/", createQuote);
QuoteRoute.put("/:id", updateQuote);
QuoteRoute.delete("/:id", deleteQuote);