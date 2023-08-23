const { Server } = require("socket.io");
const io = new Server(8000, {
  cors: true,
});

const emailtosocketMap = new Map();
const sockettoemailMap = new Map();
io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);
  socket.on("room:join", (data) => {
    const { email_address, roomID } = data;
    emailtosocketMap.set(email_address, socket.id);
    sockettoemailMap.set(socket.id, email_address);
    //
    io.to(roomID).emit("user:joined", { email_address, id: socket.id });
    socket.join(roomID);
    io.to(socket.id).emit("room:join", data);
    console.log(data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });
  socket.on("peer:nego:needed", ({ offer, to }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });
  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
