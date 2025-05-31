const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { s3 } = require('../config/s3');

// 허용된 파일 타입
const fileFilter = (req, file, cb) => {
  console.log('파일 필터링 중:', file.originalname);
  const allowedTypes = ['.mp3', '.wav', '.m4a'];
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(extname)) {
    console.log('파일 형식 허용됨:', extname);
    cb(null, true);
  } else {
    console.log('파일 형식 거부됨:', extname);
    cb(new Error(`지원되지 않는 파일 형식입니다. ${allowedTypes.join(', ')} 파일만 업로드 가능합니다.`), false);
  }
};

// 업로드 중 오류 상세 로깅
const logUploadDetails = (req, file, cb) => {
  console.log('S3 업로드 시도 중...');
  console.log('버킷:', process.env.AWS_S3_BUCKET_NAME);
  console.log('파일 원본 이름:', file.originalname);
  console.log('파일 MIME 유형:', file.mimetype);
  console.log('사용자 ID:', req.user ? req.user.id : 'anonymous');
  
  // 다음 단계 진행
  cb(null);
};

// Multer와 S3 설정
const upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'private', // 파일 접근 권한 (private 설정은 서명된 URL로만 접근 가능)
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const userId = req.user ? req.user.id : 'anonymous';
      const fileName = `${userId}/${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      console.log('생성된 S3 파일 키:', fileName);
      cb(null, fileName);
    },
    // 업로드 중 로그 설정
    shouldTransform: function (req, file, cb) {
      logUploadDetails(req, file, cb);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 최대 100MB
  }
});

// 업로드 오류 처리 미들웨어
const handleUploadError = (err, req, res, next) => {
  console.error('파일 업로드 오류:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '파일 크기가 너무 큽니다. 최대 100MB까지 업로드 가능합니다.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Multer 업로드 오류: ${err.message}`
    });
  }
  
  if (err.message.includes('지원되지 않는 파일 형식')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: '파일 업로드 중 오류가 발생했습니다.',
    error: err.message
  });
};

module.exports = { upload, handleUploadError };