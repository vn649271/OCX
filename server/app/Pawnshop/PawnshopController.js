
var self = null;

/**
 * Controller for user authentication
 */
class PawnshopController {
    constructor() {
        self = this;
    }

    uploadPawnItem = async (req, resp) => {
        const newpath = __dirname + "/../../files/";
        const file = req.files ? req.files.file ? req.files.file: null : null;
        if (!file) {
            return resp.status(500).send({ message: "Invalid parameter", code: 200 });
        }
        const filename = file.name;

        file.mv(`${newpath}${filename}`, (err) => {
            if (err) {
                return resp.status(500).send({ message: "File upload failed", code: 200 });
            }
            return resp.status(200).send({ message: "File Uploaded", code: 200 });
        });
    }
}

module.exports = PawnshopController;