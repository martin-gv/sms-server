const db = require("../config/database");
const twilio = require("../config/twilio");

const User = db.models.User;

//
// ─── HANDLE INFUSIONSOFT CAMPAIGN BUILDER HTTP POST REQUESTS ────────────────────
//

exports.handleInfusionsoftHttpPost = async (req, res, next) => {
  try {
    const accountKey = req.params.accountKey;
    const body = req.body.text;
    const to = req.body.phone;

    // Look up the account's registered SMS number
    const user = await User.findOne({ where: { accountKey: accountKey } });

    // If there's no user, return an error
    if (!user) {
      if (process.env.NODE_ENV === "production") {
        res.status(500).end();
        return;
      } else {
        res.status(500).json({ message: "Account key is not valid" });
        return;
      }
    }

    const from = user.smsNumber;

    twilio.messages
      .create({
        body: body,
        from: from,
        to: to,
      })
      .then((message) => {
        if (process.env.NODE_ENV === "production") {
          res.status(200);
        } else {
          res.status(200).json(message);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV === "production") {
          res.status(500).end();
        } else {
          res.status(500).json(error);
        }
      });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      res.status(500).end();
    } else {
      res.status(500).json(error);
    }
  }
};
