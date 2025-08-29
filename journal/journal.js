$(document).ready(() => {
    const OpenDB = window.indexedDB.open('HabitCounter', 3);

    OpenDB.onerror = () => {
        alert('Error loading database.');
    };

    OpenDB.onsuccess = () => {
        let db = OpenDB.result;
        console.log('Database connection successful.');

        const textarea = document.getElementById('journal_input');
        const today = new Date().toLocaleDateString('en-CA');
        let debounceTimer;

        /*for (let i = 1; i < 22; i++) {
            let date = new Date();
            date.setDate(date.getDate() - i);
            date = date.toLocaleDateString('en-CA');
            editJournalContent(db, textarea, textarea.value, date, false);
        }*/

        editJournalContent(db, textarea, textarea.value, today, false);
        textarea.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                editJournalContent(db, textarea, e.target.value, today, true)
            });
        });

        const store = db.transaction('journal', 'readwrite').objectStore('journal');
        const query = store.getAll();

        query.onsuccess = () => {
            const journalCollection = query.result;
            const journalsExists = !!journalCollection;

            if (journalsExists) {
                const data = [];
                journalCollection.forEach( entry => {
                    if (entry.date !== today) {
                        data.push({date: entry.date});
                    }
                })
                data.reverse();

                const search_box = document.getElementById("search");
                const list = document.getElementById("list");

                const searchData = (search_term) => {
                    list.innerHTML = "";
                    data.filter((entry) => {
                        return entry.date.toLowerCase().includes(search_term);
                    })
                    .forEach((entry) => {
                        const li = document.createElement("li");
                        const a = document.createElement("a");
                        a.innerHTML = entry.date;
                        a.href = "../journal/entry/entry.html?date=" + entry.date;
                        li.appendChild(a);
                        list.appendChild(li);
                    });
                };

                searchData("");

                search_box.addEventListener("input", (event) => {
                    searchData(event.target.value.toLowerCase());
                });
            }
        }

        query.onerror = () => {
            console.error('Error querying database');
        };
    };
});

function displayJournal (textarea, content) {
    textarea.value = content;
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
                content: "Type something..."
            }
            store.add(journalEntry).onsuccess = () => {
                displayJournal(textarea, journalEntry.content);
            };
        } else if (content) {
            console.log(journal.content);
            journal.content = value;
            store.put(journal).onsuccess = () => {
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