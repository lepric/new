// Глобальные переменные
let crosswordGrid = [];
let wordsList = [];
let cellSize = 40;
let fontSize = 16;
let theme = 'light';

// DOM элементы
const wordsInput = document.getElementById('words-input');
const generateBtn = document.getElementById('generate-btn');
const crosswordGridElement = document.getElementById('crossword-grid');
const cellSizeSlider = document.getElementById('cell-size');
const cellSizeValue = document.getElementById('cell-size-value');
const fontSizeSlider = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const themeSelect = document.getElementById('theme');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Обработчики событий для настроек
    cellSizeSlider.addEventListener('input', updateCellSize);
    fontSizeSlider.addEventListener('input', updateFontSize);
    themeSelect.addEventListener('change', updateTheme);
    
    // Обработчик кнопки генерации
    generateBtn.addEventListener('click', generateCrossword);
});

// Обновление размера ячейки
function updateCellSize() {
    cellSize = parseInt(cellSizeSlider.value);
    cellSizeValue.textContent = `${cellSize}px`;
    redrawCrossword();
}

// Обновление размера шрифта
function updateFontSize() {
    fontSize = parseInt(fontSizeSlider.value);
    fontSizeValue.textContent = `${fontSize}px`;
    redrawCrossword();
}

// Обновление темы
function updateTheme() {
    theme = themeSelect.value;
    crosswordGridElement.className = `theme-${theme}`;
    redrawCrossword();
}

// Перерисовка кроссворда с текущими настройками
function redrawCrossword() {
    if (crosswordGrid.length > 0) {
        renderCrossword(crosswordGrid);
    }
}

// Основная функция генерации кроссворда
function generateCrossword() {
    const inputText = wordsInput.value.trim();
    if (!inputText) {
        alert('Пожалуйста, введите слова для кроссворда');
        return;
    }

    // Разбор введенных слов
    wordsList = inputText.split(',')
        .map(word => word.trim().toUpperCase())
        .filter(word => word.length > 0);

    if (wordsList.length < 2) {
        alert('Для генерации кроссворда необходимо ввести хотя бы 2 слова');
        return;
    }

    // Генерация кроссворда
    try {
        crosswordGrid = createCrossword(wordsList);
        renderCrossword(crosswordGrid);
    } catch (error) {
        console.error('Ошибка при генерации кроссворда:', error);
        alert('Не удалось сгенерировать кроссворд с введенными словами. Попробуйте другие слова.');
    }
}

// Функция создания кроссворда
function createCrossword(words) {
    // Создаем пустую сетку большого размера
    const gridSize = Math.max(25, Math.floor(Math.sqrt(words.reduce((sum, word) => sum + word.length, 0)) * 2));
    let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    
    // Проверяем возможность размещения слова в сетке
    function canPlaceWord(word, row, col, horizontal) {
        const len = word.length;
        
        // Проверяем границы сетки
        if (horizontal && col + len > gridSize) return false;
        if (!horizontal && row + len > gridSize) return false;
        
        // Проверяем пересечения и соседство с другими буквами
        for (let i = 0; i < len; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            
            // Проверяем текущую ячейку
            if (grid[r][c] !== null && grid[r][c] !== word[i]) {
                return false; // Ячейка занята другой буквой
            }
            
            // Проверяем соседние ячейки, чтобы избежать наложения рядом
            const neighbors = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            
            for (const [dr, dc] of neighbors) {
                const nr = r + dr;
                const nc = c + dc;
                
                // Проверяем, что соседняя ячейка внутри сетки
                if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
                    // Если ячейка не та, которую мы собираемся занять, и она занята
                    if (!(horizontal && dr === 0 && dc === 0 && i === 0) && 
                        !(horizontal && dr === 0 && dc === 0 && i === len-1) &&
                        (dr !== 0 || dc !== 0)) { // Это действительно сосед
                        if (grid[nr][nc] !== null && grid[r][c] === null) {
                            return false; // Рядом есть буква, но текущая ячейка свободна
                        }
                        
                        // Если это горизонтальное слово, проверяем вертикальные соседи
                        if (horizontal && dc === 0 && dr !== 0 && grid[nr][c] !== null && grid[r][c] === null) {
                            return false;
                        }
                        
                        // Если это вертикальное слово, проверяем горизонтальные соседи
                        if (!horizontal && dr === 0 && dc !== 0 && grid[r][nc] !== null && grid[r][c] === null) {
                            return false;
                        }
                    }
                }
            }
        }
        
        // Проверяем пересечения с существующими словами
        let intersections = 0;
        for (let i = 0; i < len; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            
            if (grid[r][c] !== null) {
                if (grid[r][c] !== word[i]) {
                    return false; // Буквы не совпадают
                }
                intersections++;
            }
        }
        
        // Убедимся, что если слово пересекается, то пересечения корректны
        if (intersections > 0) {
            // Проверим, что все пересечения корректны
            for (let i = 0; i < len; i++) {
                const r = horizontal ? row : row + i;
                const c = horizontal ? col + i : col;
                
                if (grid[r][c] !== null && grid[r][c] !== word[i]) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Размещаем первое слово горизонтально в центре
    const firstWord = words[0];
    const startRow = Math.floor(gridSize / 2);
    const startCol = Math.floor((gridSize - firstWord.length) / 2);
    
    for (let i = 0; i < firstWord.length; i++) {
        grid[startRow][startCol + i] = firstWord[i];
    }
    
    // Объект для отслеживания размещенных слов
    const placedWords = [{
        word: firstWord,
        row: startRow,
        col: startCol,
        horizontal: true
    }];
    
    // Пытаемся разместить остальные слова
    for (let w = 1; w < words.length; w++) {
        const currentWord = words[w];
        let placed = false;
        
        // Попробуем разные позиции и ориентации
        for (let attempts = 0; attempts < 1000 && !placed; attempts++) {
            // Выбираем случайную ориентацию
            const horizontal = Math.random() > 0.5;
            
            // Найдем возможные позиции для пересечений с уже размещенными словами
            const possiblePositions = [];
            
            for (const placedWordInfo of placedWords) {
                const placedWord = placedWordInfo.word;
                
                // Найдем совпадающие буквы между текущим и размещенным словом
                for (let i = 0; i < currentWord.length; i++) {
                    for (let j = 0; j < placedWord.length; j++) {
                        if (currentWord[i] === placedWord[j]) {
                            let newRow, newCol;
                            
                            if (horizontal) {
                                // Горизонтальное размещение текущего слова
                                newRow = placedWordInfo.horizontal ? 
                                    placedWordInfo.row - i : 
                                    placedWordInfo.row + j - i;
                                newCol = placedWordInfo.horizontal ? 
                                    placedWordInfo.col + j - i : 
                                    placedWordInfo.col - i;
                            } else {
                                // Вертикальное размещение текущего слова
                                newRow = placedWordInfo.horizontal ? 
                                    placedWordInfo.row + j - i : 
                                    placedWordInfo.row - i;
                                newCol = placedWordInfo.horizontal ? 
                                    placedWordInfo.col - i : 
                                    placedWordInfo.col + j - i;
                            }
                            
                            possiblePositions.push({row: newRow, col: newCol, horizontal});
                        }
                    }
                }
            }
            
            // Перемешиваем возможные позиции
            for (let k = possiblePositions.length - 1; k > 0; k--) {
                const j = Math.floor(Math.random() * (k + 1));
                [possiblePositions[k], possiblePositions[j]] = [possiblePositions[j], possiblePositions[k]];
            }
            
            // Проверим возможные позиции
            for (const pos of possiblePositions) {
                if (canPlaceWord(currentWord, pos.row, pos.col, pos.horizontal)) {
                    // Размещаем слово
                    for (let i = 0; i < currentWord.length; i++) {
                        const r = pos.horizontal ? pos.row : pos.row + i;
                        const c = pos.horizontal ? pos.col + i : pos.col;
                        grid[r][c] = currentWord[i];
                    }
                    
                    placedWords.push({
                        word: currentWord,
                        row: pos.row,
                        col: pos.col,
                        horizontal: pos.horizontal
                    });
                    
                    placed = true;
                    break;
                }
            }
            
            // Если не удалось разместить через пересечения, попробуем случайные позиции
            if (!placed && possiblePositions.length === 0) {
                // Генерируем случайные координаты
                const randomRow = Math.floor(Math.random() * (gridSize - currentWord.length));
                const randomCol = Math.floor(Math.random() * (gridSize - currentWord.length));
                
                if (canPlaceWord(currentWord, randomRow, randomCol, Math.random() > 0.5)) {
                    const horizontalRandom = Math.random() > 0.5;
                    
                    for (let i = 0; i < currentWord.length; i++) {
                        const r = horizontalRandom ? randomRow : randomRow + i;
                        const c = horizontalRandom ? randomCol + i : randomCol;
                        grid[r][c] = currentWord[i];
                    }
                    
                    placedWords.push({
                        word: currentWord,
                        row: randomRow,
                        col: randomCol,
                        horizontal: horizontalRandom
                    });
                    
                    placed = true;
                }
            }
        }
        
        if (!placed) {
            console.warn(`Не удалось разместить слово: ${currentWord}`);
        }
    }
    
    // Убираем лишние пустые строки и столбцы
    let minRow = gridSize, maxRow = -1, minCol = gridSize, maxCol = -1;
    
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] !== null) {
                minRow = Math.min(minRow, r);
                maxRow = Math.max(maxRow, r);
                minCol = Math.min(minCol, c);
                maxCol = Math.max(maxCol, c);
            }
        }
    }
    
    // Создаем уменьшенную сетку
    if (minRow <= maxRow && minCol <= maxCol) {
        const result = [];
        for (let r = minRow; r <= maxRow; r++) {
            const row = [];
            for (let c = minCol; c <= maxCol; c++) {
                row.push(grid[r][c]);
            }
            result.push(row);
        }
        return result;
    }
    
    return [[]]; // Возвращаем пустую сетку в случае ошибки
}

// Функция отрисовки кроссворда
function renderCrossword(grid) {
    // Очистка предыдущего кроссворда
    crosswordGridElement.innerHTML = '';
    crosswordGridElement.className = `theme-${theme}`;
    
    if (grid.length === 0 || (grid.length === 1 && grid[0].length === 0)) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'Не удалось сгенерировать кроссворд. Попробуйте другие слова.';
        emptyMessage.style.padding = '20px';
        emptyMessage.style.textAlign = 'center';
        crosswordGridElement.appendChild(emptyMessage);
        return;
    }
    
    // Создание таблицы для кроссворда
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.borderSpacing = '0';
    
    // Подсчет номеров клеток
    let cellNumber = 1;
    const cellNumbers = Array(grid.length).fill().map(() => Array(grid[0].length).fill(0));
    
    for (let r = 0; r < grid.length; r++) {
        const row = document.createElement('tr');
        
        for (let c = 0; c < grid[r].length; c++) {
            const cell = document.createElement('td');
            cell.className = `crossword-cell theme-${theme}`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${fontSize}px`;
            
            if (grid[r][c] !== null) {
                // Проверяем, нужно ли проставить номер
                let shouldHaveNumber = false;
                
                // Номер нужен, если это начало горизонтального слова
                if (c === 0 || grid[r][c-1] === null) {
                    if (c + 1 < grid[r].length && grid[r][c+1] !== null) {
                        shouldHaveNumber = true;
                    }
                }
                
                // Номер нужен, если это начало вертикального слова
                if (!shouldHaveNumber && (r === 0 || grid[r-1] && grid[r-1][c] === null)) {
                    if (r + 1 < grid.length && grid[r+1] && grid[r+1][c] !== null) {
                        shouldHaveNumber = true;
                    }
                }
                
                if (shouldHaveNumber) {
                    cellNumbers[r][c] = cellNumber++;
                }
                
                // Добавляем букву
                const letterSpan = document.createElement('span');
                letterSpan.className = 'letter';
                letterSpan.textContent = grid[r][c];
                cell.appendChild(letterSpan);
                
                // Добавляем номер, если есть
                if (cellNumbers[r][c] > 0) {
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'number';
                    numberSpan.textContent = cellNumbers[r][c];
                    cell.appendChild(numberSpan);
                }
            } else {
                // Черная (пустая) ячейка
                cell.classList.add('black');
            }
            
            row.appendChild(cell);
        }
        
        table.appendChild(row);
    }
    
    crosswordGridElement.appendChild(table);
}