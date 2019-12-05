window.onload = () => {

    document.body.style.background = "#6769F0";

    const token = JSON.parse(localStorage.getItem('auth_token'));

    const passToken = (token) => {
        if (token) {
            return { query: `auth_token=${token}` }
        }
    }

    const socket = io.connect('http://localhost:3000', passToken(token));

    // connection failed
    socket.on('error', (err) => {
        throw new Error(err.message);
    });

    // connection successful
    socket.on('socket-conn', (data) => {
        console.log(`[socket-conn] ${data.message}`);
        console.log(`[socket-conn] token: ${data.hasToken}`);
    })

    let settings = {};

    // click host game button
    document.querySelector("#hostBtn").addEventListener("click", () => {
        document.querySelectorAll("input[name='settings']").forEach((setting, index) => {
            switch (index) {
                case 0:
                    settings.suffleQuestions = setting.checked;
                    break;
                case 1:
                    settings.suffleAnswerOptions = setting.checked;
                    break;
                case 2:
                    settings.questionTimer = setting.checked;
                    break;
                case 3:
                    settings.autoMoveThroughQuestions = setting.checked;
                    break;
                default:
                    // code block
            };
        });

        document.body.style.backgroundColor = "#3436BC";
        document.querySelector("#launch").remove();
        document.querySelector("#lobby").classList.remove("d-none");
        window.scrollTo(0, 0);

        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get("quizId");

        const assignClassIds = ['kdihc9'];
        // const assignClassIds = ['kdihc9', 'w0lihw'];

        socket.emit('host-game', {
            quizId,
            suffleQuestions: settings.suffleQuestions,
            suffleAnswerOptions: settings.suffleAnswerOptions,
            assignClassIds
        }, (data) => {
            const { error, message, isHosted, gameId } = data;

            if (isHosted === true) {
                document.querySelector("#gameId").textContent = gameId;
                console.log(`[host-game] ${message}`);

            } else if (isHosted === false) {
                console.log(`[host-game] ${message}`);
                console.log(`[host-game] ${error}`);
            };
        });
    });

    let autoStartTimer = 0;

    socket.on('display-name', (names) => {
        // setting: auto move through questions
        if (settings.autoMoveThroughQuestions === true) {
            // countdown timer
            clearTimeout(autoStartTimer);
            autoStartTimer = setTimeout(() => {
                document.querySelector("#startBtn").click();
            }, 15000);
        };

        let html = "";
        names.forEach((name) => {
            html += `<div class="col-md-4 col-lg-3">
                        <div class="text-center mb-3 text-truncate">
                            <h5>${name}</h5>
                        </div>
                    </div>`;
        });
        document.querySelector("#nameList").innerHTML = html;
        document.querySelector("#totalPlayers").textContent = `${names.length} Players`;
    });

    let counter = 0;
    let questionTimer = 0;

    // start game to get 1st question
    document.querySelector("#startBtn").addEventListener("click", () => {
        const btnState = true;

        socket.emit('next-question', btnState, (data) => {
            const { nextQuestion, nextQuestionData } = data;

            if (nextQuestion === true) {
                const { question, gameId } = nextQuestionData;

                // change to next question
                document.body.style.background = "#212529";
                document.querySelector("#lobby").remove();
                document.querySelector(".navbar").classList.add("d-none");
                document.querySelector("#hostGame").classList.remove("d-none");

                document.querySelector("#question").textContent = question.question;

                const choices = document.querySelectorAll(".choice");

                Array.prototype.forEach.call(choices, (choice, index) => {
                    choice.textContent = question.choices[index].choice;
                    choice.setAttribute("data-correct", question.choices[index].is_correct);
                });

                document.querySelector("#gameId").textContent = gameId;

                // setting: question timer
                if (settings.questionTimer === true) {
                    displayTimer(question.timer, counter, questionTimer);
                };

                document.querySelector('#nextBtn').setAttribute('data-state', false)

                console.log(`[start-button] next question`);
            }
        })
    })

    // next question to get next events
    document.querySelector("#nextBtn").addEventListener("click", function() {
        const btnState = ((document.querySelector('#nextBtn').getAttribute("data-state")) == 'true')

        socket.emit('next-question', btnState, (data) => {
            const { nextQuestion, isGameOver, nextQuestionData } = data;

            if (nextQuestion === true && isGameOver === false) {
                const { question, gameId } = nextQuestionData;

                // change to next question
                document.querySelector("#summary").classList.add("d-none");
                document.querySelector("#displayQuestion").classList.remove("d-none");

                document.querySelector("#question").textContent = question.question;

                document.querySelectorAll(".choice").forEach((choice, index) => {
                    choice.textContent = question.choices[index].choice;
                    choice.setAttribute("data-correct", question.choices[index].is_correct);
                });

                document.querySelectorAll(".choice").forEach((choice, index) => {
                    choice.parentElement.parentElement.classList.remove("choice-false");
                });

                document.querySelector("#gameId").textContent = gameId;

                // setting: question timer
                if (settings.questionTimer === true) {
                    displayTimer(question.timer, counter, questionTimer);
                };

                document.querySelector('#nextBtn').setAttribute('data-state', false)

                console.log(`[next-button] next question`);

            } else if (nextQuestion === false && isGameOver === false) {
                const { choicesAccuracy, questionResults, scoreBoard } = nextQuestionData;


                document.querySelector("#displayQuestion").classList.add("d-none");
                document.querySelector("#summary").classList.remove("d-none");


                document.querySelectorAll(".choice").forEach((choice, index) => {
                    const ans = choice.getAttribute("data-correct");
                    if (ans === 'false') {
                        choice.parentElement.parentElement.classList.add("choice-false");
                    }
                });

                document.querySelectorAll(".tC").forEach((tC, index) => {
                    tC.textContent = questionResults[Object.keys(questionResults)[index]];
                    document.querySelector(`#block${index+1}`).style.height = `${choicesAccuracy[Object.keys(choicesAccuracy)[index]]}%`;
                    console.log(questionResults[Object.keys(choicesAccuracy)[index]])
                })

                document.querySelector('#nextBtn').setAttribute('data-state', true)

                console.log(choicesAccuracy)
                console.log(questionResults);
                console.log(scoreBoard);

                // setting: auto move through questions
                if (settings.autoMoveThroughQuestions === true) {
                    // countdown timer
                    setTimeout(() => {
                        document.querySelector("#nextBtn").click();
                    }, 5000);
                };

            } else if (nextQuestion === false && isGameOver === true) {
                const { scoreBoard } = nextQuestionData;

                document.body.style.background = "#f2f2f2";
                document.querySelector("#hostGame").remove();
                document.querySelector("#gameOver").classList.remove("d-none");

                scoreBoard.forEach((scorer, index) => {
                    const scorerNames = document.querySelectorAll(".scorer-name");
                    const scorerPoints = document.querySelectorAll(".scorer-points");
                    scorerNames[index].textContent = scorer.name;
                    scorerPoints[index].textContent = scorer.points;
                });

                console.log(`[next-button] game over`);
                console.log(`[next]`);
                console.table(scoreBoard);
            }
        })
    })

    // when all players have answered the question
    socket.on('display-summary', function() {
        document.querySelector("#nextBtn").click()
    })

    displayTimer = (timer, counter, questionTimer) => {
        convertSeconds = (s) => {
            const min = Math.floor(s / 60);
            const sec = s % 60;
            return ("00" + min).substr(-2) + ': ' + ("00" + sec).substr(-2);
        }

        timeIt = () => {
            counter++;
            socket.emit('time-left', (timer - counter));
            document.querySelector('#timer').textContent = convertSeconds((timer - counter));

            if (counter == timer) {
                clearInterval(questionTimer);
                counter = 0;
                document.querySelector("#nextBtn").click();
            }
        }

        // initiation timer
        socket.emit('time-left', timer);
        document.querySelector('#timer').textContent = convertSeconds((timer - counter));

        questionTimer = setInterval(timeIt, 1000);

        document.querySelector("#nextBtn").addEventListener("click", () => {
            clearInterval(questionTimer);
            counter = 0;
            document.querySelector('#timer').textContent = convertSeconds((timer - timer));
        })
    }

    document.querySelectorAll(".exit").forEach((exitBtn, index) => {
        exitBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to leave?")) {
                window.location.replace("http://localhost:3000");
            }
        })
    })
}