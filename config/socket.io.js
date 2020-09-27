const db = require("./database");
const sessionConfig = require("./session");

const Conversation = db.models.Conversation;

//
// ─── MAIN SOCKET.IO CONFIG ──────────────────────────────────────────────────────
//

module.exports = (io) => {
  io.use((socket, next) => {
    // socket.io  middleware takes two arguments, so Express middleware can't be passed to
    // io.use directly since it requires three arguments. Instead, the socket.io middleware
    // arguments are passed in to the Express middleware function (sessionConfig, in this case):
    // * socket.handshake, like the req object, has a headers.cookie property
    // * sessionConfig normally checks req.headers.cookie and populates req.session
    // * in this case, sessionConfig checks socket.handshake.headers.cookie and populates socket.handshake.session
    sessionConfig(socket.handshake, {}, next);
  });

  // socket.io connections are established when the client visit the single conversation page.
  io.on("connect", (socket) => {
    // This event will subscribe the client to a room using the conversation id as the name of the room
    socket.on("conversation subscribe", async (data) => {
      // The session property is established by socket.io middleware. If the user is already
      // logged in, the session saved in the database will include a passport.user property
      const session = socket.handshake.session;

      // Check the session. If the user isn't logged in, send and error.
      if (!session.passport || !session.passport.user) {
        socket.emit("conversation error", {
          message: "Error: not authenticated",
        });
        return;
      }

      // Find the conversation in the database
      const conversation = await Conversation.findByPk(data.conversationId);

      // Check the owner of the conversation. If it isn't the current user, send an error.
      // passport.user includes the serialized user, which in this case is an id
      if (session.passport.user !== conversation.userId) {
        socket.emit("conversation error", {
          message: "Error: not authorized for requested conversation",
        });
        return;
      }

      // Join the room if none of the error checks above were triggered
      socket.join(data.conversationId);
    });
  });
};
