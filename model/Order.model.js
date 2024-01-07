const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    items: { type: [Schema.Types.Mixed], required: true },
    totalAmount: { type: Number },
    totalItems: { type: Number },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    //TODO: we can add enum types --> means only 2 hi paymentMethod me aayenge 'cash' and 'card'...
    paymentMethod: { type: String, default: "cash", required: true },
    paymentStatus: { type: "String", default: "pending" },
    selectedAddress: { type: Schema.Types.Mixed, required: true },
    status: { type: String, default: "pending" },
    deleted: { type: Boolean, deafult: false },
  },
  {
    timestamps: true,
  }
);

const virtual = orderSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
orderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.Order = mongoose.model("Order", orderSchema);
