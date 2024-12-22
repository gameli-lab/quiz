import Quiz from '../models/Quiz';
//import User from '../models/User';

// Teacher uploads quiz
exports.uploadQuiz = async (req, res) => {
    const { subject, description, questions } = req.body;
    if (!subject || !questions || questions.length === 0) {
        return res.status(400).json({ message: 'Quiz subject and questions are required'});
    }
    try {
        const quiz = new Quiz({
            subject,
            description,
            questions,
            uploader: req.user.id,
        });

        await quiz.save();
        res.status(200).json({ message: "Quiz uploaded successfully and awaiting admin approval."});
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
};

// Admin fetching quizes for approval
exports.getPendingQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ approved:false}).populate('uploader', 'fullname email');
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

exports.approveQuiz = async (req, res) => {
    const { quizId } = req.params;
    try {
        const quiz = await Quiz.findOne(quizId);
        if (!quiz) return
        res.status(404).json({ message: 'Quiz not found.'});
        quiz.approve = true;
        await quiz.save();
        res.status(200).json({message: 'Quiz approved successfully.'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Fetch approved quizzes
exports.getApprovedQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ approved:true });
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

//Delete a quiz
exports.deleteQuiz = async (res, req) => {
    const { quizId } = req.params;
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return
        res.status(404).json({ message: 'Quiz not found.'});
        //Make sure only admin and the uploader can delete
        if (req.user.role !== 'admin' && req.user.id !== String(quiz.uploader)) {
            return res.status(403).json({ message: 'You are not authorised to delete this quiz.'});
        }
        await quiz.remove();
        res.status(200).json({ message: 'Quiz deleted successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};