const EventEmitter = require('events');
const uploadEmitter = new EventEmitter();

class BackgroundUploadService {
  constructor() {
    this.uploads = new Map(); // Store ongoing uploads
  }

  // Start a new upload session
  createUploadSession(files) {
    const sessionId = Date.now().toString();
    const totalFiles = files.length;
    
    this.uploads.set(sessionId, {
      total: totalFiles,
      completed: 0,
      failed: 0,
      status: 'in_progress',
      files: [],
      startTime: new Date(),
    });

    return sessionId;
  }

  // Update upload progress
  updateProgress(sessionId, fileInfo) {
    const session = this.uploads.get(sessionId);
    if (session) {
      session.files.push(fileInfo);
      session.completed += 1;

      if (session.completed === session.total) {
        session.status = 'completed';
        session.endTime = new Date();
      }

      uploadEmitter.emit('progress', {
        sessionId,
        progress: (session.completed / session.total) * 100,
        status: session.status,
        files: session.files
      });
    }
  }

  // Update failed upload
  updateFailed(sessionId, error) {
    const session = this.uploads.get(sessionId);
    if (session) {
      session.failed += 1;
      session.completed += 1;
      
      if (session.completed === session.total) {
        session.status = session.failed === session.total ? 'failed' : 'partially_completed';
        session.endTime = new Date();
      }

      uploadEmitter.emit('progress', {
        sessionId,
        progress: (session.completed / session.total) * 100,
        status: session.status,
        error: error.message
      });
    }
  }

  // Get upload status
  getStatus(sessionId) {
    return this.uploads.get(sessionId);
  }

  // Clean up completed uploads after 24 hours
  cleanup() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [sessionId, session] of this.uploads.entries()) {
      if (session.endTime && session.endTime < yesterday) {
        this.uploads.delete(sessionId);
      }
    }
  }
}

module.exports = { BackgroundUploadService: new BackgroundUploadService(), uploadEmitter }; 