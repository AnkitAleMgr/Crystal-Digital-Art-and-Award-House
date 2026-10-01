import { createOne, deleteOne, fail, getAll, isObjectId, mapDoc } from "../../utils/crud.js";
import { QuoteModel } from "./model.js";
import { notifyCustomerOfStatus } from "../../utils/notifications.js";

export const getQuotes = getAll(QuoteModel);
export const createQuote = createOne(QuoteModel);

// withImages so deleting a quote also destroys its Cloudinary artwork, and
// imageField because quotes name the column `attachmentPublicId`, not
// `imgPublicId` like products and gallery do.
export const deleteQuote = deleteOne(QuoteModel, {
  withImages: true,
  imageField: "attachmentPublicId",
});

// The generic crud updateOne() is not used for quotes. It cannot tell whether the
// status actually changed, and the customer email has to be sent from the stored
// document — the recipient must never be taken from the request body, or this
// endpoint becomes an open relay that will happily email anyone.
export const updateQuote = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(404).json({ status: false, message: "Not found" });
  }

  try {
    const before = await QuoteModel.findById(req.params.id).lean();

    if (!before) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    const doc = await QuoteModel.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    // Only a real transition notifies. Re-saving the same status (or editing any
    // other field) must not send a second email.
    if (req.body?.status && req.body.status !== before.status) {
      notifyCustomerOfStatus(doc);
    }

    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};
