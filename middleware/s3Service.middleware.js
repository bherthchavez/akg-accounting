const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'us-east-1' });

exports.s3Upload = async (file, no, options) => {
    try {
      const folder = options === 'vehicle' ? 'vehicle' : 'employee';
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `akgFiles/nawras/${folder}/${file.fieldname}-${no}-${file.originalname}`,
        Body: file.buffer
      };
  
      return s3.upload(params).promise();
    } catch (error) {
      console.error("S3 Upload Error:", error);
      throw new Error("Failed to upload file to S3");
    }
  };
  


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