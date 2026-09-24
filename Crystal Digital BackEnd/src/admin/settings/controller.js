import { SettingModel } from "./model.js";

const mapDoc = (doc) => ({ id: doc._id, ...doc.toObject(), _id: undefined });

export const getSettings = async (req, res) => {
  try {
    let doc = await SettingModel.findOne();
    if (!doc) {
      doc = await SettingModel.create({});
    }
    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
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
    res.status(400).json({ status: false, message: error.message });
  }
};