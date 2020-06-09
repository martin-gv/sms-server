// Get token from URL and decode
const urlParams = Qs.parse(location.search, { ignoreQueryPrefix: true });
const token = urlParams.token;
const decoded = jwt_decode(token);

// Extract info from token
const fromNumber = decoded.fromNumber;
const textMessage = decoded.textMessage;

// Inbound SMS
const fromNumberElement = document.getElementById("from-number");
const textMessageBodyElement = document.getElementById("text-message-body");

// Show last text message received
fromNumberElement.innerText = fromNumber;
textMessageBodyElement.innerText = textMessage;

console.log(textMessage, fromNumber);

// Form elements
const smsMessage = document.getElementById("sms-message");
const sendButton = document.getElementById("send-button");
const alertElement = document.getElementById("alert");

function handleFormSubmit(event) {
  event.preventDefault();
  console.log("Sending SMS...");

  disableForm();

  axios
    .post("/sms-reply", {
      sms: smsMessage.value,
      token: token,
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
