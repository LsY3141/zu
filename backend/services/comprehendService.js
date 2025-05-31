const AWS = require('aws-sdk');

// Comprehend 서비스 객체 생성
const comprehend = new AWS.Comprehend({
  region: process.env.AWS_REGION || 'ap-northeast-2'
});

// 텍스트 요약 (AWS Comprehend에는 직접적인 요약 기능이 없어 간접적으로 구현)
const summarizeText = async (text, language = 'ko') => {
  console.log('텍스트 요약 서비스 시작');
  console.log('텍스트 길이:', text.length);
  console.log('언어:', language);
  
  try {
    // 핵심 문장 추출을 위해 중요 문구 추출
    console.log('핵심 문구 추출 시작');
    const keyPhrasesParams = {
      Text: text,
      LanguageCode: language
    };
    
    const keyPhrasesResult = await comprehend.detectKeyPhrases(keyPhrasesParams).promise();
    const keyPhrases = keyPhrasesResult.KeyPhrases;
    console.log('추출된 핵심 문구 수:', keyPhrases.length);
    
    // 감성 분석 (텍스트의 긍/부정 파악을 위함)
    console.log('감성 분석 시작');
    const sentimentParams = {
      Text: text,
      LanguageCode: language
    };
    
    const sentimentResult = await comprehend.detectSentiment(sentimentParams).promise();
    const sentiment = sentimentResult.Sentiment;
    console.log('감지된 감성:', sentiment);
    
    // 문장 분리
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    console.log('분리된 문장 수:', sentences.length);
    
    // 중요 문장 선택 (핵심 문구가 포함된 문장 우선)
    console.log('문장 점수 계산 시작');
    const scoredSentences = sentences.map(sentence => {
      let score = 0;
      
      // 핵심 문구 포함 여부로 점수 부여
      keyPhrases.forEach(phrase => {
        if (sentence.includes(phrase.Text)) {
          score += phrase.Score;
        }
      });
      
      return { sentence, score };
    });
    
    // 점수 기반 정렬
    scoredSentences.sort((a, b) => b.score - a.score);
    
    // 상위 30% 문장 선택 (최소 1개, 최대 3개)
    const topSentencesCount = Math.max(1, Math.min(3, Math.ceil(sentences.length * 0.3)));
    const topSentences = scoredSentences.slice(0, topSentencesCount);
    console.log('선택된 상위 문장 수:', topSentences.length);
    
    // 원래 순서대로 재정렬
    topSentences.sort((a, b) => {
      return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
    });
    
    // 최종 요약 생성
    const summary = topSentences.map(item => item.sentence.trim()).join(' ');
    console.log('생성된 요약 길이:', summary.length);
    
    return summary;
  } catch (error) {
    console.error('텍스트 요약 오류:', error);
    console.error('오류 스택:', error.stack);
    throw error;
  }
};

// 핵심 문구 추출
const extractKeyPhrases = async (text, language = 'ko') => {
  console.log('핵심 문구 추출 서비스 시작');
  console.log('텍스트 길이:', text.length);
  console.log('언어:', language);
  
  try {
    const params = {
      Text: text,
      LanguageCode: language
    };
    
    console.log('Comprehend API 호출 시작');
    const result = await comprehend.detectKeyPhrases(params).promise();
    console.log('핵심 문구 추출 성공, 문구 수:', result.KeyPhrases.length);
    
    // 중요도 점수에 따라 정렬하고 상위 항목 선택
    const sortedPhrases = result.KeyPhrases
      .sort((a, b) => b.Score - a.Score)
      .slice(0, 10) // 상위 10개만
      .map(phrase => phrase.Text);
    
    console.log('선택된 상위 문구:', sortedPhrases);
    return sortedPhrases;
  } catch (error) {
    console.error('핵심 문구 추출 오류:', error);
    console.error('오류 스택:', error.stack);
    throw error;
  }
};

module.exports = {
  summarizeText,
  extractKeyPhrases
};