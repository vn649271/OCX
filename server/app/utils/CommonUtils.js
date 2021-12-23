const fs = require('fs');
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
}

module.exports = CommonUtils