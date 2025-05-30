const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  dateEdition: {
    type: Date,
    default: Date.now
  },
    image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  }
});

module.exports = mongoose.model("Post", postSchema);
