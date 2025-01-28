const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const config = require('../config/storage.config');
const { Readable } = require('stream');

class StorageService {
  constructor() {
    if (config.storageType === 'azure') {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        config.azure.connectionString
      );
      this.containerClient = this.blobServiceClient.getContainerClient(
        config.azure.containerName
      );
    }
  }

  async generateUploadUrl(fileName) {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const uniqueFileName = `${uniqueId}-${fileName}`;

    if (config.storageType === 'azure') {
      const blockBlobClient = this.containerClient.getBlockBlobClient(uniqueFileName);
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: 'write',
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // URL expires in 1 hour
      });
      return {
        uploadUrl: sasUrl,
        fileId: uniqueFileName
      };
    } else {
      // For local storage, return a URL to our upload endpoint
      return {
        uploadUrl: `/api/upload/${uniqueFileName}`,
        fileId: uniqueFileName
      };
    }
  }

  async uploadLocalFile(fileId, fileBuffer) {
    const uploadDir = path.join(process.cwd(), config.local.uploadDir);
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileId);
    await fs.writeFile(filePath, fileBuffer);
    return fileId;
  }

  async downloadFile(fileId) {
    if (config.storageType === 'azure') {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileId);
      const downloadBuffer = await blockBlobClient.downloadToBuffer();
      return downloadBuffer;
    } else {
      const filePath = path.join(process.cwd(), config.local.uploadDir, fileId);
      return await fs.readFile(filePath);
    }
  }

  async getFileStream(fileId) {
    if (config.storageType === 'azure') {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileId);
      const downloadResponse = await blockBlobClient.download(0);
      return downloadResponse.readableStreamBody;
    } else {
      const filePath = path.join(process.cwd(), config.local.uploadDir, fileId);
      return fs.createReadStream(filePath);
    }
  }

  async getFileInfo(fileId) {
    if (config.storageType === 'azure') {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileId);
      const properties = await blockBlobClient.getProperties();
      return {
        size: properties.contentLength,
        type: properties.contentType,
        name: fileId
      };
    } else {
      const filePath = path.join(process.cwd(), config.local.uploadDir, fileId);
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        type: 'application/octet-stream', // You might want to implement mime-type detection
        name: fileId
      };
    }
  }
}

module.exports = new StorageService(); 