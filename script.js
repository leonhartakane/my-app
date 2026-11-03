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
    photoAdd.hidden = true;     // убираем кнопку добавления
    photoFrame.hidden = false;  // показываем фото
    resetZoom();
});

// ---------- Приближение только фото ----------
let scale = 1;
let x = 0;
let y = 0;
let startDist = 0;
let startScale = 1;
let startX = 0;
let startY = 0;
let startTx = 0;
let startTy = 0;

function distance(t) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function applyZoom() {
    // не даём утащить фото за края рамки
    const maxX = photoFrame.clientWidth * (scale - 1) / 2;
    const maxY = photoFrame.clientHeight * (scale - 1) / 2;
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
    } else if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTx = x;
        startTy = y;
    }
}, { passive: false });

photoFrame.addEventListener("touchmove", function (e) {
    e.preventDefault();

    if (e.touches.length === 2) {
        // два пальца: приближение
        scale = Math.max(1, Math.min(5, startScale * distance(e.touches) / startDist));
    } else if (e.touches.length === 1 && scale > 1) {
        // один палец: двигаем приближенное фото
        x = startTx + (e.touches[0].clientX - startX);
        y = startTy + (e.touches[0].clientY - startY);
    }
    applyZoom();
}, { passive: false });

photoFrame.addEventListener("touchend", function (e) {
    if (scale < 1.05) resetZoom();

    // после отпускания одного из двух пальцев продолжаем с оставшимся
    if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTx = x;
        startTy = y;
    }
});

// Двойной тап возвращает фото к обычному размеру
photoFrame.addEventListener("dblclick", resetZoom);