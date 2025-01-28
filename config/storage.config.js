const storageConfig = {
  storageType: process.env.STORAGE_TYPE || 'local', // 'local' or 'azure'
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: process.env.AZURE_CONTAINER_NAME || 'uploads'
  },
  local: {
    uploadDir: 'uploads'
  }
};

module.exports = storageConfig; 