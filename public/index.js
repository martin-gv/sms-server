// Get phone number from URL
const urlParams = Qs.parse(location.search, { ignoreQueryPrefix: true });
const phoneNumber = urlParams.phoneNumber;

// Form elements
const smsMessage = document.getElementById("sms-message");
const sendButton = document.getElementById("send-button");
const alertElement = document.getElementById("alert");

function handleFormSubmit(event) {
  event.preventDefault();
  console.log("Sending SMS...");

  disableForm();

  axios
    .post("/sms", {
      to: phoneNumber,
      sms: smsMessage.value,
    })
    .then(function (response) {
      console.log(response);
      showSuccessMessage();
    })
    .catch(function (error) {
      console.log(error);
      showErrorMessage(error.message);
    });
}

function disableForm() {
  smsMessage.setAttribute("disabled", "true");
  sendButton.setAttribute("disabled", "true");
}

function showSuccessMessage() {
  // Bootstrap alert
  alertElement.className = "alert alert-success";
  alertElement.setAttribute("role", "alert");
  alertElement.innerHTML = "Message successfully sent!";
}

function showErrorMessage(errorMessage) {
  // Bootstrap alert
  alertElement.className = "alert alert-danger";
  alertElement.setAttribute("role", "alert");
  alertElement.innerHTML = "Oops! There was an error";
  alertElement.innerHTML = `Error: ${errorMessage}`;
}
