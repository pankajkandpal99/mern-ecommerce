const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
  quantity: { type: Number, required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },              // product have all details of the Product related. ye poore product ko refer karega.
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// virtual ka kaam hota hai virtual data field banana in database, hum neeche id ko virtual bana re hain kyuki humne client-side per id key use ki hai har jagah per na ki _id field... isme getter-setter functions hote hain, to ye hame batayega ki hame _id ko hi as a id ke roop me return karna hai kyuki client side per id key hi use ho ri hai... productSchema.set method se hi virtuals enable honge jab hum client side se product ko database se add karenge. jab bhi hum json me data ko bhejenge to ye apne aap virtual id create hokar add ho jayegi data ke response me... ye at the run time me hi calculate kiye jate hain aur database me save nahi hote hain, aur client ko bhejne me help hote hain...
const virtual = cartSchema.virtual("id");
virtual.get(function () {
  return this._id;
});

cartSchema.set("toJSON", {
  virtuals: true, // This option ensures that virtual properties are included in the JSON representation of the document. Since you defined a virtual property named "id," setting virtuals: true includes it in the JSON output.
  versionKey: false, // This option ensures that the version key (__v) is not included in the JSON representation. The version key is a field automatically added by Mongoose to manage document versions.
  transform: function (doc, ret) {
    // transform function define karta hai jo JSON output se "_id" field ko hata dega. ye _id filed ko hatata isliye hai kyuki hame response me 2 id mil rahi hain ek to mongoose ki khud ki create ki hui id jo ki _id ke roop me database me represent hoti hai aur dusra hame get function ke roop me milne wali id field hai jisme ki _id ki hi value hai. But hame client side per kewal 'id' field hi use karni hai na ki '_id' field, isliye hum use delete kar rahe hain. ye setter function tab kaam karta hai jab hamara data successfully database me add ho jane ke baad client ko res.json me wo data bhejna hota hai jo ki create kiya hua hai. The transform function is typically used to customize the JSON representation of a Mongoose document before it's sent to the client.
    delete ret._id;
  },
});

exports.Cart = mongoose.model("Cart", cartSchema);
