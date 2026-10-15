const mongoose = require("mongoose");

const artisanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    destination: { type: String, required: true },
    craft: { type: String, required: true },
    product: { type: String, required: true },
    description: String,
    price: String,
    image: String,
    contact: String,
    source: String,
    sourceUrl: String,
    verifiedArtisan: { type: Boolean, default: true },
    latitude: Number,
    longitude: Number,
    isLiveFetched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artisan", artisanSchema);