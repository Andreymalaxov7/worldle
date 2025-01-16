// Глобальные переменные
let currentCellIndex = 0; // Индекс текущей ячейки
const cells = document.querySelectorAll(".block"); // Список всех ячеек
const keys = document.querySelectorAll(".button"); // Список всех клавиш
const word = "HELLO"; // Загаданное слово

keys.forEach((key) => {
    key.addEventListener("click", () => {
        const letter = key.textContent.trim(); // Получаем текст кнопки

        // Проверяем, является ли это специальной клавишей
        if (letter === "ENTER") {
            checkWord(); // Запускаем функцию проверки слова
        } else if (letter === "DELETE") {
            deleteLetter(); // Запускаем функцию удаления буквы
        } else {
            addLetter(letter); // Добавляем букву в текущую ячейку
        }
    });
});

// Добавление буквы
function addLetter(letter) {
    if (currentCellIndex < cells.length) { // Проверяем, что индекс не выходит за пределы
        const cell = cells[currentCellIndex]; // Берём текущую ячейку
        if (cell.textContent === "") { // Проверяем, пуста ли ячейка
            cell.textContent = letter; // Записываем букву
            currentCellIndex++; // Переходим к следующей ячейке
        }
    }
}

// Удаление буквы (с ограничением на возврат в предыдущую строку)
function deleteLetter() {
    const currentRowStart = Math.floor(currentCellIndex / 5) * 5; // Начало текущей строки
    if (currentCellIndex > currentRowStart) { // Проверяем, находимся ли мы в пределах строки
        currentCellIndex--; // Возвращаемся к предыдущей ячейке
        const cell = cells[currentCellIndex]; // Берём текущую ячейку
        cell.textContent = ""; // Очищаем её
    } else {
        console.log("Нельзя удалять буквы из предыдущей строки!");
    }
}

// Проверка слова
function checkWord() {
    if (currentCellIndex % 5 !== 0) {
        alert("Слово не заполнено!");
        return;
    }

    const currentRowStart = currentCellIndex - 5; // Начало текущей строки
    const guessedWord = Array.from(cells)
        .slice(currentRowStart, currentCellIndex) // Берём текущую строку
        .map(cell => cell.textContent) // Получаем текст из ячеек
        .join(""); // Собираем в строку

    if (guessedWord.length !== 5) {
        alert("Слово должно содержать 5 букв!");
        return;
    }

    guessedWord.split("").forEach((letter, index) => {
        const cell = cells[currentRowStart + index];
        if (word[index] === letter) {
            cell.classList.add("correct"); // Зеленый: буква на правильной позиции
        } else if (word.includes(letter)) {
            cell.classList.add("almost"); // Желтый: буква есть, но не на месте
        } else {
            cell.classList.add("incorrect"); // Серый: буквы нет в слове
        }
    });

    if (guessedWord === word) {
        alert("Вы угадали слово!");
        return;
    }

    if (currentCellIndex >= cells.length) {
        alert("Игра окончена! Загаданное слово: " + word);
        return;
    }

    // Переход на следующую строку
    moveToNextRow();
}

// Переход на следующую строку
function moveToNextRow() {
    const nextRowStart = Math.floor(currentCellIndex / 5) * 5; // Начало следующей строки
    if (nextRowStart < cells.length) {
        currentCellIndex = nextRowStart; // Устанавливаем индекс на первую ячейку строки
    } else {
        alert("Больше нет строк для ввода!");
    }
}