window.addEventListener("load", () => {
    const OpenDB = window.indexedDB.open('HabitCounter', 3);

    OpenDB.onerror = () => {
        alert('Error loading database.');
    };

    OpenDB.onsuccess = () => {
        let db = OpenDB.result;
        console.log('Database connection successful.');

        const habitStore = db.transaction('habit', 'readwrite').objectStore('habit');
        const habitQuery = habitStore.index('active').get(1);
        let habit;

        habitQuery.onsuccess = () => {
            habit = habitQuery.result;
            displayHabitNames(habit);
            displayStreakData(habit);

            const today = new Date().toLocaleDateString('en-CA');
            const dailyStatsStore = db.transaction('dailyStats', 'readwrite').objectStore('dailyStats');
            const dailyStatsQuery = dailyStatsStore.get(today);

            dailyStatsQuery.onsuccess = () => {
                const currentData = dailyStatsQuery.result;
                const dataIsCurrent = !!currentData;

                if (!dataIsCurrent) {
                    const stats = {
                        date: today,
                        habitID: habit.id,
                        goodCount: 0,
                        badCount: 0,
                        streakMaintained: 1 // Boolean
                    };

                    dailyStatsStore.add(stats).onsuccess = () => {
                        document.getElementById('bad_btn').addEventListener('click', () => {
                            let good = false;
                            let addition = !document.getElementById('addition_toggle').checked;
                            updateHabitCount(db, good, addition, (updatedData) => {
                                updateStreakData(db, streakBroken(habit, updatedData), today);
                            });
                        });
                        document.getElementById('good_btn').addEventListener('click', () => {
                            let good = true;
                            let addition = !document.getElementById('addition_toggle').checked;
                            updateHabitCount(db, good, addition, () => {});
                        });
                        displayHabitCount(stats);

                        let yesterday = new Date(today + "T00:00:00");
                        yesterday.setDate(yesterday.getDate() - 1);
                        yesterday = yesterday.toLocaleDateString('en-CA');
                        const previousDayQuery = dailyStatsStore.get(yesterday);

                        previousDayQuery.onsuccess = () => {
                            const yesterdayData = previousDayQuery.result;
                            const yesterdayDataExists = !!yesterdayData;
                            const skippedYesterday = yesterdayDataExists ? yesterdayData.goodCount === 0 : true;

                            updateStreakData(db, skippedYesterday, yesterday);
                        }

                        previousDayQuery.onerror = () => {
                            console.error('Error querying database')
                        }
                    };
                } else {
                    document.getElementById('bad_btn').addEventListener('click', () => {
                        let good = false;
                        let addition = !document.getElementById('addition_toggle').checked;
                        updateHabitCount(db, good, addition, (updatedData) => {
                            updateStreakData(db, streakBroken(habit, updatedData), today);
                        });
                    });
                    document.getElementById('good_btn').addEventListener('click', () => {
                        let good = true;
                        let addition = !document.getElementById('addition_toggle').checked;
                        updateHabitCount(db, good, addition, () => {});
                    });
                    displayHabitCount(currentData);
                }
            };

            dailyStatsQuery.onerror = () => {
                console.error('Error querying database');
            };

            const textarea = document.getElementById('journal_input');
            let debounceTimer;

            editJournalContent(db, textarea, textarea.value, today, false);
            textarea.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    editJournalContent(db, textarea, e.target.value, today, true)
                }, 250);
            });
        };

        habitQuery.onerror = () => {
            console.error('Error querying database');
        };
    };
});

function displayHabitCount (dailyStats) {
    document.getElementById('good_count').innerHTML = dailyStats.goodCount;
    document.getElementById('bad_count').innerHTML = dailyStats.badCount;
}

function displayHabitNames (habit) {
    document.getElementById('good_label').innerHTML = habit.goodName;
    document.getElementById('bad_label').innerHTML = habit.badName;
}

function displayStreakData (habit) {
    document.getElementById('streak_goal').innerHTML = habit.streakLengthDays;
    document.getElementById('current_streak').innerHTML = habit.currentStreakDays;
    document.getElementById('streak_bar').max = habit.streakLengthDays;
    document.getElementById('streak_bar').value = habit.currentStreakDays;
}

function displayJournal (textarea, content) {
    textarea.value = content;
}

function updateHabitCount (db, good, addition, updateStreak) {
    const today = new Date().toLocaleDateString('en-CA');
    const dailyStatsStore = db.transaction('dailyStats', 'readwrite').objectStore('dailyStats');
    const dailyStatsQuery = dailyStatsStore.get(today);

    dailyStatsQuery.onsuccess = () => {
        const currentData = dailyStatsQuery.result;
        let key = good ? 'goodCount' : 'badCount';

        if (addition) {
            currentData[key]++;
        } else if (currentData[key] > 0) {
            currentData[key]--;
        }

        dailyStatsStore.put(currentData).onsuccess = () => {
            displayHabitCount(currentData);
            updateStreak(currentData);
        };
    };

    dailyStatsQuery.onerror = () => {
        console.error('Error querying database');
    };

    const habitStore = db.transaction('habit', 'readwrite').objectStore('habit');
    const habitQuery = habitStore.index('active').get(1);

    habitQuery.onsuccess = () => {
        const habit = habitQuery.result;
        let key = good ? 'goodTotalCount' : 'badTotalCount';

        if (addition) {
            habit[key]++;
        } else if (habit[key] > 0) {
            habit[key]--;
        }

        habitStore.put(habit);
    };

    habitQuery.onerror = () => {
        console.error('Error querying database');
    };
}

function updateStreakData (db, streakBroken, date) {
    const today = new Date().toLocaleDateString('en-CA');
    let yesterday = new Date(today + "T00:00:00");
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = yesterday.toLocaleDateString('en-CA');

    const dailyStatsStore = db.transaction('dailyStats', 'readwrite').objectStore('dailyStats');
    const dailyStatsQuery = dailyStatsStore.get(date);

    dailyStatsQuery.onsuccess = () => {
        const stats = dailyStatsQuery.result;
        const statsExist = !!stats;

        if (statsExist && streakBroken) {
            stats.streakMaintained = 0;
            dailyStatsStore.put(stats);
        }
    };

    dailyStatsQuery.onerror = () => {
        console.error('Error querying database');
    };

    const habitStore = db.transaction('habit', 'readwrite').objectStore('habit');
    const habitQuery = habitStore.index('active').get(1);

    habitQuery.onsuccess = () => {
        const habit = habitQuery.result;

        if (streakBroken) {
            console.log('Streak broken!');
            habit.streakBreakDate = new Date();
            habit.currentStreakDays = 0;
            habitStore.put(habit).onsuccess = () => {
                displayStreakData(habit);
            };
        } else if (date === yesterday) {
            const dailyStatsStore = db.transaction('dailyStats', 'readonly').objectStore('dailyStats');
            const dailyStatsQuery = dailyStatsStore.get(date);

            dailyStatsQuery.onsuccess = () => {
                const stats = dailyStatsQuery.result;
                const statsExist = !!stats;

                if (statsExist && stats.streakMaintained === 1) {
                    const habitStore = db.transaction('habit', 'readwrite').objectStore('habit');
                    const habitQuery = habitStore.index('active').get(1);

                    habitQuery.onsuccess = () => {
                        const habit = habitQuery.result;

                        habit.currentStreakDays++;

                        habitStore.put(habit).onsuccess = () => {
                            displayStreakData(habit);

                            if (streakGoalReached(habit)) {
                                closeHabit(db)
                            }
                        };
                    };

                    habitQuery.onerror = () => {
                        console.error('Error querying database');
                    };
                }
            };

            dailyStatsQuery.onerror = () => {
                console.error('Error querying database');
            };
        }
    };

    habitQuery.onerror = () => {
        console.error('Error querying database');
    };
}

function streakBroken (habit, dailyStats) {
    if (habit.breakStreakOnBad === 1) {
        return dailyStats.badCount === habit.badThreshold;
    }
}

function streakGoalReached (habit) {
    return habit.streakLengthDays === habit.currentStreakDays;
}

function closeHabit (db) {
    const habitStore = db.transaction('habit', 'readwrite').objectStore('habit');
    const habitQuery = habitStore.index('active').get(1);

    habitQuery.onsuccess = () => {
        const habit = habitQuery.result;

        habit.dateClosed = new Date();
        habit.active = 0;
        habitStore.put(habit).onsuccess = () => {
            location.reload();
        };
    }

    habitQuery.onerror = () => {
        console.error('Error querying database');
    }
}

function editJournalContent (db, textarea, value, today, content) {
    const store = db.transaction('journal', 'readwrite').objectStore('journal');
    const query = store.get(today);

    query.onsuccess = () => {
        const journal = query.result;
        const journalExists = !!journal;

        if (!journalExists) {
            const journalEntry = {
                date: today,
                content: ''
            }
            store.add(journalEntry).onsuccess = () => {
                displayJournal(textarea, journalEntry.content);
            };
        } else if (content) {
            journal.content = value;
            store.put(journal).onsuccess = () => {
                console.log(journal.content);
                displayJournal(textarea, journal.content);
            };
        } else {
            displayJournal(textarea, journal.content);
        }
    }

    query.onerror = () => {
        console.error('Error querying database');
    };
}
