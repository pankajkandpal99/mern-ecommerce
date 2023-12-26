const mongoose = require("mongoose");
const { Schema } = mongoose;

const brandSchema = new Schema({
  label: { type: String, required: true, unique: true },
  value: { type: String, required: true, unique: true },
});

// virtual ka kaam hota hai virtual data field banana in database, hum neeche id ko virtual bana re hain kyuki humne client-side per id key use ki hai har jagah per na ki _id field... isme getter-setter functions hote hain, to ye hame batayega ki hame _id ko hi as a id ke roop me return karna hai kyuki client side per id key hi use ho ri hai... productSchema.set method se hi virtuals enable honge jab hum client side se product ko database se add karenge. jab bhi hum json me data ko bhejenge to ye apne aap virtual id create hokar add ho jayegi data ke response me... ye at the run time me hi calculate kiye jate hain aur database me save nahi hote hain, aur client ko bhejne me help hote hain...
const virtual = brandSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
brandSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.Brand = mongoose.model("Brand", brandSchema);
