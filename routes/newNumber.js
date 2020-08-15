const express = require("express");
const router = express.Router();

const controller = require("../controllers/newNumber");
const userHasNoNumber = require("../middleware/userHasNoNumber");

// These routes are only available if the user has no
// number registered to the account
router.use(userHasNoNumber);

router.get("/", controller.getNewNumberPage);
router.post("/", controller.handleNewNumberForm);

module.exports = router;
