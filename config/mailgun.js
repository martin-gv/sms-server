const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;

const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

module.exports = mailgun;
