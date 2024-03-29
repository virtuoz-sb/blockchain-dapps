import * as mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  image: String,
  description: String,
  price: Number,
  created: {
    type: Date,
    default: Date.now,
  },
});

export default ProductSchema;
