const path = require('path');
const crypto = require('crypto');

// 안전한 파일 이름 생성
const generateSafeFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const safeName = `${timestamp}-${randomString}${extension}`;
  
  return safeName;
};

// 파일 확장자에서 MIME 타입 추정
const getMimeTypeFromExtension = (extension) => {
  const lowerExt = extension.toLowerCase();
  
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/m4a',
    '.ogg': 'audio/ogg',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  
  return mimeTypes[lowerExt] || 'application/octet-stream';
};

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 허용된 파일 형식인지 확인
const isAllowedFileType = (filename, allowedExtensions) => {
  const extension = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(extension);
};

module.exports = {
  generateSafeFileName,
  getMimeTypeFromExtension,
  formatFileSize,
  isAllowedFileType
};