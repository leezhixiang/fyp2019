window.onload = () => {
    const token = JSON.parse(localStorage.getItem('auth_token'));

    // account
    if (token) {
        document.querySelectorAll('.guest').forEach(guest => {
            guest.classList.add("d-none");
        });
    } else {
        document.querySelector('.logged').classList.add("d-none");
        document.querySelector('#jewelButton').setAttribute('data-toggle', '')
    };

    // socket.io connection
    const passToken = (token) => {
        if (token) { return { query: `auth_token=${token}` } };
    };

    const notificationSocket = io('/notification', passToken(token));

    // connection failed
    notificationSocket.on('error', (err) => {
        throw new Error(err.message);
    });

    // connection successful
    notificationSocket.on('socket-conn', (data) => {
        console.log(`[socket-conn] ${data.message}`);
        console.log(`[socket-conn] token: ${data.hasToken}`);
    })

    // quizzes
    document.querySelector('#quizzes').addEventListener('click', (e) => {
        e.preventDefault();
        if (token) {
            window.location.href = "http://localhost:3000/quizzes";
        } else {
            window.location.href = "http://localhost:3000/users/login";
        }
    });

    // reports
    document.querySelector('#reports').addEventListener('click', (e) => {
        e.preventDefault();
        if (token) {
            window.location.href = "http://localhost:3000/reports";
        } else {
            window.location.href = "http://localhost:3000/users/login";
        }
    });

    // classes
    document.querySelector('#classes').addEventListener('click', (e) => {
        e.preventDefault();
        if (token) {
            window.location.href = "http://localhost:3000/classes";
        } else {
            window.location.href = "http://localhost:3000/users/login";
        }
    });

    // notification
    document.querySelector('#jewelButton').addEventListener('click', (e) => {
        if (!token) {
            return window.location.href = "http://localhost:3000/users/login";
        }
    });

    notificationSocket.on('total-notifications', (number) => {
        document.querySelector('#jewelCount').textContent += 1;
        if (number !== 0) {
            document.querySelector('#jewelCount').textContent = number;
        }
    });

    notificationSocket.on('new-notification', (content) => {
        document.querySelector('#jewelCount').classList.remove("d-none");
        document.querySelector('#jewelCount').textContent += 1;
    });

    $('#dropdownNotification').on('show.bs.dropdown', () => {
        document.querySelector('#jewelCount').textContent = 0;
        document.querySelector('#jewelCount').classList.add("d-none");

        notificationSocket.emit('read-notification', (notifications) => {
            console.log(notifications);
            if (notifications.length === 0) {
                document.querySelector('#notificationsFlyout').innerHTML = `<a class="dropdown-item" href="#">No notifications.</a>`
            } else {
                let html = "";
                notifications.forEach(notification => {
                    html += `<div class="notification-box">
                                    <div class="media">
                                        <img src="/img/avatar.jpg" width="46" height="46" alt="123" class="mr-3 rounded-circle">
                                        <div class="media-body">
                                            <div>${notification.content}</div>
                                            <small class="text-warning">${notification.time_stamp}</small>
                                        </div>
                                    </div>
                                </div>`;
                });
                document.querySelector('#notificationsFlyout').innerHTML = html;
            }
        });
    });

    // logout button
    document.querySelector("#logout").addEventListener("click", function(e) {
        localStorage.removeItem('auth_token');
        window.location.href = "http://localhost:3000/";
    });



    $('a[data-toggle="pill"]').on('shown.bs.tab', function(e) {
        // e.target // newly activated tab
        // e.relatedTarget // previous active tab

        if (e.target.id === 'pills-quizzes-tab') {

        } else if (e.target.id === 'pills-favorites-tab') {
            // get favorite quizzes
            fetch(`http://localhost:3000/api/library/favorites`, {
                    headers: {
                        'authorization': `Bearer ${token}`,
                    }
                })
                .then(res => res.json())
                .then(favorites => {
                    console.log(favorites);

                    let html = "";

                    favorites.map((favorite) => favorite.quiz_id).forEach((quiz, index) => {
                        console.log(quiz);

                        document.querySelector('#tFavorites').textContent = favorites.length;

                        html += `<div class="col-md-6">
                                    <div class="card shadow-sm mb-3">
                                        <div class="row no-gutters">
                                            <div class="col-3 border-right p-2">
                                                <img src="/img/logo.png" class="card-img-top" style="opacity: 0.2" alt="...">
                                            </div>
                                            <div class="col-9">
                                                <div class="d-flex flex-column h-100 justify-content-between">

                                                    <div class="p-2">
                                                        <div>
                                                            <div class="badge badge-primary" id="tQuestionBadge">
                                                                ${quiz.questions.length}<span>
                                                                    Questions</span></div>
                                                        </div>
                                                        <div class="mt-1">
                                                            <a href="/quizzes/${quiz._id}" class="ellipsis font-weight-bold title"
                                                                id="title">${quiz.title}</a>
                                                        </div>
                                                    </div>
                                                    <div class="d-flex flex-row justify-content-between px-2 py-1 border-top"
                                                        style="background: #f0f0f0; height: 2.0625rem">
                                                        <div class="flex-grow-1 mr-3">
                                                            <span class="font-weight-normal text-muted text-truncate"
                                                                id="creator">${quiz.creator.name}</span>
                                                        </div>
                                                        <span class="text-right font-weight-bold text-truncate"
                                                            id="tPlays">${quiz.plays} Plays</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`
                    });

                    document.querySelector('#favoriteList').innerHTML = html;

                })
                .catch(err => console.log(err));
        }
    });


    document.querySelector("#pills-shared-tab").addEventListener("click", function(e) {
        console.log('hi');
        // get shared quizzes
        fetch(`http://localhost:3000/api/library/shared`, {
                headers: {
                    'authorization': `Bearer ${token}`,
                }
            })
            .then(res => res.json())
            .then(shares => {
                console.log(shares);

                let html = "";

                shares.map((share, index) => {
                    const quiz = share.quiz_id;
                    console.log(quiz);

                    document.querySelector('#tShares').textContent = shares.length;

                    html += `<div class="col-md-6">
                                <div class="card shadow-sm mb-3">
                                    <div class="row no-gutters">
                                        <div class="col-3 border-right p-2">
                                            <img src="/img/logo.png" class="card-img-top" style="opacity: 0.2" alt="...">
                                        </div>
                                        <div class="col-9">
                                            <div class="d-flex flex-column h-100 justify-content-between">
                                                <div class="p-2">
                                                        <div class="dropdown float-right">
                                                            <button type="button" class="close" data-id="${share._id}" aria-label="Close">
                                                            <span aria-hidden="true">&times;</span>
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <div class="badge badge-primary" id="tQuestionBadge">
                                                            ${quiz.questions.length}<span>
                                                                Questions</span></div>
                                                    </div>
                                                    <div class="mt-1">
                                                        <a href="/quizzes/${quiz._id}" class="ellipsis font-weight-bold title"
                                                            id="title">${quiz.title}</a>
                                                    </div>
                                                </div>
                                                <div class="d-flex flex-row justify-content-between px-2 py-1 border-top"
                                                    style="background: #f0f0f0; height: 2.0625rem">
                                                    <div class="flex-grow-1 mr-3">
                                                        <span class="font-weight-normal text-muted text-truncate"
                                                            id="creator">${quiz.creator.name}</span>
                                                    </div>
                                                    <span class="text-right font-weight-bold text-truncate"
                                                        id="tPlays">${quiz.plays} Plays</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                });

                document.querySelector('#sharedList').innerHTML = html;

                document.querySelectorAll('.close').forEach(close => {
                    close.addEventListener('click', (e) => {
                        const quizId = e.target.parentElement.getAttribute('data-id');

                        fetch(`http://localhost:3000/api/library/shared/${quizId}`, {
                                method: 'DELETE',
                                headers: {
                                    'authorization': `Bearer ${token}`
                                }
                            })
                            .then(res => res.json())
                            .then(res => {
                                console.log(res)
                                document.querySelector('#pills-shared-tab').click();
                            })
                            .catch(err => console.log(err));
                    })
                })
            })
            .catch(err => console.log(err));
    });













};