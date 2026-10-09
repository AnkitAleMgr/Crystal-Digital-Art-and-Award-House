import { SettingModel } from "./model.js";
import { fail, mapDoc } from "../../utils/crud.js";

// GET /admin/settings — single document. Created with defaults on first read so
// the admin form always has a row to populate and PUT can upsert against it.
export const getSettings = async (req, res) => {
  try {
    let doc = await SettingModel.findOne();
    if (!doc) {
      doc = await SettingModel.create({});
    }
    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error);
  }
};

// PUT /admin/settings — partial upsert: only the keys present in the body are
// written, so a save that omits a field cannot blank it out.
export const updateSettings = async (req, res) => {
  try {
    const doc = await SettingModel.findOneAndUpdate({}, req.body, {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
    });
    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};