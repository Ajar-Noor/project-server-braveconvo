const express = require("express");
const {
  findUser,
  getUsers,
  getDetails,
  getFriends,
  loginUser,
  registerUser,
  getRequests,
} = require("../Controllers/userController");
const { authentication } = require("../Middlewares/authentication");
const userRouter = express.Router();

userRouter.post(authentication);
userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);

userRouter.get("/get-users", () => {
  authentication, getUsers;
});
userRouter.get("/get-requests", () => {
  authentication, getRequests;
});
userRouter.get("/get-friends", () => {
  authentication, getFriends;
});
userRouter.get("/get-details", () => {
  authentication, getDetails;
});
userRouter.get("/get-finduser", () => {
  authentication, findUser;
});

module.exports = userRouter;
