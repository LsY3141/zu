// src/api/chatApi.js
import axiosInstance from './axios';

const chatApi = {
  // 챗봇에게 메시지 전송
  sendMessage: async (messageData) => {
    try {
      const response = await axiosInstance.post('/chat/message', messageData);
      return response.data;
    } catch (error) {
      console.error('챗봇 메시지 전송 오류:', error);
      throw error;
    }
  },

  // 노트 기반 질문 답변
  askAboutNote: async (noteId, question) => {
    try {
      const response = await axiosInstance.post(`/chat/note/${noteId}`, {
        question,
      });
      return response.data;
    } catch (error) {
      console.error('노트 관련 질문 오류:', error);
      throw error;
    }
  },

  // 노트 요약 요청
  summarizeNote: async (noteId) => {
    try {
      const response = await axiosInstance.post(`/chat/summarize/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('노트 요약 오류:', error);
      throw error;
    }
  },

  // 노트 핵심 키워드 추출
  extractKeywords: async (noteId) => {
    try {
      const response = await axiosInstance.post(`/chat/keywords/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('키워드 추출 오류:', error);
      throw error;
    }
  },

  // 관련 노트 추천
  getRelatedNotes: async (noteId) => {
    try {
      const response = await axiosInstance.get(`/chat/related/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('관련 노트 추천 오류:', error);
      throw error;
    }
  },

  // 채팅 히스토리 조회
  getChatHistory: async (noteId) => {
    try {
      const response = await axiosInstance.get(`/chat/history/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('채팅 히스토리 조회 오류:', error);
      throw error;
    }
  },

  // 채팅 히스토리 삭제
  clearChatHistory: async (noteId) => {
    try {
      const response = await axiosInstance.delete(`/chat/history/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('채팅 히스토리 삭제 오류:', error);
      throw error;
    }
  }
};

export default chatApi;