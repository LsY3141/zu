const AWS = require('aws-sdk');

// Translate 서비스 객체 생성
const translate = new AWS.Translate({
  region: process.env.AWS_REGION || 'ap-northeast-2'
});

// 텍스트 번역
const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  console.log('텍스트 번역 서비스 시작');
  console.log('텍스트 길이:', text.length);
  console.log('소스 언어:', sourceLanguage);
  console.log('타겟 언어:', targetLanguage);
  
  try {
    const params = {
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage
    };
    
    console.log('Translate API 호출 시작');
    const result = await translate.translateText(params).promise();
    
    console.log('번역 성공. 감지된 소스 언어:', result.SourceLanguageCode);
    console.log('번역된 텍스트 길이:', result.TranslatedText.length);
    
    return {
      translatedText: result.TranslatedText,
      sourceLanguage: result.SourceLanguageCode,
      targetLanguage: result.TargetLanguageCode
    };
  } catch (error) {
    console.error('텍스트 번역 오류:', error);
    console.error('오류 스택:', error.stack);
    throw error;
  }
};

module.exports = {
  translateText
};