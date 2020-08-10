// Make list of messages scrollable
const scrollableElement = document.getElementById("scrollable-messages-area");
scrollableElement.scrollTop = scrollableElement.scrollHeight;

// Expand text area for multiple lines.
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

  // Reset size of message list
  scrollableElement.setAttribute(
    "style",
    // Calculations for the height of the scrollable messages list:
    // 100vh             -> Set height to viewport height
    // 215px             -> Adjust for the card footer's height
    // this.style.height -> Adjust for the textarea's new size ('px' doesn't need to be specified)
    // 36px              -> Adjust for the textarea's initial height when it's 1 row high. Otherwise
    //                      this.style.height would shrink it when typing in the first character
    ` height: calc(100vh - 215px - ${this.style.height} + 36px);
      overflow-y: auto;
    `
  );
}

/**
 * Pressing ENTER inside the textarea will send the text message.
 * It will also disable the form while the server responds.
 */

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
