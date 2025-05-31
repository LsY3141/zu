import axios from './axios';

// 노트 목록 조회
const getNotes = async (params = {}) => {
  try {
    const response = await axios.get('/notes', { params });
    // 응답 형식 로깅
    console.log('getNotes 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('노트 목록 조회 오류:', error);
    throw error;
  }
};

// 노트 상세 조회
const getNoteById = async (id) => {
  try {
    const response = await axios.get(`/notes/${id}`);
    console.log('getNoteById 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('노트 상세 조회 오류:', error);
    throw error;
  }
};

// 노트 생성
const createNote = async (noteData) => {
  try {
    const response = await axios.post('/notes', noteData);
    console.log('createNote 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('노트 생성 오류:', error);
    throw error;
  }
};

// 노트 수정
const updateNote = async (id, noteData) => {
  try {
    const response = await axios.put(`/notes/${id}`, noteData);
    console.log('updateNote 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('노트 수정 오류:', error);
    throw error;
  }
};

// 노트 삭제 (휴지통으로 이동)
const trashNote = async (id) => {
  try {
    const response = await axios.delete(`/notes/${id}`);
    console.log('trashNote 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('노트 삭제 오류:', error);
    throw error;
  }
};

// 노트 영구 삭제
const deleteNote = async (id) => {
  try {
    const response = await axios.delete(`/notes/permanent/${id}`);
    console.log('deleteNote 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('노트 영구 삭제 오류:', error);
    throw error;
  }
};

// 노트 복원
const restoreNote = async (id) => {
  try {
    const response = await axios.put(`/notes/restore/${id}`);
    console.log('restoreNote 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('노트 복원 오류:', error);
    throw error;
  }
};

// 공유된 노트 목록 조회
const getSharedNotes = async () => {
  try {
    const response = await axios.get('/notes/shared');
    console.log('getSharedNotes 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('공유 노트 목록 조회 오류:', error);
    throw error;
  }
};

// 노트 공유
const shareNote = async (id, shareData) => {
  try {
    const response = await axios.post(`/notes/share/${id}`, shareData);
    console.log('shareNote 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('노트 공유 오류:', error);
    throw error;
  }
};

export default {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  trashNote,
  deleteNote,
  restoreNote,
  getSharedNotes,
  shareNote
};