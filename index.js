const buttonElements = document.querySelectorAll(".button");

console.log(buttonElements);

buttonElements.forEach(button => {
    button.addEventListener("click", () => {
        alert("Potato");
    });
});