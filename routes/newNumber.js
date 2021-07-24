const express = require("express");
const router = express.Router();

const controller = require("../controllers/newNumber");
const userHasNoNumber = require("../middleware/userHasNoNumber");
const hasValidSubscription = require("../middleware/hasValidSubscription");

// These routes should only be available to clients with a valid subscription
// (whether ACTIVE or PAST DUE), and who don't have a number.
router.use(hasValidSubscription, userHasNoNumber);

router.get("/", controller.getNewNumberPage);
router.post("/", controller.handleNewNumberForm);

module.exports = router;
