// image upload
const multer = require('multer')

// var storage = multer.diskStorage({
//     destination:  (req, file, cb)=>{
//         cb(null, './public/attachment');
//     },
//     filename:  (req, file, cb)=>{
//         cb(null, file.fieldname + '_' + Date.now() + "_" + file.originalname)
//     },
// })

const storage = multer.memoryStorage()

var upload = multer({
    storage: storage
}).fields(
    [
        {
            name:'istimaraFile',
            maxCount: 1

        },
        {
            name: 'insuranceFile',
            maxCount: 1
        },
        {
            name: 'qidFile',
            maxCount: 1
        }
    ]
);


module.exports = upload;