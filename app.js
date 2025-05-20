// This file contains the JavaScript code for the digital wallet application.
// It implements a live digital clock feature for multiple time zones and allows saving the HTML content.

document.addEventListener('DOMContentLoaded', () => {
    const clockDisplay = document.getElementById('currentClock');
    const easternClockDisplay = document.getElementById('easternClock');
    const southernClockDisplay = document.getElementById('southernClock');
    const timezoneSelect = document.getElementById('timezoneSelect');
    const worldTimezoneSelect = document.getElementById('worldTimezoneSelect');
    const calendarTypeSelect = document.getElementById('calendarType');
    const calendarContainer = document.getElementById('calendar');
    let imageBase64 = "";

    // Populate timezone options
    const timezones = Intl.supportedValuesOf('timeZone');
    timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz;
        worldTimezoneSelect.appendChild(option);
    });

    function updateClocks() {
        const timeZones = {
            currentClock: timezoneSelect.value || 'Asia/Karachi',
            easternClock: 'America/New_York',
            southernClock: 'Australia/Sydney'
        };

        Object.entries(timeZones).forEach(([id, tz]) => {
            document.getElementById(id).textContent = `${id.replace('Clock', ' Time')}: ${new Date().toLocaleTimeString('en-US', { timeZone: tz })}`;
        });

        const now = new Date();
        drawClock('currentClock', now);

        const selectedTimezone = worldTimezoneSelect.value;
        const worldTime = new Date(now.toLocaleString('en-US', { timeZone: selectedTimezone }));
        drawClock('worldClock', worldTime);
    }

    setInterval(updateClocks, 1000);
    timezoneSelect.addEventListener('change', updateClocks);

    // Draw analog clocks
    function drawClock(canvasId, time, offset = 0) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const radius = canvas.width / 2;
        ctx.translate(radius, radius);

        // Clear canvas
        ctx.clearRect(-radius, -radius, canvas.width, canvas.height);

        // Draw clock face
        ctx.beginPath();
        ctx.arc(0, 0, radius - 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();

        // Draw clock hands
        const hours = time.getUTCHours() + offset;
        const minutes = time.getUTCMinutes();
        const seconds = time.getUTCSeconds();

        // Hour hand
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            Math.cos((hours % 12) * Math.PI / 6 - Math.PI / 2) * (radius * 0.5),
            Math.sin((hours % 12) * Math.PI / 6 - Math.PI / 2) * (radius * 0.5)
        );
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Minute hand
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            Math.cos(minutes * Math.PI / 30 - Math.PI / 2) * (radius * 0.7),
            Math.sin(minutes * Math.PI / 30 - Math.PI / 2) * (radius * 0.7)
        );
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Second hand
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            Math.cos(seconds * Math.PI / 30 - Math.PI / 2) * (radius * 0.9),
            Math.sin(seconds * Math.PI / 30 - Math.PI / 2) * (radius * 0.9)
        );
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Calendar functionality
    function updateCalendar() {
        const calendarType = calendarTypeSelect.value;
        const now = new Date();
        let calendarHTML = '';

        if (calendarType === 'gregorian') {
            calendarHTML = now.toDateString();
        } else if (calendarType === 'islamic') {
            const islamicDate = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(now);
            calendarHTML = islamicDate;
        } else if (calendarType === 'hebrew') {
            const hebrewDate = new Intl.DateTimeFormat('en-TN-u-ca-hebrew', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(now);
            calendarHTML = hebrewDate;
        }

        calendarContainer.textContent = calendarHTML;
    }

    calendarTypeSelect.addEventListener('change', updateCalendar);
    updateCalendar();

    function loadImage(event) {
        const reader = new FileReader();
        reader.onload = function () {
            imageBase64 = reader.result;
            document.getElementById('preview').src = imageBase64;
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    function validateLocation(zip, city) {
        return zip.length >= 4 && city.length >= 3; // fake basic match check
    }

    function saveWallet() {
        const form = document.getElementById('walletForm');
        const formData = new FormData(form);
        const zip = formData.get('zip');
        const city = formData.get('city');
        if (!validateLocation(zip, city)) {
            alert("Invalid ZIP or City. Please check your address info.");
            return;
        }
        let entry = {};
        for (let [key, value] of formData.entries()) {
            entry[key] = value;
        }
        entry.profilePic = imageBase64;
        entry.time = new Date().toLocaleString();
        let saved = JSON.parse(localStorage.getItem('wallets') || "[]");
        saved.push(entry);
        localStorage.setItem('wallets', JSON.stringify(saved));
        alert("Wallet saved locally!");
        displayWallets();
    }

    function displayWallets() {
        const container = document.getElementById('savedWallets');
        container.innerHTML = '';
        let saved = JSON.parse(localStorage.getItem('wallets') || "[]");
        saved.forEach(entry => {
            let div = document.createElement('div');
            div.className = 'user-card';
            div.innerHTML = `
                <img src="${entry.profilePic}" alt="Profile Image" />
                <p><strong>Name:</strong> ${entry.fullName}</p>
                <p><strong>Card:</strong> ${entry.cardType} ${entry.cardNumber}</p>
                <p><strong>Location:</strong> ${entry.city}, ${entry.province}</p>
                <p><strong>Saved At:</strong> ${entry.time}</p>
            `;
            container.appendChild(div);
        });
    }

    async function downloadHTML() {
        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'digital_wallet.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    document.getElementById('downloadButton').addEventListener('click', downloadHTML);

    const expiryMonthSelect = document.getElementById('expiryMonth');
    const expiryYearSelect = document.getElementById('expiryYear');
    const currentYear = new Date().getFullYear();

    // Generate options for months
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1; // Month values start from 1
        option.textContent = month;
        expiryMonthSelect.appendChild(option);
    });

    // Generate options for the next 10 years
    for (let i = 0; i < 10; i++) {
        const year = currentYear + i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        expiryYearSelect.appendChild(option);
    }

    displayWallets();
    updateClocks();
});
