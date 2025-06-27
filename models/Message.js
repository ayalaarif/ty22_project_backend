const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
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
    timestamps: { createdAt: true, updatedAt: false }, // "heure" = createdAt
  }
);

module.exports = mongoose.model("Message", messageSchema);
