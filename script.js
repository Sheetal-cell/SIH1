let isRecording = false;
let currentUser = '';
let complaints = [];
let map;
let customComplaintCount = 0;
let intervalId;

// alag random icon appear hoga
const issueIcons = {
    'Overfilled Dustbin': new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    'Broken Streetlight': new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    'Pothole on Road': new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    'Illegal Dumping': new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    'Applying Bamboo on Students': new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    'Resolved': new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    })
};

function showTab(tabName) {
    // Hide all forms
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected form and activate button
    document.getElementById(tabName + 'Form').classList.add('active');
    event.target.classList.add('active');
}

function userLogin() {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    if (email && password) {
        currentUser = email;
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('userDashboard').classList.add('active');
    } else {
        alert('Please fill in all fields');
    }
}

function adminLogin() {
    const adminId = document.getElementById('adminId').value;
    const adminPassword = document.getElementById('adminPassword').value;

    // Simple hardcoded login for demonstration
    if (adminId === 'admin' && adminPassword === 'password') {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminDashboard').classList.add('active');
        initMap();
        updateComplaintsList();
        updateComplaintCount();
    } else {
        alert('Invalid Admin ID or password');
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (message) {
        addMessage('user', message);
        input.value = '';

        // Simulating admin response
        setTimeout(() => {
            addMessage('admin', 'Request received! We have registered your complaint and will address it shortly. Ticket ID: #ST' + Math.floor(Math.random() * 10000));
        }, 1000);
    }
}

function toggleVoiceRecording() {
    const voiceBtn = document.getElementById('voiceBtn');

    if (!isRecording) {
        isRecording = true;
        voiceBtn.textContent = '⏹️';
        voiceBtn.classList.add('recording');

        // Simulate recording
        setTimeout(() => {
            isRecording = false;
            voiceBtn.textContent = '🎤';
            voiceBtn.classList.remove('recording');

            const complaint = '🎵 Voice message: "There is an overfilled dustbin near the park entrance that needs immediate attention."';
            addMessage('user', complaint, 'voice');

            setTimeout(() => {
                addMessage('admin', 'We received your voice complaint about the overfilled dustbin. Our team has been notified and will clean it within 24 hours.');
            }, 1500);

            // Add complaint to the admin view
            addComplaint({
                id: 'ST' + Math.floor(Math.random() * 10000),
                title: 'Overfilled Dustbin',
                description: complaint,
                location: [22.5726, 88.3639], // Example coordinates for Kolkata
                timestamp: new Date()
            });
        }, 3000);
    } else {
        isRecording = false;
        voiceBtn.textContent = '🎤';
        voiceBtn.classList.remove('recording');
    }
}

function shareLocation() {
    const locations = [
        { name: 'Park Street, Kolkata - Near Park Street Metro Station', coords: [22.5539, 88.3547] },
        { name: 'Victoria Memorial, Kolkata - Main Gate Area', coords: [22.5448, 88.3426] },
        { name: 'Howrah Bridge, Kolkata - Pedestrian Walkway', coords: [22.5855, 88.3465] },
        { name: 'Salt Lake Stadium, Kolkata - North Entrance', coords: [22.5714, 88.4069] },
        { name: 'New Market, Kolkata - Lindsay Street Junction', coords: [22.5638, 88.3533] }
    ];

    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    addMessage('user', `📍 Current Location: ${randomLocation.name}`, 'location');

    setTimeout(() => {
        addMessage('admin', 'Location received! We have noted the exact location of the issue. Our field team will visit this area for inspection and necessary action.');
    }, 1000);

    // Add complaint to the admin view
    addComplaint({
        id: 'ST' + Math.floor(Math.random() * 10000),
        title: 'Civic Issue Report',
        description: `Complaint at ${randomLocation.name}`,
        location: randomLocation.coords,
        timestamp: new Date()
    });
}

function addMessage(sender, text, type = 'text') {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    let additionalClass = '';
    if (type === 'location') additionalClass = 'location-message';
    if (type === 'voice') additionalClass = 'voice-message';

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <div class="message-bubble ${additionalClass}">
            ${text}
            <div class="message-time">${currentTime}</div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function initMap() {
    if (map) map.remove();

    map = L.map('map').setView([22.5726, 88.3639], 13); // Centered on Kolkata

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    refreshMap();
}

function refreshMap() {
    // existing icons removed
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // icons
    complaints.forEach(complaint => {
        const icon = issueIcons[complaint.title] || new L.Icon.Default(); // Use a different icon for each issue
        L.marker(complaint.location, { icon: icon })
            .addTo(map)
            .bindPopup(`<b>Complaint ID: ${complaint.id}</b><br>${complaint.description}`)
            .on('click', function () {
                map.setView(complaint.location, 16);
            });
    });
}

function addComplaint(newComplaint) {
    complaints.unshift(newComplaint); // Add to the beginning of the array
    updateComplaintsList();
    if (map) {
        refreshMap();
    }
    updateComplaintCount();
}

function updateComplaintsList() {
    const list = document.getElementById('complaintsList');
    list.innerHTML = '';
    complaints.forEach(complaint => {
        const item = document.createElement('li');
        item.className = 'complaint-item';
        item.innerHTML = `
            <h4>${complaint.title}</h4>
            <p>${complaint.description}</p>
            <p>ID: ${complaint.id}</p>
        `;
        item.onclick = () => {
            map.setView(complaint.location, 16);
        };
        list.appendChild(item);
    });
}

function updateComplaintCount() {
    document.getElementById('complaintCount').textContent = complaints.length;
}

function resolveAllComplaints() {
    complaints = [];
    updateComplaintsList();
    if (map) {
        refreshMap();
    }
    updateComplaintCount();
    alert('All complaints have been marked as resolved.');
}

setInterval(() => {
    if (document.getElementById('adminDashboard').classList.contains('active')) {
        const newLocation = [
            22.5526 + (Math.random() - 0.5) * 0.06,
            88.3739 + (Math.random() - 0.5) * 0.06
        ];
        const complaintTypes = ['Overfilled Dustbin', 'Broken Streetlight', 'Pothole on Road', 'Illegal Dumping'];
        const randomType = complaintTypes[Math.floor(Math.random() * complaintTypes.length)];

        const newComplaint = {
            id: 'ST' + Math.floor(Math.random() * 10000),
            title: randomType,
            description: `A report of ${randomType.toLowerCase()} at a new location.`,
            location: newLocation,
            timestamp: new Date()
        };
        addComplaint(newComplaint);
    }
}, 5000);
const customInterval = setInterval(() => {
    if (document.getElementById('adminDashboard').classList.contains('active') && customComplaintCount < 2) {
        const newComplaint = {
            id: 'ST' + Math.floor(Math.random() * 10000),
            title: 'Applying Bamboo on Students',
            description: 'Applying bamboo on students in the university.',
            location: [22.95778786574127, 88.54362379686108],
            timestamp: new Date()
        };
        addComplaint(newComplaint);
        customComplaintCount++;
    }
}, 15000);

// Auto-resize textarea
document.getElementById('messageInput').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Send message on Enter key
document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});