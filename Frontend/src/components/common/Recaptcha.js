import { verifyRecaptcha } from "../views/UserFunction";
import Alert from "./Alert";

const SITE_KEY = "6LdoC28dAAAAACQ6Wbl7YPpOZVGHr9H-YQBKUkAA";

export default class RecaptchaComponent {

    constructor() {

        /***** Begin of initialization for reCAPTCHA ******/
        const loadScriptByURL = (id, url, callback) => {
            const isScriptExist = document.getElementById(id);

            if (!isScriptExist) {
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.src = url;
                script.id = id;
                script.onload = function () {
                    if (callback) callback();
                };
                document.body.appendChild(script);
            }
            if (isScriptExist && callback) callback();
        }
        // load the script by passing the URL
        loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`, function () {
            console.log("Script loaded!");
        });
        /***** End of initialization for reCAPTCHA ******/
    }

    // call a backend API to verify reCAPTCHA response
    run(onFinishCallback, params = null) {
        if (window.grecaptcha === undefined || window.grecaptcha === null) {
            // Alert("Failed to init reCAPTCHA");
            onFinishCallback(params, null);
            return;
        }
        window.grecaptcha.ready(() => {
            window.grecaptcha.execute(SITE_KEY, { action: "submit" }).then(recaptchaToken => {
                verifyRecaptcha(recaptchaToken, resp => {
                    onFinishCallback(params, recaptchaToken)
                });
            });
        });
    }
}
