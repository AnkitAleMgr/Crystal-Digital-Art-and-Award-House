const mapDoc = (doc) => ({ id: doc._id, ...doc.toObject(), _id: undefined });

export const getAll = (Model) => async (req, res) => {
  try {
    const items = await Model.find().sort({ createdAt: -1 });
    res.json({ status: true, data: items.map(mapDoc) });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const createOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

export const updateOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    res.json({ status: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};