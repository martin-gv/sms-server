//
// ─── SCROLL TO THE BOTTOM WHEN THE PAGE LOADS ────────────────────────────────────
//

if ("scrollRestoration" in history) {
  // Back off, browser, I got this...
  history.scrollRestoration = "manual";
}

window.scrollTo(0, document.body.scrollHeight);

//
// ─── MARK CONVERSATION AS READ WHEN THE PAGE LOADS ──────────────────────────────
//

markConversationAsRead();

//
// ─── EXPAND TEXT AREA FOR MULTIPLE LINES ────────────────────────────────────────
//

// Adapted from StackOverflow:
// https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize

const textArea = document.getElementById("messageContent");

textArea.setAttribute(
  "style",
  "height:" + textArea.scrollHeight + "px;overflow-y:hidden"
);

textArea.addEventListener("input", onTextAreaInput, false);

function onTextAreaInput() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
}

//
// ─── PRESS ENTER KEY TO SEND TEXT MESSAGE ───────────────────────────────────────
//

textArea.addEventListener("keypress", textAreaPress);

const sendMessageButton = document.getElementById("send-message-button");
const sendMessageForm = document.getElementById("sendMessageForm");

function textAreaPress(event) {
  if (event.keyCode == 13 && !event.shiftKey) {
    // Stops ENTER key press from creating a new line
    event.preventDefault();
    disableFormElements();
    submitSendMessageForm();
  }
}

function submitSendMessageForm() {
  sendMessageForm.submit(); //submits the form.
}

function disableFormElements() {
  // readonly so data is sent along with POST
  textArea.setAttribute("readonly", "true");
  sendMessageButton.setAttribute("disabled", "true");
}

//
// ─── SOCKET.IO ──────────────────────────────────────────────────────────────────
//

// When the page loads connect to the server via socket.io
const socket = io();

//
// ─── SOCKET.IO - CONNECT TO THE SERVER ──────────────────────────────────────────
//

// After connecting to the server, the client will join a 'room'
// that corresponds to the current conversation being viewed. The client
// is then able to receive inbound messages and add them to the page.

socket.on("connect", () => {
  // Get the conversation id from the data attribute. The value
  // is set server-side when building the page from the EJS template
  const conversationId = document.getElementById("custom-data").dataset
    .conversationId;

  // Send the conversation id to the server to subscribe to incoming messages
  socket.emit("conversation subscribe", { conversationId: conversationId });
});

//
// ─── SOCKET.IO - HANDLE INBOUND MESSAGES ────────────────────────────────────────
//

socket.on("inbound message", ({ message }) => {
  addNewMessageToPage(message);
  markConversationAsRead();
});

function addNewMessageToPage(message) {
  // Create timestamp element
  const timestampSpan = document.createElement("span");
  timestampSpan.setAttribute("class", "text-muted timestamp inbound");
  timestampSpan.innerText = moment(message.createdAt).format(
    "ddd, MMM  Do • h:mm A"
  );

  // Create message bubble element
  const messageSpan = document.createElement("span");
  messageSpan.setAttribute("class", "mb-3 message-bubble inbound");
  messageSpan.innerText = message.messageContent;

  // Add timestamp and message bubble to conversation list
  const messagesList = document.getElementById("messages-list");
  messagesList.appendChild(timestampSpan);
  messagesList.appendChild(messageSpan);

  // Scroll to the bottom of the window so that the newest message is visible. Safari does not
  // have support for the smooth scroll behavior. The smoothscroll polyfill adds this functionality.
  window.scrollTo({
    top: document.body.scrollHeight,
    left: 0,
    behavior: "smooth",
  });
}

//
// ─── SOCKET.IO - HANDLE ERRORS ──────────────────────────────────────────────────
//

socket.on("conversation error", (data) => {
  console.log(data.message);
});

//
// ─── FOCUS INPUT WHEN THE EDIT CHAT MODAL OPENS ─────────────────────────────────
//

// Focus the phone number element when the modal is opened
$("#editContactNameModal").on("shown.bs.modal", function () {
  $("#firstName").trigger("focus");
});

//
// ─── MARK CONVERSATION AS READ ──────────────────────────────────────────────────
//

function markConversationAsRead() {
  // Get the conversation id from the data attribute. The value
  // is set server-side when building the page from the EJS template
  const conversationId = document.getElementById("custom-data").dataset
    .conversationId;

  axios
    .post("/conversations/" + conversationId + "/mark-read")
    .catch(function (error) {
      console.log(error);
    });
}
