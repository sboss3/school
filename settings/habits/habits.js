window.addEventListener("load", () => {
    const OpenDB = window.indexedDB.open('HabitCounter', 3);

    const form = document.getElementById('habit_form');
    const inputs = form.querySelectorAll('input');

    OpenDB.onerror = () => {
        alert('Error loading database.');
    };

    OpenDB.onsuccess = () => {
        let db = OpenDB.result;

        console.log('Database connection successful.');

        const store = db.transaction('defaultSettings', 'readwrite').objectStore('defaultSettings');
        const query = store.get('default');

        query.onsuccess = () => {
            const settings = query.result;
            const settingsExists = !!settings;
            let debounceTimer;

            if (!settingsExists) {
                createDefaultSettings(db, inputs, updateSettingsForm);
            } else {
                updateSettingsForm(settings, inputs);
            }

            inputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        editSettings(db, input, e.target.value);
                    }, 250);
                });
            });
        };

        query.onerror = () => {
            console.error('Error querying database');
        };
    };
});

function createDefaultSettings (db, inputs, updateUI) {
    const store = db.transaction('defaultSettings', 'readwrite').objectStore('defaultSettings');

    const defaults = {
        settings: 'default',
        streakLengthDays: 21,
        breakStreakOnBad: 1,
        badThreshold: 3
    };
    store.add(defaults).onsuccess = () => {
        updateUI(defaults, inputs);
    };
}

function editSettings (db, input, value) {
    const store = db.transaction('defaultSettings', 'readwrite').objectStore('defaultSettings');
    const query = store.get('default');

    query.onsuccess = () => {
        const defaults = query.result;
        switch (input.id) {
            case "streak_length":
                defaults.streakLengthDays = +value;
                break;
            case "streak_break":
                defaults.breakStreakOnBad = input.checked ? 1 : 0;
                break;
            case "num_bad_for_break":
                defaults.badThreshold = +value;
                break;
            default:
                console.log("Error: element not found.");
        }
        store.put(defaults);
    }

    query.onerror = () => {
        console.error('Error querying database');
    };
}

function updateSettingsForm (settings, inputs) {
    inputs.forEach(input => {
        switch (input.id) {
            case "streak_length":
                input.value = settings.streakLengthDays;
                break;
            case "streak_break":
                input.checked = settings.breakStreakOnBad === 1;
                break;
            case "num_bad_for_break":
                input.value = settings.badThreshold;
                break;
            default:
                console.log("Error: element not found.");
        }
    });
}