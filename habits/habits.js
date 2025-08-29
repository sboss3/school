$(document).ready(() => {
    const OpenDB = window.indexedDB.open('HabitCounter', 3);

    OpenDB.onerror = () => {
        alert('Error loading database.');
    };

    OpenDB.onsuccess = () => {
        let db = OpenDB.result;
        console.log('Database connection successful.');

        const store = db.transaction('habit', 'readonly').objectStore('habit');
        const query = store.getAll();

        query.onsuccess = () => {
            const habitCollection = query.result;
            const habitsExists = !!habitCollection;

            if (habitsExists) {
                const data = [];
                habitCollection.forEach( habit => {
                    if (habit.active === 0) {
                        data.push({ name: habit.goodName + " | " + habit.badName, id: habit.id });
                    } else {
                        document.getElementById('current_habits').innerHTML = habit.goodName + " | " + habit.badName;
                    }
                })
                data.reverse();

                const list = document.getElementById("list");

                list.innerHTML = "";
                data.forEach((entry) => {
                        const li = document.createElement("li");
                        const a = document.createElement("a");
                        a.innerHTML = entry.name;
                        a.href = "../statistics/habit/habit.html?id=" + entry.id;
                        li.appendChild(a);
                        list.appendChild(li);
                });
            }
        }

        query.onerror = () => {
            console.error('Error querying database');
        };
    };
});