import React, { Component } from "react";
import { verifyRecaptcha } from "../views/UserFunction";

const SITE_KEY = '6LdoC28dAAAAACQ6Wbl7YPpOZVGHr9H-YQBKUkAA'; //process.env.RECAPTCHA_SITE_KEY;

var me;

export default class RecaptchaComponent extends Component {

    constructor(props) {
        super(props);
        me = this;

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
  
        this.onChange = this.onChange.bind(this)
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value })
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!  RecaptchaComponent.onChange(): ", this.props.trigger);
        if (this.props.trigger) {
            if (window.grecaptcha == undefined || window.grecaptcha == null) {
                alert("Failed to init reCAPTCHA");
                return;
            }
            window.grecaptcha.ready(() => {
                window.grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(token => {
                    me.submitData(token);
                });
            });
        }
    }

    submitData = (token) => {
        // call a backend API to verify reCAPTCHA response
        verifyRecaptcha(token, resp => {
            console.log(resp)
        });
    }
  
    render() {
        return (
            <input type="hidden" className="recaptcha-component" value={this.props.trigger} onChange={this.onChange} />
        );
    }
}
  