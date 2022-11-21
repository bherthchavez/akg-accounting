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


// var storage = multer.diskStorage({
//     destination:  (req, file, cb)=>{
//         cb(null, './public/attachment');
//     },
//     filename:  (req, file, cb)=>{
//         cb(null, file.fieldname + '_' + Date.now() + "_" + file.originalname)
//     },
// })

// var upload = multer({
//     storage: storage
// }).single('istimaraFile');


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/attachment')
//     },
//     filename: function (req, file, cb) {
//             cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0])
//     }
// });

// const multi_upload = multer({
//     storage,
//     // limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//             cb(null, true);
//         } else {
//             cb(null, false);
//             const err = new Error('Only .png, .jpg and .jpeg format allowed!')
//             err.name = 'ExtensionError'
//             return cb(err);
//         }
//     },
// }).fields(
//     [
//         {
//             name:'uploadedImages'
//         },
//         {
//             name: 'uploadedImages2'
//         }
//     ]
// );



module.exports = upload;