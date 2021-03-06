// data model
const Quiz = require('../models/mongoose/quiz');
const Favorite = require('../models/mongoose/favorite');

exports.getQuizzes = (req, res) => {
    Quiz.find()
        .populate('creator', 'name')
        .then(quizzes => {
            res.status(200).json(quizzes)
        })
        .catch(err => {
            res.status(500).json(err);
        });
};

exports.getQuizDetails = (req, res) => {
    if (!req.payload) {
        Quiz.findById(req.params.quizId)
            .populate('creator', 'name')
            .then(quiz => {
                if (!quiz) {
                    return res.status(404).json({
                        message: "Quiz not found"
                    });
                }
                res.status(200).json({
                    quiz,
                    isFavorited: false
                });
            })
            .catch(err => {
                res.status(500).json(err);
            });
    } else {
        const promises = [
            // Call .exec() on each query without a callback to return its promise.
            Quiz.findById(req.params.quizId).populate('creator', 'name').exec(),
            Favorite.findOne({ user_id: req.payload.userData._id, quiz_id: req.params.quizId }).exec()
        ];

        Promise.all(promises)
            .then((results) => {
                // results is an array of the results of each promise, in order.

                const quiz = results[0];
                const favorite = results[1];

                if (!quiz) {
                    return res.status(404).json({
                        message: "Quiz not found"
                    });
                };

                if (!favorite) {
                    res.status(200).json({
                        quiz,
                        isFavorited: false
                    });
                } else {
                    res.status(200).json({
                        quiz,
                        isFavorited: true
                    });
                }
            }).catch((err) => {
                res.status(500).json(err);
            });
    };
};

exports.addNewQuiz = (req, res) => {
    const quiz = new Quiz({
        title: req.body.title,
        creator: req.payload.userData._id,
        questions: req.body.questions
    });

    quiz.save()
        .then((quiz) => {
            res.status(201).json(quiz);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
};