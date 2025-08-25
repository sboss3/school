window.addEventListener("load", () => {
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
                        const mainLink = document.getElementById('current_habits');
                        mainLink.innerHTML = habit.goodName + " | " + habit.badName;
                        mainLink.href = './habit/habit.html?id=' + habit.id;
                    }
                })
                data.reverse();

                const search_box = document.getElementById("search");
                const list = document.getElementById("list");

                const searchData = (search_term) => {
                    list.innerHTML = "";
                    data.filter((entry) => {
                        return entry.name.toLowerCase().includes(search_term);
                    })
                    .forEach((entry) => {
                        const li = document.createElement("li");
                        const a = document.createElement("a");
                        a.innerHTML = entry.name;
                        a.href = "./habit/habit.html?id=" + entry.id;
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