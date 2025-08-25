const OpenDB = window.indexedDB.open('HabitCounter', 3);

OpenDB.onerror = () => {
    alert('Error loading database.');
};

OpenDB.onsuccess = () => {
    let db = OpenDB.result;

    console.log('Database initialised.');

    checkActiveHabit(db);
};

OpenDB.onupgradeneeded = (event) => {
    let db = event.target.result;

    db.onerror = () => {
        alert('Error loading database.');
    };

    db.onversionchange = () => {
        db.close();
        alert('An update is available. Please refresh the page.');
    };

    const journal = db.createObjectStore('journal', { keyPath: 'date' });
    journal.createIndex('content', 'content', {unique: false});

    const habit = db.createObjectStore('habit', { keyPath: 'id', autoIncrement: true });
    habit.createIndex('goodName', 'goodName', { unique: false });
    habit.createIndex('badName', 'badName', { unique: false });
    habit.createIndex('goodTotalCount', 'goodTotalCount', { unique: false });
    habit.createIndex('badTotalCount', 'badTotalCount', { unique: false });
    habit.createIndex('streakLengthDays', 'streakLengthDays', { unique: false });
    habit.createIndex('currentStreakDays', 'currentStreakDays', { unique: false });
    habit.createIndex('streakBreakDate', 'streakBreakDate', { unique: true });
    habit.createIndex('breakStreakOnBad', 'breakStreakOnBad', { unique: false });
    habit.createIndex('badThreshold', 'badThreshold', { unique: false });
    habit.createIndex('dateCreated', 'dateCreated', { unique: true });
    habit.createIndex('dateClosed', 'dateClosed', { unique: true });
    habit.createIndex('active', 'active', { unique: false });

    const dailyStats = db.createObjectStore('dailyStats', { keyPath: 'date' });
    dailyStats.createIndex('habitID', 'habitID', { unique: false });
    dailyStats.createIndex('goodCount', 'goodCount', { unique: false });
    dailyStats.createIndex('badCount', 'badCount', { unique: false });
    dailyStats.createIndex('streakMaintained', 'streakMaintained', { unique: false });

    const defaultSettings = db.createObjectStore('defaultSettings', { keyPath: 'settings' });
    defaultSettings.createIndex('streakLengthDays', 'streakLengthDays', { unique: false });
    defaultSettings.createIndex('breakStreakOnBad', 'breakStreakOnBad', { unique: false });
    defaultSettings.createIndex('badThreshold', 'badThreshold', { unique: false });
}

OpenDB.onblocked = () => {
    alert('Update available. Please close other tabs using this app and refresh the current page.');
};

function checkActiveHabit (db) {
    const store = db.transaction('habit', 'readonly').objectStore('habit');
    const query = store.index('active').get(1);

    query.onsuccess = () => {
        const habit = query.result;
        const activeHabitExists = !!habit;

        if (activeHabitExists) {
            console.log("Active habit found.");
        } else if (window.location.href.includes("edit")) {
            alert('You have no active habits! You can create some using the form on this page.');
        } else {
            alert('You have no active habits! Redirecting to habit creation page.');
            window.location.href = "./habits/edit/edit.html";
        }
    };

    query.onerror = () => {
        console.error('Error querying active habit');
    };
}