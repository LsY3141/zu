import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// axios 인스턴스 생성
const api = axios.create({
baseURL: API_BASE_URL,
timeout: 10000, // 10초 타임아웃
headers: {
'Content-Type': 'application/json',
},
});

// 요청 인터셉터 - 모든 요청에 토큰 자동 추가
api.interceptors.request.use(
(config) => {
const token = localStorage.getItem('token');
if (token) {
    config.headers.Authorization = `Bearer ${token}`;
}
return config;
},
(error) => {
return Promise.reject(error);
}
);

// 응답 인터셉터 - 토큰 만료 등 에러 처리
api.interceptors.response.use(
(response) => {
return response;
},
(error) => {
// 401 에러 (인증 실패) 시 로그아웃 처리
if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// 네트워크 에러 처리
if (!error.response) {
    error.message = '네트워크 연결을 확인해주세요.';
}

return Promise.reject(error);
}
);

export default api;