// Переключение вкладок
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

// Стрелка «назад»
document.getElementById("backBtn").addEventListener("click", function () {
    history.back();
});