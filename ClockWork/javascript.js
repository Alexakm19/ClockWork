function pad(value) {
    return String(value).padStart(2, '0');
}

function updateHands(now) {
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = (seconds / 60) * 360;
    const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const hourDeg = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

    document.getElementById('second-hand').style.transform = `rotate(${secondDeg - 90}deg)`;
    document.getElementById('minute-hand').style.transform = `rotate(${minuteDeg - 90}deg)`;
    document.getElementById('hour-hand').style.transform = `rotate(${hourDeg - 90}deg)`;
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';

    document.getElementById('time').textContent = `${pad(hour12)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
    document.getElementById('date-time').textContent = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    updateHands(now);
}

window.addEventListener('load', () => {
    updateClock();
    setInterval(updateClock, 1000);
});
