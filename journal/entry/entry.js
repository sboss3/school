$(document).ready(() => {
    const OpenDB = window.indexedDB.open('HabitCounter', 3);

    OpenDB.onerror = () => {
        alert('Error loading database.');
    };

    OpenDB.onsuccess = () => {
        let db = OpenDB.result;
        console.log('Database connection successful.');

        const header = document.getElementById('journal_header');
        const textarea = document.getElementById('journal_input');
        const date = new URLSearchParams(window.location.search).get('date');
        let debounceTimer;

        editJournalContent(db, textarea, header, date, false);
        textarea.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                editJournalContent(db, e.target, header, date, true);
            });
        });
    };
});

function displayJournal (textarea, header, journal) {
    header.innerHTML = journal.date;
    textarea.value = journal.content;
    $('title').text(journal.date);
}

function editJournalContent (db, textarea, header, date, content) {
    const store = db.transaction('journal', 'readwrite').objectStore('journal');
    const query = store.get(date);

    query.onsuccess = () => {
        const journal = query.result;
        const journalExists = !!journal;

        if (!journalExists) {
            const journalEntry = {
                date: date,
                content: "Type something..."
            }
            store.add(journalEntry).onsuccess = () => {
                displayJournal(textarea, header, journalEntry);
            };
        } else if (content) {
            console.log(journal.content);
            journal.content = textarea.value;
            store.put(journal).onsuccess = () => {
                displayJournal(textarea, header, journal);
            };
        } else {
            displayJournal(textarea, header, journal);
        }
    }

    query.onerror = () => {
        console.error('Error querying database');
    };
}