import { createOne, deleteOne, getAll, updateOne } from "../../utils/crud.js";
import { TestimonialModel } from "./model.js";

// Plain factory CRUD: no image column, so no { withImages } option is needed.
export const getTestimonials = getAll(TestimonialModel);
export const createTestimonial = createOne(TestimonialModel);
export const updateTestimonial = updateOne(TestimonialModel);
export const deleteTestimonial = deleteOne(TestimonialModel);