const AWS = require('aws-sdk');
require('dotenv').config();

console.log('AWS SDK 설정 시작...');
console.log('사용 중인 AWS 리전:', process.env.AWS_REGION || 'ap-northeast-2');

// AWS SDK 설정 (역할 기반)
let config = {
  region: process.env.AWS_REGION || 'ap-northeast-2'
};

// AWS_SDK_LOAD_CONFIG 설정
process.env.AWS_SDK_LOAD_CONFIG = '1';



// 액세스 키가 제공된 경우 사용 (테스트 용도)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('AWS 액세스 키와 시크릿 키 사용 중...');
  config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}

AWS.config.update(config);

// EC2나 Lambda 환경에서는 자동으로 역할 자격 증명을 사용
// 로컬 개발 환경이면 AWS CLI의 프로필 사용 가능
if (process.env.NODE_ENV === 'development' && process.env.AWS_PROFILE) {
  console.log(`AWS 프로필 사용 중: ${process.env.AWS_PROFILE}`);
  try {
    const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
    AWS.config.credentials = credentials;
  } catch (error) {
    console.error('AWS 프로필 로드 오류:', error);
  }
}

// S3 객체 생성
const s3 = new AWS.S3();

// S3 연결 테스트
const testS3Connection = async () => {
  try {
    console.log('S3 연결 테스트 중...');
    const buckets = await s3.listBuckets().promise();
    console.log('사용 가능한 S3 버킷:', buckets.Buckets.map(b => b.Name).join(', '));
    console.log('S3 연결 성공!');
    
    // 현재 사용하려는 버킷이 목록에 있는지 확인
    const targetBucket = process.env.AWS_S3_BUCKET_NAME;
    if (targetBucket && buckets.Buckets.some(b => b.Name === targetBucket)) {
      console.log(`대상 버킷 ${targetBucket} 접근 가능 확인됨`);
    } else if (targetBucket) {
      console.warn(`주의: 대상 버킷 ${targetBucket}에 접근할 수 없습니다.`);
    }
  } catch (error) {
    console.error('S3 연결 테스트 실패:', error);
    console.error('AWS 자격 증명 또는 권한 문제일 수 있습니다.');
  }
};

// 애플리케이션 시작 시 S3 연결 테스트 실행
testS3Connection();

// Transcribe 객체 생성
const transcribeService = new AWS.TranscribeService();

// Transcribe 연결 테스트
const testTranscribeConnection = async () => {
  try {
    console.log('Transcribe 연결 테스트 중...');
    const jobs = await transcribeService.listTranscriptionJobs({ MaxResults: 5 }).promise();
    console.log('Transcribe 작업 목록 조회 성공:', jobs.TranscriptionJobSummaries.length);
    console.log('Transcribe 연결 성공!');
  } catch (error) {
    console.error('Transcribe 연결 테스트 실패:', error);
    console.error('AWS 자격 증명 또는 권한 문제일 수 있습니다.');
  }
};

// 애플리케이션 시작 시 Transcribe 연결 테스트 실행
testTranscribeConnection();

// Comprehend 객체 생성
const comprehendService = new AWS.Comprehend();

// Comprehend 연결 테스트
const testComprehendConnection = async () => {
  try {
    console.log('Comprehend 연결 테스트 중...');
    const result = await comprehendService.detectDominantLanguage({
      Text: 'Hello world'
    }).promise();
    console.log('Comprehend 언어 감지 테스트 성공:', result.Languages);
    console.log('Comprehend 연결 성공!');
  } catch (error) {
    console.error('Comprehend 연결 테스트 실패:', error);
    console.error('AWS 자격 증명 또는 권한 문제일 수 있습니다.');
  }
};

// 애플리케이션 시작 시 Comprehend 연결 테스트 실행
testComprehendConnection();

// Translate 객체 생성
const translateService = new AWS.Translate();

// Translate 연결 테스트
const testTranslateConnection = async () => {
  try {
    console.log('Translate 연결 테스트 중...');
    const result = await translateService.translateText({
      Text: 'Hello world',
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'ko'
    }).promise();
    console.log('Translate 번역 테스트 성공:', result.TranslatedText);
    console.log('Translate 연결 성공!');
  } catch (error) {
    console.error('Translate 연결 테스트 실패:', error);
    console.error('AWS 자격 증명 또는 권한 문제일 수 있습니다.');
  }
};

// 애플리케이션 시작 시 Translate 연결 테스트 실행
testTranslateConnection();

module.exports = {
  s3,
  transcribeService,
  comprehendService,
  translateService
};