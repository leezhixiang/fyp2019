const mongoose = require('mongoose')
const moment = require('moment');

const User = require('./user')
const Quiz = require('./quiz')
const HosterReport = require('./hoster_report')

const ChoiceSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    choice: {
        type: String,
        required: true
    },
    is_correct: {
        type: Boolean,
        required: true
    },
    is_answer: {
        type: Boolean
    },
    accuracy: {
        type: Number,
        default: 0
    },
    response_time: {
        type: Number,
        default: 0
    }
})

const QuestionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    question: {
        type: String,
        required: true
    },
    choices: {
        type: [ChoiceSchema]
    },
})

const ScoreboardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    }
})

const PlayerReportSchema = new mongoose.Schema({
    socket_id: {
        type: String,
        required: true
    },
    game_id: {
        type: String,
        required: true
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    played_date: {
        type: String,
        default: moment().format('YYYY-MM-DD HH:mm')
    },
    game_name: {
        type: String,
        required: true
    },
    hoster_name: {
        type: String,
        required: true
    },
    hoster_report_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HosterReport',
        required: true
    },
    // game over
    points: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    },
    correct: {
        type: Number,
        default: 0
    },
    incorrect: {
        type: Number,
        default: 0
    },
    unattempted: {
        type: Number,
        default: 0

    },
    scoreboard: {
        type: [ScoreboardSchema],
    },
    questions: {
        type: [QuestionSchema]
    }
})

module.exports = mongoose.model('PlayerReport', PlayerReportSchema, 'player_reports')