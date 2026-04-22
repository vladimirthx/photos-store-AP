const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
  region: 'us-east-1', // DO spaces often uses this default for aws-sdk compatibility
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

const uploadToSpaces = async (fileBuffer, fileName, mimetype, isPublic = false) => {
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: isPublic ? 'public-read' : 'private'
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  
  return isPublic ? `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${fileName}` : fileName;
};

module.exports = {
  uploadToSpaces,
  s3Client
};
