const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    imdbID: { type: String, required: true },
    email: { type: String, required: true },
    linkId: { type: String, require: true },
    content: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
