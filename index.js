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

    showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async initializeGame() {
        await this.wordService.initialize();
        this.word = this.wordService.getRandomWord();
        console.log('New word selected:', this.word);

        this.keys.forEach(key => {
            key.addEventListener('click', () => {
                const letter = key.textContent.trim();

                if (this.gameOver) {
                    this.showNotification('Игра окончена! Начните новую игру.', 'warning');
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
            this.isRowLocked = true;
        }
        return isFull;
    }

    addLetter(letter) {
        if (this.isRowLocked) {
            this.showNotification('Нажмите ENTER, чтобы подтвердить слово!', 'warning');
            return;
        }

        if (this.currentCellIndex >= this.getCurrentRowEnd()) {
            this.showNotification('Нажмите ENTER, чтобы перейти на следующую строку!', 'warning');
            return;
        }

        if (this.currentCellIndex < this.cells.length) {
            const cell = this.cells[this.currentCellIndex];
            if (cell.textContent === '') {
                cell.textContent = letter;
                cell.classList.add('pop');
                cell.addEventListener('animationend', () => {
                    cell.classList.remove('pop');
                }, { once: true });
                this.currentCellIndex++;
            }
        }
    }

    deleteLetter() {
        if (this.isRowLocked) {
            this.showNotification('Нажмите ENTER, чтобы подтвердить слово!', 'warning');
            return;
        }

        if (this.currentCellIndex <= this.getCurrentRowStart()) {
            this.showNotification('Нельзя удалять буквы из предыдущей строки!', 'error');
            return;
        }

        this.currentCellIndex--;
        const cell = this.cells[this.currentCellIndex];
        cell.textContent = '';
    }

    async checkWord() {
        if (!this.isCurrentRowFull()) {
            this.showNotification('Слово не заполнено!', 'error');
            return;
        }

        this.isRowLocked = false;

        const currentRowStart = this.getCurrentRowStart();
        const guessedWord = Array.from(this.cells)
            .slice(currentRowStart, this.getCurrentRowEnd())
            .map(cell => cell.textContent)
            .join('');

        const isValidWord = await this.wordService.checkWordExists(guessedWord);
        if (!isValidWord) {
            this.showNotification('Такого слова не существует!', 'error');
            return;
        }

        this.evaluateGuess(guessedWord, currentRowStart);

        if (guessedWord === this.word) {
            this.gameOver = true;
            this.showNotification('Поздравляем! Вы угадали слово!', 'success');
            return;
        }

        if (this.currentRow >= this.cells.length / 5 - 1) {
            this.gameOver = true;
            this.showNotification(`Игра окончена! Загаданное слово: ${this.word}`, 'error');
            return;
        }

        this.moveToNextRow();
    }

    evaluateGuess(guessedWord, currentRowStart) {
    const letterCounts = {};

    for (const letter of this.word) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    const cellStates = new Array(5).fill('incorrect');
    const remainingCounts = {...letterCounts};
    const keyStates = new Map(); // Добавляем Map для хранения лучшего состояния каждой клавиши

    // Первый проход - отмечаем правильные буквы
    guessedWord.split('').forEach((letter, index) => {
        if (this.word[index] === letter) {
            cellStates[index] = 'correct';
            remainingCounts[letter]--;
            // Сохраняем лучшее состояние для клавиши
            keyStates.set(letter, 'correct');
        }
    });

    // Второй проход - отмечаем частично правильные буквы
    guessedWord.split('').forEach((letter, index) => {
        if (cellStates[index] !== 'correct' && remainingCounts[letter] > 0) {
            cellStates[index] = 'almost';
            remainingCounts[letter]--;
            // Сохраняем состояние только если еще нет 'correct'
            if (!keyStates.has(letter)) {
                keyStates.set(letter, 'almost');
            }
        } else if (!keyStates.has(letter)) {
            // Если буква неправильная и еще нет лучшего состояния
            keyStates.set(letter, 'incorrect');
        }
    });

    // Применяем анимации и обновляем цвета ячеек
    cellStates.forEach((state, index) => {
        const cell = this.cells[currentRowStart + index];
        
        cell.classList.add('flip-in');
        
        cell.addEventListener('animationend', () => {
            cell.classList.remove('flip-in');
            cell.classList.add(state);
            cell.classList.add('flip-out');

            cell.addEventListener('animationend', () => {
                cell.classList.remove('flip-out');
            }, { once: true });

            // Обновляем клавиатуру используя сохраненные состояния
            const key = Array.from(this.keys).find(k => k.textContent.trim() === cell.textContent);
            if (key) {
                const bestState = keyStates.get(cell.textContent);
                key.classList.remove('correct', 'almost', 'incorrect');
                key.classList.add(bestState);
            }
        }, { once: true });
    });
}

    moveToNextRow() {
        this.currentRow++;
        this.currentCellIndex = this.getCurrentRowStart();
        this.isRowLocked = false;
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

        this.keys.forEach(key => {
            key.classList.remove('correct', 'almost', 'incorrect');
        });

        this.word = this.wordService.getRandomWord();
        console.log('New word selected:', this.word);

        this.showNotification('Новое слово доступно!', 'success');
    }
}

// Initialize the game
const game = new WordleGame();

// Add keyboard support
document.addEventListener('keydown', (event) => {
    // Если игра окончена, показываем уведомление
    if (game.gameOver) {
        game.showNotification('Игра окончена! Начните новую игру.', 'warning');
        return;
    }

    // Приводим название клавиши к верхнему регистру для единообразия
    const key = event.key.toUpperCase();

    if (key === 'ENTER') {
        // Предотвращаем стандартное поведение Enter
        event.preventDefault();
        game.checkWord();
    } else if (key === 'BACKSPACE') {
        // Предотвращаем стандартное поведение Backspace
        event.preventDefault();
        game.deleteLetter();
    } else if (/^[A-Z]$/.test(key)) {
        // Предотвращаем стандартное поведение для букв
        event.preventDefault();
        game.addLetter(key);
    }
});
