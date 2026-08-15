
const { S3Client, PutObjectCommand, DeleteObjectCommand }  = require('@aws-sdk/client-s3');

/**
 * Extracts the MIME type from a base64url string if it includes a data URI header.
 *
 * @param {string} base64Url - A base64url string that may include a header (e.g., "data:image/png;base64,...").
 * @returns {string} - The extracted MIME type or 'application/octet-stream' if none is found.
 */
function getMimeTypeFromBase64Url(base64Url) {
  const regex = /^data:([^;]+);base64,/;
  const matches = base64Url.match(regex);
  return matches && matches[1] ? matches[1] : 'application/octet-stream';
}

/**
 * Converts a base64url string to a Buffer.
 *
 * @param {string} base64Url - A base64url string that may include a data URI header.
 * @returns {Buffer} - The decoded file buffer.
 */
function convertBase64UrlToBuffer(base64Url) {
  // Remove the data URI header if present.
  const cleanedBase64 = base64Url.replace(/^data:[^;]+;base64,/, '');
  // Replace URL-safe characters with standard base64 characters.
  let standardBase64 = cleanedBase64.replace(/-/g, '+').replace(/_/g, '/');
  // Pad the string with '=' until its length is a multiple of 4.
  while (standardBase64.length % 4 !== 0) {
    standardBase64 += '=';
  }
  return Buffer.from(standardBase64, 'base64');
}

/**
 * Saves a file to an R2 bucket by decoding a base64url string.
 *
 * @param {string} base64Url - The file data encoded as a base64url string.
 *                             It can include a data URI header (e.g., "data:image/png;base64,...").
 * @param {string} fileName - The full file path (including directories) in the bucket.
 * @param {string} bucketName - The name of your R2 bucket.
 * @returns {Promise} - Resolves with the upload result or rejects on error.
 */
async function saveBase64ToR2(base64Url, fileName, bucketName, accessKeyId, secretAccessKey, endpoint) {
  // Extract the MIME type and convert the base64url to a Buffer.
  const mimeType = getMimeTypeFromBase64Url(base64Url);
  const fileBuffer = convertBase64UrlToBuffer(base64Url);

  // Prepare the upload parameters.
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    // Initialize the S3 client for Cloudflare R2 using environment variables.
    const s3Client = new S3Client({
        region: 'auto',
        credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        },
        endpoint: endpoint, // e.g., "https://<accountid>.r2.cloudflarestorage.com"
        forcePathStyle: true, // may be required for some S3-compatible services
    });

    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    console.log('File uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw error;
  }
}

async function deleteFilesFromR2(urls, bucketName, accessKeyId, secretAccessKey, endpoint) {
  const s3Client = new S3Client({
    region: 'auto',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint,
    forcePathStyle: true,
  });

  function extractKeyFromUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.pathname.replace(/^\/+/, '');
    } catch (e) {
      console.error(`Invalid URL skipped: ${url}`);
      return null;
    }
  }

  const failedDeletes = [];

  for (const url of urls) {
    const key = extractKeyFromUrl(url);
    if (!key) continue;

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
      console.log(`Deleted: ${key}`);
    } catch (error) {
      console.error("deleteFilesFromR2.error:", error, url)
      const code = error?.$metadata?.httpStatusCode;
      const awsCode = error?.Code || error?.name;

      // Skip if the file is already gone (NotFound or NoSuchKey)
      if (code === 404 || awsCode === 'NoSuchKey' || awsCode === 'NotFound') {
        console.error(`deleteFilesFromR2.error2: File not found: ${key}, skipping...`);
        continue;
      }

      console.error(`Failed to delete: ${key}`, error);
      failedDeletes.push(url);
    }
  }

  return failedDeletes;
}


module.exports = {
    saveBase64ToR2, deleteFilesFromR2
}