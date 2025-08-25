window.addEventListener("load", () => {
    const OpenDB = window.indexedDB.open('HabitCounter', 3);

    OpenDB.onerror = () => {
        alert('Error loading database.');
    };

    OpenDB.onsuccess = () => {
        let db = OpenDB.result;
        console.log('Database connection successful.');

        const habitID = +new URLSearchParams(window.location.search).get('id');
        const habitStore = db.transaction('habit', 'readonly').objectStore('habit');
        const habitQuery = habitStore.get(habitID);

        habitQuery.onsuccess = () => {
            const habit = habitQuery.result;

            const table = document.getElementById('stats_table');
            const statsStore = db.transaction('dailyStats', 'readonly').objectStore('dailyStats');
            const statsQuery = statsStore.index('habitID').getAll(habitID);

            statsQuery.onsuccess = () => {
                const stats = statsQuery.result;
                stats.reverse();
                const dates = [];
                const goodCounts = [];
                const badCounts = [];

                table.innerHTML = "";
                const header = document.createElement("tr");

                const columnTitles = ['Date', habit.goodName, habit.badName, 'Streak Maintained'];
                columnTitles.forEach( title => {
                    const column = document.createElement('th');
                    column.innerHTML = title;
                    header.append(column);
                });
                table.append(header);

                stats.forEach( day => {
                    const row = document.createElement('tr');
                    Object.keys(day).forEach( key => {
                        if (key !== 'habitID') {
                            const cell = document.createElement('td');
                            cell.innerHTML = key === 'streakMaintained' ? day[key] === 1 ? 'yes' : 'no' : day[key];
                            row.append(cell);

                            switch (key) {
                                case 'date':
                                    dates.push(day[key]);
                                    break;
                                case 'goodCount':
                                    goodCounts.push(day[key]);
                                    break;
                                case 'badCount':
                                    badCounts.push(day[key]);
                                    break;
                                default:
                                    break;
                            }
                        }
                    })
                    table.append(row);
                });

                goodCounts.reverse();
                badCounts.reverse();
                dates.reverse();

                const ctx = document.getElementById('chart');

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: habit.goodName,
                                data: goodCounts,
                                borderColor: 'rgb(50, 200, 150)',
                                backgroundColor: 'rgb(50, 200, 150)',
                                tension: 0.4
                            },
                            {
                                label: habit.badName,
                                data: badCounts,
                                borderColor: 'rgb(255, 90, 120)',
                                backgroundColor: 'rgb(255, 90, 120)',
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                },
                                grid: {
                                    display: false
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }

                            }
                        }
                    }
                });
            }

            statsQuery.onerror = () => {
                console.error('Error querying database');
            };
        }

        habitQuery.onerror = () => {
            console.error('Error querying database');
        };
    };
});