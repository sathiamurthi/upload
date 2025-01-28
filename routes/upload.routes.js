const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const storageService = require('../services/storage.service');

// Get upload URLs for multiple files
router.post('/get-upload-url', async (req, res) => {
  try {
    const { files } = req.body;
    if (!Array.isArray(files)) {
      return res.status(400).json({ error: 'Files array is required' });
    }

    const uploadUrls = await Promise.all(
      files.map(async (file) => {
        return await storageService.generateUploadUrl(file.name);
      })
    );

    res.json({ uploadUrls });
  } catch (error) {
    console.error('Error generating upload URLs:', error);
    res.status(500).json({ error: 'Failed to generate upload URLs' });
  }
});

// Handle multiple file uploads
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        const { fileId } = await storageService.generateUploadUrl(file.originalname);
        await storageService.uploadLocalFile(fileId, file.buffer);
        return {
          originalName: file.originalname,
          fileId: fileId,
          size: file.size,
          mimeType: file.mimetype
        };
      })
    );

    res.json({
      message: 'Files uploaded successfully',
      files: uploadResults
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Handle local file uploads
router.put('/upload/:fileId', upload.single('file'), async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    await storageService.uploadLocalFile(fileId, req.file.buffer);
    res.json({ message: 'File uploaded successfully', fileId });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Download file
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileBuffer = await storageService.downloadFile(fileId);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename=${fileId}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

module.exports = router; 