const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  socket_id: {
    type: String,
  },
  friends: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

// //compare password in db

// userSchema.methods.correctPassword=async function(
//     candidatePassword, //plain password
//     userPassword, //encrypted password
//     ){
//         // use bcypt to decrypt and compare password
//     return await bcrypt.compare(candidatePassword,userPassword)
// }

const userModel = mongoose.model("User", userSchema); //created a collection named 'user' and put uerSchema into it

module.exports = userModel; //we exported 'useModel' so that we can use it inside another files
