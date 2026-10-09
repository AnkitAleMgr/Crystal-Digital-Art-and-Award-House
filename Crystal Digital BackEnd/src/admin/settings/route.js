import express from "express";
import { getSettings, updateSettings } from "./controller.js";

export const SettingRoute = express.Router();

// Single-document settings: no :id. The controller targets the one row (and
// creates it on first read, so the admin form always has something to save to);
// PUT is a partial upsert, so omitted fields are left as they are.
SettingRoute.get("/", getSettings);
SettingRoute.put("/", updateSettings);