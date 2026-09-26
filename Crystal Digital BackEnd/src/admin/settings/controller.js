import { SettingModel } from "./model.js";
import { fail, mapDoc } from "../../utils/crud.js";

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

export const updateSettings = async (req, res) => {
  try {
    const doc = await SettingModel.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};