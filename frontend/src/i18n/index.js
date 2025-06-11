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
    
    // 기본 언어 - 영어로 변경 (더 범용적)
    fallbackLng: 'en',
    
    // 지원하는 언어 목록 명시
    supportedLngs: ['ko', 'en'],
    
    // 개발 모드에서 디버깅 로그 표시
    debug: process.env.NODE_ENV === 'development',
    
    // 네임스페이스 사용 안함 (단순화)
    ns: ['translation'],
    defaultNS: 'translation',
    
    // 보간(interpolation) 설정
    interpolation: {
      escapeValue: false, // React는 XSS 보호가 내장되어 있음
    },
    
    // 언어 감지 설정 - 순서와 옵션 개선
    detection: {
      // 언어를 저장할 위치 순서 - navigator를 localStorage보다 우선
      order: ['navigator', 'localStorage', 'htmlTag', 'querystring', 'cookie'],
      
      // localStorage 키 이름
      lookupLocalStorage: 'i18nextLng',
      
      // 캐시 사용
      caches: ['localStorage'],
      
      // 브라우저 언어 감지 옵션 개선
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      
      // 감지된 언어를 즉시 캐시에 저장
      checkWhitelist: true,
      
      // 언어 변환 함수 - 'ko-KR' → 'ko', 'en-US' → 'en'
      convertDetectedLanguage: (lng) => {
        const languageMap = {
          'ko-KR': 'ko',
          'ko-kr': 'ko',
          'ko_KR': 'ko',
          'ko_kr': 'ko',
          'korean': 'ko',
          'en-US': 'en',
          'en-us': 'en',
          'en_US': 'en',
          'en_us': 'en',
          'english': 'en',
          'en-GB': 'en',
          'en-gb': 'en'
        };
        
        // 언어 코드 정규화
        const normalizedLng = lng.toLowerCase();
        const mappedLng = languageMap[normalizedLng] || lng.split('-')[0].split('_')[0];
        
        // 지원하는 언어인지 확인
        return ['ko', 'en'].includes(mappedLng) ? mappedLng : 'en';
      }
    },
    
    // 언어가 변경될 때 로그 출력 (개발용)
    ...(process.env.NODE_ENV === 'development' && {
      initImmediate: false,
      interpolation: {
        escapeValue: false,
      }
    })
  });

// 초기화 후 감지된 언어 로그 출력 (개발 모드에서만)
if (process.env.NODE_ENV === 'development') {
  i18n.on('initialized', () => {
    console.log('🌍 i18n 초기화 완료');
    console.log('🎯 감지된 언어:', i18n.language);
    console.log('🗂️ 지원 언어:', i18n.options.supportedLngs);
  });

  i18n.on('languageChanged', (lng) => {
    console.log('🔄 언어 변경됨:', lng);
  });
}

export default i18n;