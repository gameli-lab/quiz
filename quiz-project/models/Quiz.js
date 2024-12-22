import mongoDB from 'mongoose';

const quizSchema = new mongoDB.Schema({
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    questions: {
        type: Array,
        default: [],
        required: true
    },
    uploader: {
        type: mongoDB.Schema.Types.ObjectId,
        ref: 'User'
    },
    timeLimit: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    approved: {
        type: Boolean,
        default: false
    },

});

const Quiz = mongoDB.model('Quiz', quizSchema);
module.exports = Quiz;