var util = require('util');
var exec = require('child_process').exec;
var formidable = require('formidable');
var fs = require('fs');
require('dotenv').config();

var self;

/**
 * Controller for phone verify
 */
class LiveUpdateController {

    constructor() {
        self = this;
    }

    /**
     * 
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    getHistory = (req, resp) => {
        console.info("LiveUpdateController.getStatus():    ", req.body);
    }

    /**
     * Upload file to be updated
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    uploadUpdate = (req, res) => {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldpath = files.filetoupload.filepath;
            var newpath = process.env.HOME + files.filetoupload.originalFilename;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.write('File uploaded and moved!');
                res.end();
            });
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    doUpdate = (req, resp) => {
        console.info("LiveUpdateController.update():    ", req.body);
        let pathToUpdate = req.body.pathToUpdate ? req.body.pathToUpdate: null;
        if (pathToUpdate == null || pathToUpdate.trim() == "") {
            return resp.json({ error: -1, data: "Invalid old path" });
        }
        let newContent = req.body.newContent ? req.body.newContent: null;
        if (newContent == null || newContent.trim() == "") {
            return resp.json({ error: -2, data: "Invalid content to be updated" });
        }
        // Do update
        return resp.json({ error: 0, data: null });
    }

};

module.exports = LiveUpdateController;
