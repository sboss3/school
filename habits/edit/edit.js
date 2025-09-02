$(document).ready(() => {
    const OpenDB = window.indexedDB.open('HabitCounter', 3);

    const form = document.getElementById('habit_form');
    const inputs = form.querySelectorAll('input');

    OpenDB.onerror = () => {
        alert('Error loading database.');
    };

    OpenDB.onsuccess = () => {
        let db = OpenDB.result;

        console.log('Database connection successful.');

        const store = db.transaction('habit', 'readwrite').objectStore('habit');
        const query = store.index('active').get(1);

        query.onsuccess = () => {
            const habit = query.result;
            const activeHabitExists = !!habit;
            let debounceTimer;

            /*for (let i = 2; i < 7; i++) {
                const store = db.transaction('habit', 'readwrite').objectStore('habit');

                const date = new Date();
                date.setDate(date.getDate() - i);
                const habit = {
                    goodName: 'Good',
                    badName: 'Bad',
                    goodTotalCount: 3,
                    badTotalCount: 1,
                    streakLengthDays: 21,
                    currentStreakDays: 21,
                    streakBreakDate: date,
                    breakStreakOnBad: 1,
                    badThreshold: 3,
                    dateCreated: date.toLocaleDateString('en-CA'),
                    dateClosed: date,
                    active: 0
                };
                store.add(habit);
            }*/

            if (!activeHabitExists) {
                $.ajax({
                    url: "https://api.api-ninjas.com/v1/hobbies?category=sports_and_outdoors",
                    method: "GET",
                    headers: {
                        "X-Api-Key": "k2bbUYV2dhB/8To+2oWclw==ZfRAp3aMEYaQLYSv"
                    },
                    success: function(data) {
                        $("#idea").fadeIn();
                        $("#hobby_name").text(data.hobby).fadeIn();
                        $("#hobby_link").attr("href", data.link).text('Learn about it here').fadeIn();
                    },
                    error: function(xhr, status, error) {
                        console.error("Error fetching hobby:", error);
                    }
                });

                const settingsStore = db.transaction('defaultSettings', 'readwrite').objectStore('defaultSettings');
                const settingsQuery = settingsStore.get('default');

                settingsQuery.onsuccess = () => {
                    let defaults = settingsQuery.result;

                    if (!!defaults) {
                        createHabit(db, inputs, defaults, updateHabitForm);
                    } else {
                        defaults = {
                            streakLengthDays: 21,
                            breakStreakOnBad: 1,
                            badThreshold: 3
                        }
                        createHabit(db, inputs, defaults, updateHabitForm);
                    }
                }

                settingsQuery.onerror = () => {
                    console.error('Error querying database');
                };
            } else {
                updateHabitForm(habit, inputs);
            }

            inputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        editHabit(db, input, e.target.value);
                    }, 250);
                });
            });
        };

        query.onerror = () => {
            console.error('Error querying database');
        };
    };
});

function createHabit (db, inputs, defaults, updateUI) {
    const store = db.transaction('habit', 'readwrite').objectStore('habit');

    const habit = {
        goodName: 'Good',
        badName: 'Bad',
        goodTotalCount: 0,
        badTotalCount: 0,
        streakLengthDays: defaults.streakLengthDays,
        currentStreakDays: 0,
        streakBreakDate: new Date(),
        breakStreakOnBad: defaults.breakStreakOnBad,
        badThreshold: defaults.badThreshold,
        dateCreated: new Date().toLocaleDateString('en-CA'),
        dateClosed: null,
        active: 1
    };
    store.add(habit).onsuccess = () => {
        updateUI(habit, inputs);
    };
}

function editHabit (db, input, value) {
    const store = db.transaction('habit', 'readwrite').objectStore('habit');
    const query = store.index('active').get(1);

    query.onsuccess = () => {
        const habit = query.result;
        switch (input.id) {
            case "good_habit":
                habit.goodName = value;
                break;
            case "bad_habit":
                habit.badName = value;
                break;
            case "streak_length":
                habit.streakLengthDays = +value;
                $('#streak_length_display').text(value);
                break;
            case "streak_break":
                habit.breakStreakOnBad = input.checked ? 1 : 0;
                break;
            case "num_bad_for_break":
                habit.badThreshold = +value;
                break;
            default:
                console.log("Error: element not found.");
        }
        store.put(habit);
    }

    query.onerror = () => {
        console.error('Error querying database');
    };
}

function updateHabitForm (habit, inputs) {
    inputs.forEach(input => {
        switch (input.id) {
            case "good_habit":
                input.value = habit.goodName;
                break;
            case "bad_habit":
                input.value = habit.badName;
                break;
            case "streak_length":
                input.value = habit.streakLengthDays;
                $('#streak_length_display').text(habit.streakLengthDays);
                break;
            case "streak_break":
                input.checked = habit.breakStreakOnBad === 1;
                break;
            case "num_bad_for_break":
                input.value = habit.badThreshold;
                break;
            default:
                console.log("Error: element not found.");
        }
    });
}
