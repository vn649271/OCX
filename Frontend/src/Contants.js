// const BACKEND_BASE_URL = "http://localhost:5000/api";
const BACKEND_BASE_URL = "https://openchaindex-backend-image-1-tog6a3zdpa-uc.a.run.app/api";
const GOOGLE_LOGIN_CLIENT_ID = '760003596258-gien4jnstrtgq07u46b14ifa44cmtub0.apps.googleusercontent.com';
const RECAPTCHA_SITE_KEY = "6LfcUmYdAAAAAIRMTrBktzC2ONu5PlgnOPKkzUtY";
const BATCHED_VALIDATION = 0; // Validation mode
const INDIVIDUAL_VALIDATION = 1; // Validation mode
const MAX_TIMEOUT = 30000;;
const MAX_SMS_DELAY_TIMEOUT = 60;
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
    NOTIFY_INFORMATION,
    MAX_SMS_DELAY_TIMEOUT
};
