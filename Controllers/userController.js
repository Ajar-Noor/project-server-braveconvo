const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const FriendRequest = require("../Models/friendRequest");

//json web token. here we are gonna give an user id to generate a token
const createToken = (_id) => {
  // here supposed to have a secret key and this secret key is supposed to be stored in an environment variable
  const jwtKey = process.env.JWT_SECRET_KEY;

  //create jwt token
  return jwt.sign({ _id }, jwtKey, { expiresIn: "3d" }); //expiresIn is optional which means that after how many time teh token expires
};

// logic for register user
const registerUser = async (req, res, next) => {
  //here we are using try and catch to detect an error
  try {
    //request data from frontend
    const { name, email, password } = req.body;

    console.log({ name, email, password });

    //here we will check if the user already exist with the help of email
    let user = await userModel.findOne({ email });

    //send a message to user if user already exit json is better than send to send a message
    //  '400' means that there is a user error, incoming data have an issue
    if (user)
      return res.status(400).json("User with the given email already exist");

    //validation, backend validation is more important than frontend validation
    if (!name || !password || !email)
      return res.status(400).json("All fields are required");

    // validate valid email and strong pawword will use validator library

    if (!validator.isEmail(email))
      return res.status(400).json("Email must be valid");

    //one small case letter, one upper case letter, one number and one special symbol
    if (!validator.isStrongPassword(password))
      return res.status(400).json("Password must be strong");

    //we have to save our user to the database. it's a user document
    user = new userModel({ name, email, password });

    //hash password it would be a random string it is usually of 10 characters but but can enter any number of charater
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    //after hashing password we have to save our user to the database
    await user.save();

    //after saving data to database the database we will create token
    const token = createToken(user._id);

    // now we send data to the client. 200 means oky the data successful. we are not returning password bcz it's secure
    res.status(200).json({ _id: user._id, name, email, token });
  } catch (error) {
    console.log(error);
    // 500=>server error
    res.status(500).json(error.message);
  }
};

// login user
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user = await userModel.findOne({ email });

    if (!user) return res.status(400).json("invalid email or password");

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json("invalid email or password");

    const token = createToken(user._id);
    res.status(200).json({ _id: user._id, name: user.name, email, token });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
  next()
};

// find one user
const findUser = async (req, res, next) => {
  //we are getting params and userId from URL
  const userId = req.params.userId;
  try {
    const user = await userModel.findById(userId).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

// for getting collection of users
const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.find(); //return a array of users
    res.status(200).json(users);
  } catch (error) {
    consol.log(error);
    res.status(500).json(error.message);
  }
};

const getDetails = async (req, res, next) => {
  //we are getting params and userId from URL
  const userId = req.decodedToken._id;
  try {
    const user = await userModel.findById(userId).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

// 👉 exports
module.exports = { registerUser, loginUser, findUser, getUsers, getDetails };

// get users for  friend request
exports.getUsers = async (req, res, next) => {
  const all_users = await userModel
    .find({
      verified: true,
    })
    .select("firstName _id");

  const this_user = req.user;

  const remaining_users = all_users.filter(
    (user) =>
      !this_user.friends.includes(user._id) &&
      user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
}

// getRequests
exports.getRequests = async (req, res, next) => {
  const requests = await FriendRequest.find({ recipient: req.user._id })
    .populate("sender")
    .select("_id firstName lastName");

  res.status(200).json({
    status: "success",
    data: requests,
    message: "Requests found successfully!",
  });
};

// get Fiends
exports.getFriends = async (req, res, next) => {
  const this_user = await User.findById(req, user._id).populate(
    "friends",
    "_id firstName"
  );
  res.status(200).json({
    status: "success",
    data: this_user.friends,
    message: "Friends found successfully!",
  });
}
