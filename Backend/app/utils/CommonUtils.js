const fs = require('fs');
const crypto = require('crypto');
const JSEncrypt = require('node-jsencrypt');
const crypt = new JSEncrypt();
const { networkInterfaces } = require('os');

const nets = networkInterfaces();

const GLOBAL_SETTINGS_FILE_NAME = "global-settings.json";

var me = null;

class CommonUtils {
    constructor() {
        me = this;
        this.globalSettings = {};
        this.loadGlobalSetting();
    }
    

    loadGlobalSetting = () => {
        fs.readFile(GLOBAL_SETTINGS_FILE_NAME, 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
            me.globalSettings = JSON.parse(data); //now it an object
        }});
    }

    saveGlobalSetting = (group, key, value) => {
        var fs = require('fs');
        this.globalSettings[group] = {};
        this.globalSettings[group][key] = value
        json = JSON.stringify(this.globalSettings); //convert it back to json
        fs.writeFile(GLOBAL_SETTINGS_FILE_NAME, json, 'utf8', callback); // write it back 
    }

    GenerateKeyPair() {
        return crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
    }

    async decrypt(encrypted, privateKey) {
        crypt.setPrivateKey(privateKey);
        var decrypted = await crypt.decrypt(encrypted);
        return decrypted;
    }

    async getIpList() {
        const results = Object.create(null); // Or just '{}', an empty object
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }        
        return results;
    }
}

module.exports = CommonUtils