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
    resetZoom(false);
});

// ---------- Приближение, отдаление и перемещение фото ----------
const MIN_SCALE = 0.3;   // как сильно можно отдалить пальцами
const MAX_SCALE = 6;     // как сильно можно приблизить
const EDGE = 30;         // на сколько фото может выйти за край (меньше число = строже)
const OVERSHOOT = 100;   // насколько можно «перетянуть» фото пальцем до отпускания

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

// Допустимое смещение фото при текущем размере
function limitX() {
    const W = photoFrame.clientWidth;
    return Math.max(0, (W * scale - W) / 2) + EDGE;
}

function limitY() {
    const H = photoFrame.clientHeight;
    return Math.max(0, (H * scale - H) / 2) + EDGE;
}

function clamp(value, limit) {
    return Math.max(-limit, Math.min(limit, value));
}

function render() {
    photo.style.transform = "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
}

// Плавное возвращение: в центр и исходный размер, если отдалили,
// или к допустимой границе, если вышли за край
function settle() {
    if (scale < 1) {
        scale = 1;
        x = 0;
        y = 0;
    } else {
        x = clamp(x, limitX());
        y = clamp(y, limitY());
    }
    photo.style.transition = "transform 0.25s ease";
    render();
}

function resetZoom(animated) {
    scale = 1;
    x = 0;
    y = 0;
    photo.style.transition = animated ? "transform 0.25s ease" : "none";
    render();
}

photoFrame.addEventListener("touchstart", function (e) {
    photo.style.transition = "none";

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
        x = clamp(startTx + dx, limitX() + OVERSHOOT);
        y = clamp(startTy + dy, limitY() + OVERSHOOT);
    }
    render();
}, { passive: false });

photoFrame.addEventListener("touchend", function (e) {
    if (e.touches.length === 0) {
        // двойное касание: исходный вид
        if (!moved) {
            const now = Date.now();
            if (now - lastTap < 300) {
                resetZoom(true);
                lastTap = 0;
                return;
            }
            lastTap = now;
        }
        // все пальцы отпущены: возвращаем фото на место
        settle();
    } else if (e.touches.length === 1) {
        // отпустили один из двух пальцев: продолжаем с оставшимся
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTx = x;
        startTy = y;
    }
});