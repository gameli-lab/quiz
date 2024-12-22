import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [newQuiz, setNewQuiz] = useState({ subject: '', description: '', questions: [] });

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get('/api/quiz/approved', {
                headers: {Authorisation: localStorage.getItem('token')},
            });
            setQuizzes(res.data);
        } catch (err) {
            console.log('Failed to fetch quizzes', err.message);
        }
    };

    const upluadQuiz = async () => {
        try {
            await axios.post('/api/quiz/upload', newQuiz, {
                headers: {
                    Authorisation: localStorage.getItem('token'),
                },
            });
            alert('Quiz uploaded successfully!');
        } catch (err) {
            console.log('Failed to upload quiz', err.message);
        }
    };

    return (
        <div>
            <h1>TeacherDashboard</h1>
            <h2>Your Quizzes</h2>
            <ul>
                {quizzes.map((quiz) => {
                    <li key={quiz._id}>{quiz.subject}</li>
                })};
            </ul>

            <h2>Upload New Quiz</h2>
            <input type='text' placeholder='Quiz Description' value={newQuiz.description} onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })} />
            <textarea placeholder='Quiz Description' value={newQuiz.description} onChange={(e) => {setNewQuiz({ ...newQuiz, description: e.target.value})}} ></textarea>
            <button onClick={upluadQuiz}>Upload</button>
        </div>
    );
};

export default TeacherDashboard;