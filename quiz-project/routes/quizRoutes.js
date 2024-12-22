import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware';
import { uploadQuiz, getPendingQuiz, getApprovedQuizzes, approveQuiz, deleteQuiz} from '../controllers/quizController';


const router = express.Router();

//Teacher upload Quiz
router.post('/upload', verifyToken, uploadQuiz);

//Admin view pending quizzes
router.get('/pending', verifyToken, isAdmin, getPendingQuiz);

//Admin approves quiz
router.put('/approved:quizId', verifyToken, isAdmin, approveQuiz);

//Get approved quizzes
router.get('/approved', verifyToken, getApprovedQuizzes);

//Delete quiz (admin or uploader)
router.delete('/:quizId', verifyToken, deleteQuiz);

module.exports = router;