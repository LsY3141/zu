const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// 노트 목록 조회
router.get('/', protect, noteController.getNotes);

// 공유된 노트 목록 조회
router.get('/shared', protect, noteController.getSharedNotes);

// 노트 생성
router.post('/', protect, noteController.createNote);

// 노트 공유
router.post('/share/:id', protect, noteController.shareNote);

// 노트 복원
router.put('/restore/:id', protect, noteController.restoreNote);

// 노트 영구 삭제 (이 라우트는 /permanent/:id 보다 먼저 위치해야 함)
router.delete('/permanent/:id', protect, noteController.deleteNotePermanently);

// 노트 상세 조회
router.get('/:id', protect, noteController.getNoteById);

// 노트 수정
router.put('/:id', protect, noteController.updateNote);

// 노트 삭제 (휴지통으로 이동)
router.delete('/:id', protect, noteController.moveNoteToTrash);

module.exports = router;