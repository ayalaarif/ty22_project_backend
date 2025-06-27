const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    contenu: {
      type: String,
      required: true,
      trim: true,
    },
    auteur: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destinataire: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, 
  }
);

module.exports = mongoose.model("Review", reviewSchema);
