// translateService.js - s3.js에서 생성한 translateService 사용

const { translateService } = require('../config/s3'); // s3.js에서 만든 객체 사용

// 텍스트 번역
const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  console.log('텍스트 번역 서비스 시작 (s3.js의 translateService 사용)');
  console.log('텍스트 길이:', text.length);
  console.log('소스 언어:', sourceLanguage);
  console.log('타겟 언어:', targetLanguage);
  
  try {
    // 언어 코드 검증 및 매핑
    const supportedLanguages = {
      'auto': 'auto',
      'ko': 'ko',
      'en': 'en', 
      'ja': 'ja',
      'zh': 'zh',
      'zh-cn': 'zh',
      'es': 'es',
      'fr': 'fr',
      'de': 'de'
    };
    
    const mappedSourceLang = supportedLanguages[sourceLanguage.toLowerCase()] || sourceLanguage;
    const mappedTargetLang = supportedLanguages[targetLanguage.toLowerCase()] || targetLanguage;
    
    console.log('매핑된 언어 - 소스:', mappedSourceLang, '타겟:', mappedTargetLang);
    
    const params = {
      Text: text,
      SourceLanguageCode: mappedSourceLang,
      TargetLanguageCode: mappedTargetLang
    };
    
    console.log('Translate API 호출 시작 (s3.js 객체 사용)');
    const result = await translateService.translateText(params).promise();
    
    console.log('✅ 번역 성공! 감지된 소스 언어:', result.SourceLanguageCode);
    console.log('번역된 텍스트 길이:', result.TranslatedText.length);
    
    return {
      translatedText: result.TranslatedText,
      sourceLanguage: result.SourceLanguageCode,
      targetLanguage: result.TargetLanguageCode
    };
  } catch (error) {
    console.error('❌ 텍스트 번역 오류:', error);
    console.error('오류 코드:', error.code);
    console.error('오류 메시지:', error.message);
    
    // 구체적인 오류 처리
    if (error.code === 'AccessDeniedException') {
      console.error('🚨 권한 오류 - 이 오류가 나오면 안 됩니다 (s3.js 객체 사용 중)');
    } else if (error.code === 'UnsupportedLanguagePairException') {
      console.error('🚨 지원하지 않는 언어 조합:', sourceLanguage, '->', targetLanguage);
    }
    
    throw error;
  }
};

module.exports = {
  translateText
};
