import { createOne, deleteOne, getAll, updateOne } from "../../utils/crud.js";
import { QuoteModel } from "./model.js";

export const getQuotes = getAll(QuoteModel);
export const createQuote = createOne(QuoteModel);
export const updateQuote = updateOne(QuoteModel);
export const deleteQuote = deleteOne(QuoteModel);