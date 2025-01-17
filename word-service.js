class WordService {
    constructor() {
        this.wordList = [];
        this.API_URL = 'https://random-word-api.herokuapp.com/word';
        this.WORD_LENGTH = 5;
    }

    async initialize() {
        try {
            const response = await fetch('https://api.datamuse.com/words?sp=?????');
            const words = await response.json();
            this.wordList = words
                .map(word => word.word.toUpperCase())
                .filter(word => /^[A-Z]{5}$/.test(word));

            if (this.wordList.length === 0) {
                throw new Error('No words loaded');
            }

            console.log(`Loaded ${this.wordList.length} words`);
            return true;
        } catch (error) {
            console.error('Failed to load words:', error);
            this.wordList = ['HELLO', 'WORLD', 'PEARL', 'HOUSE', 'SMILE', 'BRAIN', 'CLOUD',
                'SPACE', 'LIGHT', 'MUSIC', 'DANCE', 'RIVER', 'GREEN', 'DREAM', 'APPLE',
                'BEACH', 'CHAIR', 'DRAFT', 'EAGLE', 'FLASH', 'GRAVE', 'HUMAN', 'INDEX',
                'JUDGE', 'KNIFE', 'LEMON', 'MOVIE', 'NIGHT', 'OCEAN', 'PAINT', 'QUEEN',
                'RADIO', 'SNAKE', 'TABLE', 'UNCLE', 'VOICE', 'WATER', 'YOUNG', 'ZEBRA'];
            return false;
        }
    }

    getRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.wordList.length);
        return this.wordList[randomIndex];
    }

    isValidWord(word) {
        return this.wordList.includes(word.toUpperCase());
    }

    async checkWordExists(word) {
        // Используем только локальную проверку
        return this.isValidWord(word);
    }
}
