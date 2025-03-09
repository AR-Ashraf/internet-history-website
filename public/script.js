document.addEventListener("DOMContentLoaded", () => {
    fetch('data/overview.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById("general-overview").innerText = data.general_overview;
            document.getElementById("total-users").innerText = data.key_statistics.internet_users["2023"];
            document.getElementById("mobile-users").innerText = data.key_statistics.mobile_internet_subscribers["2023"];
            document.getElementById("broadband-users").innerText = data.key_statistics.fixed_broadband_subscribers["2023"];
            document.getElementById("penetration").innerText = data.key_statistics.broadband_penetration_percent["2023"];

            createCharts(data.metadata_for_graphs);
            populateTables(data);
            animateNumbers();
        })
        .catch(error => console.error("Error fetching data:", error));
});

// Create charts using Chart.js
function createCharts(graphData) {
    new Chart(document.getElementById('userGrowthChart'), {
        type: 'line',
        data: {
            labels: graphData.internet_users_over_time.map(d => d.year),
            datasets: [{
                label: 'Internet Users',
                data: graphData.internet_users_over_time.map(d => d.users),
                borderColor: '#ff6600',
                fill: true
            }]
        }
    });

    new Chart(document.getElementById('mobileVsBroadbandChart'), {
        type: 'bar',
        data: {
            labels: graphData.mobile_vs_broadband_subscribers.map(d => d.year),
            datasets: [
                { label: 'Mobile Users', data: graphData.mobile_vs_broadband_subscribers.map(d => d.mobile_users), backgroundColor: '#4caf50' },
                { label: 'Broadband Users', data: graphData.mobile_vs_broadband_subscribers.map(d => d.fixed_broadband_users), backgroundColor: '#2196F3' }
            ]
        }
    });

    new Chart(document.getElementById('submarineCablesChart'), {
        type: 'pie',
        data: {
            labels: ['SEA-ME-WE 4', 'SEA-ME-WE 5', 'SEA-ME-WE 6'],
            datasets: [{
                data: [1280, 24000, 30000],
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF']
            }]
        }
    });
}

// Populate comparison tables
function populateTables(data) {
    const ispTable = document.getElementById("isp-table");
    const submarineTable = document.getElementById("submarine-table");

    data.metadata_for_graphs.isp_category_counts_2023.forEach(item => {
        const row = `<tr><td>${item.category}</td><td>${item.count}</td></tr>`;
        ispTable.innerHTML += row;
    });

    data.infrastructure.submarine_cables.forEach(cable => {
        const row = `<tr><td>${cable.name}</td><td>${cable.launch_year}</td><td>${cable.capacity}</td></tr>`;
        submarineTable.innerHTML += row;
    });
}

// Animate numbers on scroll
function animateNumbers() {
    const counters = document.querySelectorAll(".counter");
    counters.forEach(counter => {
        let target = parseInt(counter.innerText);
        let count = 0;
        let increment = Math.ceil(target / 100);

        let interval = setInterval(() => {
            count += increment;
            if (count >= target) {
                counter.innerText = target;
                clearInterval(interval);
            } else {
                counter.innerText = count;
            }
        }, 20);
    });
}