const { uploadToSpaces } = require('./src/services/s3Service');

async function test() {
  try {
    const buffer = Buffer.from('hello world');
    console.log('Attempting upload...');
    const result = await uploadToSpaces(buffer, 'test.txt', 'text/plain', true);
    console.log('Success:', result);
  } catch (err) {
    console.error('Upload Error:', err);
  }
}
test();
