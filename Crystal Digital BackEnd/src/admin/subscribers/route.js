import express from "express";
import { deleteSubscriber, getSubscribers } from "./controller.js";

export const SubscriberRoute = express.Router();

SubscriberRoute.get("/", getSubscribers);
SubscriberRoute.delete("/:id", deleteSubscriber);
