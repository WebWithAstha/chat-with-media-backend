const { Server } = require("socket.io");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.connectSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token; // Expecting token in socket handshake auth
      if (!token) throw new Error("Authentication error");

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // Verify the JWT access token
      const user = await User.findById(decoded.userId); // Get user data by ID from token

      if (!user) throw new Error("User not found");

      user.socketId = socket.id; // Set the socket ID
      await user.save(); // Save the updated user document

      socket.loggedUser = user; // Set the loggedUser on the socket

      next(); // Call next to proceed to connection event
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("send-private-msg", async (msgObj) => {
      try {
        // Find the recipient's socketId using their user ID (msgObj.sendTo)
        const recipient = await User.findById(msgObj.sendTo);


        console.log(msgObj)
        // Create the message in the database with sender information
        const msg = await Message.create({
          content: msgObj.content,
          media: msgObj.media,
          sentTo: [msgObj.sendTo], // Store `sentTo` as an array with the recipient's ID
          sender: socket.loggedUser._id,
        });

        if (recipient && recipient.socketId) {
          // Send the message to the recipient's specific socket ID
          socket.to(recipient.socketId).emit("receive-private-msg", {
            ...msgObj,
            sender: socket.loggedUser._id,
          });
          console.log(
            `Message sent to user with socket ID: ${recipient.username}`
          );
        } else {
          console.log("Recipient is not online or socket ID not found.");
        }
      } catch (error) {
        console.error("Error sending private message:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
