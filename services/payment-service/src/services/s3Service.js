const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3Client = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

const generatePresignedUrl = async (fileKey) => {
  const command = new GetObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: fileKey,
  });

  // URL valid for 24 hours (86400 seconds)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 86400 });
  return signedUrl;
};

module.exports = {
  generatePresignedUrl
};
