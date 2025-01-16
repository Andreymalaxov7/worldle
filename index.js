class WordleGame {
    constructor() {
        this.wordService = new WordService();
        this.currentCellIndex = 0;
        this.cells = document.querySelectorAll('.block');
        this.keys = document.querySelectorAll('.button');
        this.gameOver = false;
        this.currentRow = 0;
        this.isRowLocked = false;

        this.initializeGame();
    }

    async initializeGame() {
        await this.wordService.initialize();
        this.word = this.wordService.getRandomWord();
        console.log('New word selected:', this.word); // Для отладки

        this.keys.forEach(key => {
            key.addEventListener('click', () => {
                const letter = key.textContent.trim();

                if (this.gameOver) {
                    alert('Игра окончена! Начните новую игру.');
                    return;
                }

                switch (letter) {
                    case 'ENTER':
                        this.checkWord();
                        break;
                    case 'DELETE':
                        this.deleteLetter();
                        break;
                    default:
                        this.addLetter(letter);
                }
            });
        });
    }

    getCurrentRowStart() {
        return this.currentRow * 5;
    }

    getCurrentRowEnd() {
        return (this.currentRow + 1) * 5;
    }

    isCurrentRowFull() {
        const isFull = this.currentCellIndex === this.getCurrentRowEnd();
        if (isFull) {
            this.isRowLocked = true; // Блокируем строку, когда она заполнена
        }
        return isFull;
    }

    addLetter(letter) {
        // Проверяем, не заблокирована ли текущая строка
        if (this.isRowLocked) {
            alert('Нажмите ENTER, чтобы подтвердить слово!');
            return;
        }

        // Проверяем, не выходим ли мы за пределы текущей строки
        if (this.currentCellIndex >= this.getCurrentRowEnd()) {
            alert('Нажмите ENTER, чтобы перейти на следующую строку!');
            return;
        }

        if (this.currentCellIndex < this.cells.length) {
            const cell = this.cells[this.currentCellIndex];
            if (cell.textContent === '') {
                cell.textContent = letter;
                this.currentCellIndex++;
            }
        }
    }

    deleteLetter() {
        // Проверяем, не заблокирована ли текущая строка
        if (this.isRowLocked) {
            alert('Нажмите ENTER, чтобы подтвердить слово!');
            return;
        }

        // Проверяем, не пытаемся ли мы удалить букву из предыдущей строки
        if (this.currentCellIndex <= this.getCurrentRowStart()) {
            console.log('Нельзя удалять буквы из предыдущей строки!');
            return;
        }

        this.currentCellIndex--;
        const cell = this.cells[this.currentCellIndex];
        cell.textContent = '';
    }

    async checkWord() {
        if (!this.isCurrentRowFull()) {
            alert('Слово не заполнено!');
            return;
        }

        // Разблокируем строку для проверки
        this.isRowLocked = false;

        const currentRowStart = this.getCurrentRowStart();
        const guessedWord = Array.from(this.cells)
            .slice(currentRowStart, this.getCurrentRowEnd())
            .map(cell => cell.textContent)
            .join('');

        // Проверяем существование слова
        const isValidWord = await this.wordService.checkWordExists(guessedWord);
        if (!isValidWord) {
            alert('Такого слова не существует!');
            return;
        }

        this.evaluateGuess(guessedWord, currentRowStart);

        if (guessedWord === this.word) {
            this.gameOver = true;
            alert('Вы угадали слово!');
            return;
        }

        if (this.currentRow >= this.cells.length / 5 - 1) {
            this.gameOver = true;
            alert('Игра окончена! Загаданное слово: ' + this.word);
            return;
        }

        this.moveToNextRow();
    }

    evaluateGuess(guessedWord, currentRowStart) {
        const letterCounts = {};

        // Count letters in target word
        for (const letter of this.word) {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }

        // First pass - mark correct letters
        const cellStates = new Array(5).fill('incorrect');
        const remainingCounts = {...letterCounts};

        guessedWord.split('').forEach((letter, index) => {
            if (this.word[index] === letter) {
                cellStates[index] = 'correct';
                remainingCounts[letter]--;
            }
        });

        // Second pass - mark partially correct letters
        guessedWord.split('').forEach((letter, index) => {
            if (cellStates[index] !== 'correct' &&
                remainingCounts[letter] > 0) {
                cellStates[index] = 'almost';
                remainingCounts[letter]--;
            }
        });

        // Apply visual feedback
        cellStates.forEach((state, index) => {
            const cell = this.cells[currentRowStart + index];
            cell.classList.add(state);

            // Также обновляем цвет соответствующей клавиши
            const key = Array.from(this.keys).find(k => k.textContent.trim() === cell.textContent);
            if (key) {
                // Убираем предыдущие классы
                key.classList.remove('correct', 'almost', 'incorrect');
                // Добавляем новый класс только если это улучшает предыдущий статус клавиши
                if (state === 'correct' ||
                    (state === 'almost' && !key.classList.contains('correct')) ||
                    (state === 'incorrect' && !key.classList.contains('correct') && !key.classList.contains('almost'))) {
                    key.classList.add(state);
                }
            }
        });
    }

    moveToNextRow() {
        this.currentRow++;
        this.currentCellIndex = this.getCurrentRowStart();
        this.isRowLocked = false; // Разблокируем новую строку
    }

    async reset() {
        this.currentCellIndex = 0;
        this.currentRow = 0;
        this.gameOver = false;
        this.isRowLocked = false;

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('correct', 'almost', 'incorrect');
        });

        // Очищаем подсветку клавиш
        this.keys.forEach(key => {
            key.classList.remove('correct', 'almost', 'incorrect');
        });

        // Выбираем новое слово
        this.word = this.wordService.getRandomWord();
        console.log('New word selected:', this.word); // Для отладки
    }
}

// Initialize the game
const game = new WordleGame();

// Add keyboard support
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        game.checkWord();
    } else if (event.key === 'Backspace') {
        game.deleteLetter();
    } else if (/^[A-Za-z]$/.test(event.key)) {
        game.addLetter(event.key.toUpperCase());
    }
});