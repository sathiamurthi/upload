# File Upload API System
Author: Sathiamurthi

## Overview
A robust Node.js-based file upload API system that supports both local storage and Azure Blob storage. The system provides endpoints for single and multiple file uploads, with support for streaming downloads and configurable storage backends.

## Features
- Multiple file upload support (up to 10 files simultaneously)
- Configurable storage backend (Local/Azure Blob)
- Asynchronous upload with pre-signed URLs
- Streaming file downloads
- Error handling and validation
- File size limit: 50MB per file
- Unique file ID generation for secure storage
- Progress tracking for uploads
- Support for various file types

## Project Structure

## Error Handling
The API returns appropriate HTTP status codes and error messages:
- 400: Bad Request (invalid input)
- 500: Internal Server Error (server-side issues)

## Storage Configuration
The system supports two storage backends:
1. Local Storage: Files are stored in the `uploads` directory
2. Azure Blob Storage: Files are stored in Azure Blob container

## Security Considerations
- File size limits implemented
- Unique file IDs generated for each upload
- Configurable storage backend
- Input validation for all endpoints

## Dependencies
- express: ^4.17.1
- multer: ^1.4.2
- @azure/storage-blob: ^12.0.0
- dotenv: ^8.2.0

## License
MIT

## Contributing
Feel free to submit issues and enhancement requests.

---
Created by Sathiamurthi