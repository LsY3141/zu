import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 파일 import
import ko from '../locales/ko.json';
import en from '../locales/en.json';

// i18n 설정
i18n
  .use(LanguageDetector) // 브라우저 언어 자동 감지
  .use(initReactI18next) // React와 연동
  .init({
    // 번역 리소스
    resources: {
      ko: {
        translation: ko
      },
      en: {
        translation: en
      }
    },
    
    // 기본 언어
    fallbackLng: 'ko',
    
    // 개발 모드에서 디버깅 로그 표시
    debug: process.env.NODE_ENV === 'development',
    
    // 네임스페이스 사용 안함 (단순화)
    ns: ['translation'],
    defaultNS: 'translation',
    
    // 보간(interpolation) 설정
    interpolation: {
      escapeValue: false, // React는 XSS 보호가 내장되어 있음
    },
    
    // 언어 감지 설정
    detection: {
      // 언어를 저장할 위치 순서
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // localStorage 키 이름
      lookupLocalStorage: 'i18nextLng',
      
      // 캐시 사용
      caches: ['localStorage'],
    },
  });

export default i18n;