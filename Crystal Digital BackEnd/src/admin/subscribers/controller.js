import { deleteOne, getAll } from "../../utils/crud.js";
import { SubscriberModel } from "./model.js";

// Read and delete only — deliberately no create/update. Subscribers arrive
// through POST /api/subscribers and change status by clicking the link in their
// own email. An admin-create endpoint would let anyone with a token put an
// address on the list that never opted in, and an admin-update endpoint would
// hand out a second, quieter way around the confirmation.
export const getSubscribers = getAll(SubscriberModel);
export const deleteSubscriber = deleteOne(SubscriberModel);
