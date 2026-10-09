import express from "express";
import { deleteSubscriber, getSubscribers } from "./controller.js";

export const SubscriberRoute = express.Router();

// Read + delete only, on purpose: rows are created by the public subscribe form
// and their status only ever changes through the links in their own emails.
// There is no POST/PUT here for the same reason — see subscribers/controller.js.
SubscriberRoute.get("/", getSubscribers);
SubscriberRoute.delete("/:id", deleteSubscriber);
