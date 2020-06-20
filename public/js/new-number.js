const numberListItems = document.getElementsByClassName("list-group-item");
const selectedNumberInput = document.getElementById("selectedNumber");
const submitButton = document.getElementById("submitButton");

// Add click event listener
for (let i = 0; i < numberListItems.length; i++) {
  numberListItems[i].addEventListener("click", function () {
    resetActiveClass();
    this.classList.add("active");

    // Set value of hidden form input
    selectedNumberInput.value = this.dataset.number;

    // Enable button
    submitButton.classList.remove("disabled");
    submitButton.removeAttribute("disabled");
  });
}

function resetActiveClass() {
  for (let i = 0; i < numberListItems.length; i++) {
    numberListItems[i].classList.remove("active");
  }
}
