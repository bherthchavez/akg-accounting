const { S3 } =  require("aws-sdk")
const s3 = new S3()

exports.s3Upload = async (file,no, options) =>{
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `akgFiles/nawras/${(options ==='vehicle' ? 'vehicle' : 'employee')}/${file.fieldname}-${no}-${file.originalname}`,
        Body: file.buffer
    }
   return await s3.upload(param).promise();
}


exports.s3Delete = async (fileName, options) =>{
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `akgFiles/nawras/${(options ==='vehicle' ? 'vehicle' : 'employee')}/${fileName}`
    }
    s3.deleteObject(param, function(err) {
    if (err) 
      console.log(err);  // error
    else    
     console.log("File Successfully Updated!");
  });
}
exports.s3Download = async (fileName, options) =>{

    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `akgFiles/nawras/${(options ==='vehicle' ? 'vehicle' : 'employee')}/${fileName}`

    }
   return s3.getObject(param).createReadStream();
}