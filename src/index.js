const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const rooms = {};

io.on("connection", (socket) => {
  console.log(socket);
  console.log("New client connected");
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);

    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
      console.log("user disconnected", userId);
    });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
