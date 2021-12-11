const BACKEND_BASE_URL = "http://localhost:5000/api";
// const BACKEND_BASE_URL = "https://openchaindex-24vrnd2yra-uc.a.run.app/api";
const GOOGLE_LOGIN_CLIENT_ID = '533897933750-s85rovfjr2p6tg1pes1qdi89l8vo829g.apps.googleusercontent.com';
const RECAPTCHA_SITE_KEY = "6LdoC28dAAAAACQ6Wbl7YPpOZVGHr9H-YQBKUkAA";
const BATCHED_VALIDATION = 0; // Validation mode
const INDIVIDUAL_VALIDATION = 1; // Validation mode
const MAX_TIMEOUT = 30000;

const NOTIFY_WARNING = 0;
const NOTIFY_INFORMATION = 1;

module.exports = {
    BACKEND_BASE_URL, 
    GOOGLE_LOGIN_CLIENT_ID,
    RECAPTCHA_SITE_KEY,
    BATCHED_VALIDATION,
    INDIVIDUAL_VALIDATION,
    MAX_TIMEOUT,
    NOTIFY_WARNING,
    NOTIFY_INFORMATION
};