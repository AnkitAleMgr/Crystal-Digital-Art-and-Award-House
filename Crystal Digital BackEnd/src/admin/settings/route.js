import express from "express";
import { getSettings, updateSettings } from "./controller.js";

export const SettingRoute = express.Router();

SettingRoute.get("/", getSettings);
SettingRoute.put("/", updateSettings);