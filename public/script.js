document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname.split("/").pop().split(".")[0] || "index"; // Detects the current page

    let jsonFile = "";
    
    switch (page) {
        case "index":
            jsonFile = "overview.json";
            break;
        case "timeline":
            jsonFile = "timeline.json";
            break;
        case "future":
            jsonFile = "future.json";
            break;
        default:
            jsonFile = "overview.json"; // Default to index if unknown page
    }

    fetch(`/data/${jsonFile}`)
        .then(response => response.json())
        .then(data => {
            console.log(`✅ Loaded ${jsonFile} successfully`, data);

            if (page === "index") {
                insertFormattedOverview(data.general_overview);
                updateStats(data);
                createCharts(data.metadata_for_graphs);
                populateTables(data);
                animateNumbers();
            } else if (page === "timeline") {
                document.getElementById("timeline-description").innerText = data.description;
                // Render timeline, flowchart, and infrastructure details
                renderTimeline(data.milestones);
                renderSubmarineCables(data.submarine_cables);
                renderInfrastructure(data.infrastructure_expansion);
                renderMermaidFlowchart(data.milestones);
            } else if (page === "future") {
                renderFuturePredictions(data);
            }
        })
        .catch(error => console.error(`❌ Error fetching ${jsonFile}:`, error));
});

// Index.html Page Functions
// Insert formatted overview text
function insertFormattedOverview(text) {
    const overviewSection = document.getElementById("general-overview");
    overviewSection.innerHTML = `
        <p>
            <strong>📌 Bangladesh’s Internet Evolution</strong><br>
            The journey began in the early 1990s with limited dial-up email services via bulletin board systems. 
            By <strong>1996</strong>, the first full-fledged internet service was introduced via VSAT technology.
        </p>

        <ul class="highlight-list">
            <li>📡 <strong>1996:</strong> First ISP licenses issued, paving the way for mass adoption.</li>
            <li>🌍 <strong>2006:</strong> Bangladesh connects to the global internet backbone via its first submarine cable.</li>
            <li>📶 <strong>2013:</strong> 3G launched, bringing faster mobile internet to millions.</li>
            <li>🚀 <strong>2018:</strong> 4G coverage extended to all districts, enabling rapid digital transformation.</li>
        </ul>

        <p>
            🚀 As of <strong>2023</strong>, Bangladesh boasts **131 million internet users**, with 
            <span class="stat-highlight">${text.match(/\d+(\.\d+)? million mobile data users/)[0]}</span> 
            using mobile internet and <span class="stat-highlight">${text.match(/\d+(\.\d+)? million fixed broadband subscribers/)[0]}</span> 
            connected via broadband. The Digital Bangladesh initiative continues to expand high-speed connectivity nationwide.
        </p>
    `;
}

// Update stats dynamically
function updateStats(data) {
    const stats = {
        "total-users": data.key_statistics.internet_users["2023"],
        "mobile-users": data.key_statistics.mobile_internet_subscribers["2023"],
        "broadband-users": data.key_statistics.fixed_broadband_subscribers["2023"],
        "penetration": parseFloat(data.key_statistics.broadband_penetration_percent["2023"])
    };

    Object.keys(stats).forEach(statId => {
        const target = stats[statId];
        const progressText = document.getElementById(statId);
        const progressCircle = progressText.previousElementSibling;

        let count = 0;
        let increment = Math.ceil(target / 100);
        let interval = setInterval(() => {
            count += increment;
            if (count >= target) {
                count = target;
                clearInterval(interval);
            }
            progressText.textContent = count.toLocaleString();
            progressCircle.style.strokeDashoffset = 100 - (count / target) * 100;
        }, 20);
    });

    // Adjust Circular Progress Size for Mobile
    if (window.innerWidth < 768) {
        document.querySelectorAll(".circular-progress").forEach(el => {
            el.style.width = "90px";
            el.style.height = "90px";
        });
    }
}

// Create charts using Chart.js with improved readability
function createCharts(graphData) {
    new Chart(document.getElementById('userGrowthChart'), {
        type: 'line',
        data: {
            labels: graphData.internet_users_over_time.map(d => d.year),
            datasets: [{
                label: 'Internet Users (millions)',
                data: graphData.internet_users_over_time.map(d => d.users),
                borderColor: '#ffcc00',
                backgroundColor: "rgba(255, 204, 0, 0.2)",
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: "#ffcc00",
                pointBorderColor: "#333"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "white",
                        font: { size: 16, weight: "bold" }
                    }
                },
                tooltip: {
                    titleFont: { size: 14, weight: "bold" },
                    bodyFont: { size: 14 },
                    displayColors: false
                }
            },
            scales: {
                x: {
                    ticks: { color: "white", font: { size: 14, weight: "bold" } }
                },
                y: {
                    ticks: { color: "white", font: { size: 14, weight: "bold" } }
                }
            }
        }
    });

    new Chart(document.getElementById('mobileVsBroadbandChart'), {
        type: 'bar',
        data: {
            labels: graphData.mobile_vs_broadband_subscribers.map(d => d.year),
            datasets: [
                {
                    label: "Mobile Users",
                    data: graphData.mobile_vs_broadband_subscribers.map(d => d.mobile_users),
                    backgroundColor: "rgba(0, 150, 255, 0.7)",
                    borderColor: "#0096FF",
                    borderWidth: 2
                },
                {
                    label: "Broadband Users",
                    data: graphData.mobile_vs_broadband_subscribers.map(d => d.fixed_broadband_users),
                    backgroundColor: "rgba(255, 99, 132, 0.7)",
                    borderColor: "#FF6384",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "white",
                        font: { size: 16, weight: "bold" }
                    }
                },
                tooltip: {
                    titleFont: { size: 14, weight: "bold" },
                    bodyFont: { size: 14 },
                    displayColors: true
                }
            },
            scales: {
                x: {
                    ticks: { color: "white", font: { size: 14, weight: "bold" } }
                },
                y: {
                    ticks: { color: "white", font: { size: 14, weight: "bold" } }
                }
            }
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "white",
                        font: { size: 16, weight: "bold" }
                    }
                },
                tooltip: {
                    titleFont: { size: 14, weight: "bold" },
                    bodyFont: { size: 14 }
                }
            }
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



// Timeline.html Page Functions
// **Function to Render Timeline**
function renderTimeline(events) {
    const timelineContainer = document.getElementById("timeline");

    if (!timelineContainer) {
        console.error("❌ Timeline container not found in HTML!");
        return;
    }

    if (!events || events.length === 0) {
        timelineContainer.innerHTML = "<p style='color: red;'>No timeline data available.</p>";
        return;
    }

    timelineContainer.innerHTML = ""; // Clear previous content

    events.forEach(event => {
        const eventElement = document.createElement("div");
        eventElement.classList.add("timeline-event");

        eventElement.innerHTML = `
            <div class="timeline-year">${event.year}</div>
            <div class="timeline-content">
                <div class="timeline-icon">${event.icon}</div>
                <h3>${event.event}</h3>
                <p><strong>${event.date}</strong></p>
                <p>${event.details}</p>
                <img src="${event.image}" class="timeline-image" alt="${event.event}">
            </div>
        `;

        timelineContainer.appendChild(eventElement);
    });

    // Ensure elements become visible
    setTimeout(() => {
        document.querySelectorAll(".timeline-event").forEach(event => {
            event.classList.add("visible");
        });
    }, 100);

    console.log("✅ Timeline Events Rendered Successfully");
}

// **Function to Render Submarine Cables**
function renderSubmarineCables(cables) {
    const timelineContainer = document.getElementById("timeline");

    cables.forEach(cable => {
        const cableElement = document.createElement("div");
        cableElement.classList.add("timeline-event");

        cableElement.innerHTML = `
            <div class="timeline-year">${cable.launch_year}</div>
            <div class="timeline-content">
                <div class="timeline-icon">${cable.icon}</div>
                <h3>${cable.name}</h3>
                <p><strong>Landing Point:</strong> ${cable.landing_point}</p>
                <p><strong>Capacity:</strong> ${cable.capacity}</p>
                <img src="${cable.image}" class="timeline-image" alt="${cable.name}">
            </div>
        `;

        timelineContainer.appendChild(cableElement);
    });

    console.log("✅ Submarine Cables Rendered Successfully");
}

// **Function to Render Infrastructure Expansion**
function renderInfrastructure(events) {
    const timelineContainer = document.getElementById("timeline");

    events.forEach(event => {
        const infraElement = document.createElement("div");
        infraElement.classList.add("timeline-event");

        infraElement.innerHTML = `
            <div class="timeline-year">${event.year}</div>
            <div class="timeline-content">
                <div class="timeline-icon">${event.icon}</div>
                <h3>${event.event}</h3>
                <p>${event.details}</p>
                <img src="${event.image}" class="timeline-image" alt="${event.event}">
            </div>
        `;

        timelineContainer.appendChild(infraElement);
    });

    console.log("✅ Infrastructure Expansion Rendered Successfully");
}

// **Function to Render Mermaid.js Flowchart**
function renderMermaidFlowchart(events) {
    if (!events || events.length === 0) {
        console.warn("⚠️ No data for Mermaid.js flowchart.");
        return;
    }

    let mermaidCode = "graph TD;\n";
    events.forEach(event => {
        mermaidCode += `  ${event.year}["${event.year} - ${event.event}"] -->|${event.category}| next;\n`;
    });

    document.getElementById("mermaid-container").innerHTML = `<pre class="mermaid">${mermaidCode}</pre>`;
    mermaid.init();
}