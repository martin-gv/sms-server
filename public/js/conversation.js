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
