require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io"); 

//connect to our mongodb database
const uri = process.env.ATLAS_URI; //bcz i require and configure dotenv file that's why i am able to access uri
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true, //ensure we are using new mongodb engine
  })
  .then(() => console.log("mongodb connection established"))
  .catch((error) => console.log("mongodb connection failed", error.message));

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

const http = require("http");
const userModel = require("./Models/userModel");
const FriendRequest = require("./Models/friendRequest");
const userRouter = require("./Routes/userRoutes");
const server = http.createServer(app);

// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use("/api/user", userRouter);
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("welcome to my chat app api");
});

app.listen(port, (req, res) => {
  console.log(`server is running... ${port}`);
});

// Listen for when the client connects via socket.io-client
io.on("connection", async (socket) => {
  console.log(JSON.stringify(socket.handshake.query));
  const user_id = socket.handshake.query["user_id"];

  console.log(`User connected ${socket.id}`);

  if (user_id != null && Boolean(user_id)) {
    try {
   await  userModel.findByIdAndUpdate(user_id, {
        socket_id: socket.id,
        status: "Online",
      });
    } catch (e) {
      console.log(e);
    }
  }
   // socket event listeners
   socket.on("friend_request", async (data) => {
    const to = await userModel.findById(data.to).select("socket_id");
    const from = await userModel.findById(data.from).select("socket_id");

    // create a friend request
    await FriendRequest.create({
      sender: data.from,
      recipient: data.to,
    });
       // emit event request received to recipient
       io.to(to?.socket_id).emit("new_friend_request", {
        message: "New friend request received",
      });
      io.to(from?.socket_id).emit("request_sent", {
        message: "Request Sent successfully!",
      });
    });

    socket.on("accept_request", async (data) => {
      // accept friend request => add ref of each other in friends array
      console.log(data);
      const request_doc = await FriendRequest.findById(data.request_id);
  
      console.log(request_doc);
  
      //request_id
      const sender = await User.findById(request_doc.sender);
      const receiver = await User.findById(request_doc.recipient);
  
      // update friends list
      sender.friends.push(request_doc.recipient);
      receiver.friends.push(request_doc.sender);
  
      // save records
      await receiver.save({ new: true, validateModifiedOnly: true });
      await sender.save({ new: true, validateModifiedOnly: true });
  
      await FriendRequest.findByIdAndDelete(data.request_id);
  
      // delete this request doc
      await FriendRequest.findByIdAndDelete(data.request_id)
      // emit event to both of them
  
      // emit event request accepted to both
      io.to(sender?.socket_id).emit("request_accepted", {
        message: "Friend Request Accepted",
      });
      io.to(receiver?.socket_id).emit("request_accepted", {
        message: "Friend Request Accepted",
      });
    });

    socket.on("end",function(){
console.log('closing connection')
socket.disconnect(0);
    })
  });

const limiter = rateLimit({
  Max: 3000,
  windowMs: 60 * 60 * 1000, // in one hour
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/tawk", limiter)
