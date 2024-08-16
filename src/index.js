// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// const PORT = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// const rooms = {};

// io.on("connection", (socket) => {
//   socket.on("join-room", (roomId, userId) => {
//     console.log("join-room", roomId, userId);

//     socket.join(roomId);
//     socket.to(roomId).emit("user-connected", userId);

//     socket.on("disconnect", () => {
//       socket.to(roomId).emit("user-disconnected", userId);
//       console.log("user disconnected", userId);
//     });
//   });
// });

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//new code
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
    console.log("rooms", rooms);
    console.log("join-room", roomId, userId);

    // Add the user to the room
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(userId);

    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    // Log the list of users in the room
    console.log(`Users in room ${roomId}:`, rooms[roomId]);

    socket.on("disconnect", () => {
      // Remove the user from the room
      rooms[roomId] = rooms[roomId].filter((id) => id !== userId);
      socket.to(roomId).emit("user-disconnected", userId);

      // Log the updated list of users in the room
      console.log(`User disconnected: ${userId}`);
      console.log(`Users remaining in room ${roomId}:`, rooms[roomId]);

      // Clean up the room if empty
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
