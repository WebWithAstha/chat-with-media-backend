const { Server } = require("socket.io");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { publisherClient } = require("./redisClient");

exports.connectSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("Authentication error");

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) throw new Error("User not found");

      user.socketId = socket.id;
      await user.save();

      socket.loggedUser = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  // Handle user connection
  io.on("connection", (socket) => {
    console.log("User connected");

    // Handle private message sending
    socket.on("send-private-msg", async (msgObj) => {
      try {
        const recipient = await User.findById(msgObj.sendTo);

        // Save the message to the database
        const msg = await Message.create({
          content: msgObj.content,
          media: msgObj.media,
          sentTo: [msgObj.sendTo],
          sender: socket.loggedUser._id,
        });

        // Set Redis key for media expiry
        if (msgObj.media && msgObj.media.length > 0) {
          msgObj.media.forEach((media) => {
            publisherClient.set(media.url, 'file', 'EX', 60);
          });
        }

        // Send the message to the recipient if they're online
        if (recipient && recipient.socketId) {
          socket.to(recipient.socketId).emit("receive-private-msg", {
            ...msgObj,
            sender: socket.loggedUser._id,
          });
        } else {
          console.log("Recipient is not online.");
        }
      } catch (error) {
        console.error("Error sending private message:", error.message);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
