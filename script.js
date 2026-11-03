// Счётчик
let count = 0;

document.getElementById("btn").addEventListener("click", function () {
    count = count + 1;
    document.getElementById("count").textContent = count;
});

// Выбор фото
document.getElementById("photoInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById("photo").src = URL.createObjectURL(file);
    document.getElementById("photoBtn").style.display = "none";
});