const { s3 } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

// S3에 파일 업로드
const uploadFile = async (file) => {
  console.log('S3 파일 업로드 서비스 시작');
  console.log('업로드할 파일:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.buffer ? file.buffer.length : 'buffer 없음'
  });
  
  try {
    const key = `uploads/${uuidv4()}-${file.originalname}`;
    console.log('생성된 S3 키:', key);
    console.log('대상 버킷:', process.env.AWS_S3_BUCKET_NAME);
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };
    
    console.log('S3 업로드 요청 시작');
    const result = await s3.upload(params).promise();
    console.log('S3 업로드 성공:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('S3 파일 업로드 오류:', error);
    console.error('오류 스택:', error.stack);
    throw error;
  }
};

// 서명된 URL 생성 (임시 액세스)
const getSignedUrl = async (key, expires = 3600) => {
  console.log('S3 서명된 URL 생성 시작');
  console.log('대상 키:', key);
  console.log('만료 시간:', expires, '초');
  
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: expires // 기본 1시간 (3600초)
    };
    
    const url = s3.getSignedUrl('getObject', params);
    console.log('서명된 URL 생성 성공 (URL 시작 부분):', url.substring(0, 50) + '...');
    return url;
  } catch (error) {
    console.error('S3 서명된 URL 생성 오류:', error);
    console.error('오류 스택:', error.stack);
    throw error;
  }
};

// S3에서 파일 삭제
const deleteFile = async (key) => {
  console.log('S3 파일 삭제 서비스 시작');
  console.log('삭제할 키:', key);
  
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    console.log('S3 파일 삭제 성공');
    return true;
  } catch (error) {
    console.error('S3 파일 삭제 오류:', error);
    console.error('오류 스택:', error.stack);
    throw error;
  }
};

module.exports = {
  uploadFile,
  getSignedUrl,
  deleteFile
};