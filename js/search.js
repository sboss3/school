const data = [
    { date: "2025-08-01" },
    { date: "2025-08-02" },
    { date: "2024-07-01" },
    { date: "2025-08-01" },
    { date: "2023-06-15" },
    { date: "2025-12-25" },
    { date: "2022-01-01" },
    { date: "2025-08-03" },
    { date: "2025-08-04" },
    { date: "2025-08-05" },
    { name: "Daily exercise | Skipping workouts", date: "2025-08-01" },
    { name: "Reading books | Doomscrolling", date: "2025-08-02" },
    { name: "Healthy eating | Late-night snacking", date: "2025-08-03" },
    { name: "Meditation | Constant multitasking", date: "2025-08-04" },
    { name: "Waking up early | Oversleeping", date: "2025-08-05" },
    { name: "Staying hydrated | Excess caffeine", date: "2025-08-06" },
    { name: "Journaling | Bottling emotions", date: "2025-08-07" },
    { name: "Budgeting | Impulse spending", date: "2025-08-08" },
    { name: "Time blocking | Procrastination", date: "2025-08-09" },
    { name: "Gratitude practice | Complaining", date: "2025-08-10" }
];

const search_box = document.getElementById("search");
const list = document.getElementById("list");

const searchData = (search_term) => {
    list.innerHTML = "";
    data
        .filter((entry) => {
            return (
                (entry.date
                    ? entry.date.toLowerCase().includes(search_term)
                    : console.log("This entry has no date field")
                )
                ||
                (entry.name
                    ? entry.name.toLowerCase().includes(search_term)
                    : console.log("This entry has no name field")
                )
            );
        })
        .forEach((entry) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.innerHTML = entry.name ? entry.name : entry.date;
            a.href = "../statistics/habit/habit.html";
            li.appendChild(a);
            list.appendChild(li);
        });
};

searchData("");

search_box.addEventListener("input", (event) => {
    searchData(event.target.value.toLowerCase());
});
