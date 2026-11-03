let count = 0;

document.getElementById("btn").addEventListener("click", function () {
    count = count + 1;
    document.getElementById("count").textContent = count;
});