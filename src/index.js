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
  socket.on("join-room", (roomId, userId) => {
    console.log("join-room", roomId, userId);

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = new Set();
    }

    // Add user to room
    rooms[roomId].add(userId);

    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    // Log all users in the room
    console.log(`Users in room ${roomId}:`, Array.from(rooms[roomId]));

    // Emit updated user list to all clients in the room
    io.to(roomId).emit("room-users", Array.from(rooms[roomId]));

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
      console.log("user disconnected", userId);

      // Remove user from room
      rooms[roomId].delete(userId);

      // Log updated user list
      console.log(
        `Users in room ${roomId} after disconnect:`,
        Array.from(rooms[roomId])
      );

      // Emit updated user list to all clients in the room
      io.to(roomId).emit("room-users", Array.from(rooms[roomId]));

      // Clean up empty rooms
      if (rooms[roomId].size === 0) {
        delete rooms[roomId];
      }
    });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
