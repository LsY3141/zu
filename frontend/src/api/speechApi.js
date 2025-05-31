import axiosInstance from './axios';

const speechApi = {
  uploadSpeechFile: (formData, onProgressUpdate) => {
    return axiosInstance.post('/speech/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgressUpdate) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgressUpdate(percentCompleted);
        }
      },
    });
  },
  checkTranscriptionStatus: (jobId) => {
    return axiosInstance.get(`/speech/status/${jobId}`);
  },
  analyzeTranscription: (transcriptionId, options) => {
    return axiosInstance.post(`/speech/analyze/${transcriptionId}`, options);
  },
  translateTranscription: (transcriptionId, targetLanguage) => {
    return axiosInstance.post(`/speech/translate/${transcriptionId}`, {
      targetLanguage,
    });
  },
  saveTranscriptionAsNote: (transcriptionId, noteData) => {
    return axiosInstance.post(`/speech/save-as-note/${transcriptionId}`, noteData);
  },
  getSpeechHistory: () => {
    return axiosInstance.get('/speech/history');
  },
};

export default speechApi;