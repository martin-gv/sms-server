// Focus the phone number element when the modal is opened
$("#newChatModal").on("shown.bs.modal", function () {
  $("#phoneNumber").trigger("focus");
});
