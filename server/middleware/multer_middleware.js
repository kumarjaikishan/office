const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log("from multer",file);
        return cb(null,"./uploads");
        // return cb(null, "/tmp");
    },
    filename: function async (req, file, cb) {
        const uniquename = `${Date.now()}-${file.originalname}`;
        cb(null, uniquename);
        return;
    },
})

const upload = multer({ storage });

module.exports = upload;

