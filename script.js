// ---------- Вкладки ----------
const tabs = document.querySelectorAll(".tab");
const panels = [
    document.getElementById("panel1"),
    document.getElementById("panel2")
];

tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        panels.forEach(function (p, i) { p.hidden = (i !== index); });
    });
});

// ---------- Стрелка «назад» ----------
document.getElementById("backBtn").addEventListener("click", function () {
    history.back();
});

// ---------- Запрет приближения всей страницы (iPhone) ----------
document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
});

// ---------- Фото ----------
const photoInput = document.getElementById("photoInput");
const photoAdd = document.getElementById("photoAdd");
const photoFrame = document.getElementById("photoFrame");
const photo = document.getElementById("photo");

photoInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    photo.src = URL.createObjectURL(file);
    photoAdd.hidden = true;
    photoFrame.hidden = false;
    resetZoom();
});

// ---------- Приближение, отдаление и перемещение фото ----------
const MIN_SCALE = 0.3;
const MAX_SCALE = 6;

let scale = 1;
let x = 0;
let y = 0;
let startDist = 0;
let startScale = 1;
let startX = 0;
let startY = 0;
let startTx = 0;
let startTy = 0;
let moved = false;
let lastTap = 0;

function distance(t) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function applyZoom() {
    // фото можно двигать далеко, но не терять совсем
    const W = photoFrame.clientWidth;
    const H = photoFrame.clientHeight;
    const maxX = Math.max(0, (W + W * scale) / 2 - 80);
    const maxY = Math.max(0, (H + H * scale) / 2 - 80);
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
    photo.style.transform = "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
}

function resetZoom() {
    scale = 1;
    x = 0;
    y = 0;
    applyZoom();
}

photoFrame.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) {
        startDist = distance(e.touches);
        startScale = scale;
        moved = true;
    } else if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTx = x;
        startTy = y;
        moved = false;
    }
}, { passive: false });

photoFrame.addEventListener("touchmove", function (e) {
    e.preventDefault();

    if (e.touches.length === 2) {
        // два пальца: приближение и отдаление
        scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, startScale * distance(e.touches) / startDist));
    } else if (e.touches.length === 1) {
        // один палец: двигаем фото
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
        x = startTx + dx;
        y = startTy + dy;
    }
    applyZoom();
}, { passive: false });

photoFrame.addEventListener("touchend", function (e) {
    // двойное касание возвращает фото к исходному виду
    if (e.touches.length === 0 && !moved) {
        const now = Date.now();
        if (now - lastTap < 300) {
            resetZoom();
            lastTap = 0;
        } else {
            lastTap = now;
        }
    }

    // после отпускания одного из двух пальцев продолжаем с оставшимся
    if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTx = x;
        startTy = y;
    }
});