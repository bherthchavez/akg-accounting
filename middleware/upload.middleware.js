// image upload
const multer = require('multer')

var storage = multer.diskStorage({
    destination:  (req, file, cb)=>{
        cb(null, './public/attachment');
    },
    filename:  (req, file, cb)=>{
        cb(null, file.fieldname + '_' + Date.now() + "_" + file.originalname)
    },
})

var upload = multer({
    storage: storage
}).single('documents');

module.exports = upload;