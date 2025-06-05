const resultOverlay = document.getElementById("result-overlay");
const resultIcon = document.getElementById("result-icon");
const board = document.getElementById("board");
const submitButton = document.getElementById("submit");
const resetButton = document.getElementById("reset");
const solvedCategoriesDiv = document.getElementById("solved-categories");

let selected = [];
let solvedCategories = [];
let attempts = 0;
const maxAttempts = 4;

// Hard-coded NYT Connections puzzle
const puzzle = {
    "Academic Environments": {
        words: ["University", "campus", "facilities", "Stadium"],
        explanation: "These are words related to various settings within a university environment.",
        difficulty: 1 // Blue - easiest
    },
    "Natural Phenomena": {
        words: ["spring", "autumn", "blossoms", "bloom"],
        explanation: "These words are connected by their association with nature and natural phenomena.",
        difficulty: 2 // Green
    },
    "Art and Culture": {
        words: ["Gothic", "modern", "art", "contemporary"],
        explanation: "These words have links to arts, culture, and specific styles or types of creative expression.",
        difficulty: 3 // Yellow
    },
    "Representations of Color": {
        words: ["red", "purple", "gold", "colors"],
        explanation: "These words either directly signify color or can be indirectly associated with the concept of color through symbolism or figurative contexts.",
        difficulty: 4 // Purple - hardest
    }
};

// Initialize the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    board.innerHTML = "";
    selected = [];
    solvedCategories = [];
    attempts = 0;
    solvedCategoriesDiv.innerHTML = "";
    
    // Get all words and shuffle them
    let allWords = [];
    for (const category in puzzle) {
        allWords.push(...puzzle[category].words);
    }
    allWords = shuffle(allWords);
    
    // Create tiles for each word
    allWords.forEach(word => {
        const tile = document.createElement("div");
        tile.className = 'word-tile-game';
        tile.textContent = word;
        tile.onclick = () => toggleSelection(tile);
        board.appendChild(tile);
    });
    
    updateMessage("Select 4 words that belong to the same category");
    hideResultOverlay();
}

function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function toggleSelection(tile) {
    if (tile.classList.contains("correct")) {
        return; // Can't select already solved tiles
    }
    
    if (!tile.classList.contains("selected") && selected.length < 4) {
        tile.classList.add("selected");
        selected.push(tile);
    } else if (tile.classList.contains("selected")) {
        tile.classList.remove("selected");
        selected = selected.filter(t => t !== tile);
    }
}

function checkAnswer() {
    if (selected.length !== 4) {
        updateMessage("Please select exactly 4 words", "error");
        return;
    }
    
    const selectedWords = selected.map(tile => tile.textContent);
    let foundCategory = null;
    let correctCount = 0;
    
    // Check each category
    for (const categoryName in puzzle) {
        if (solvedCategories.includes(categoryName)) {
            continue; // Skip already solved categories
        }
        
        const categoryWords = puzzle[categoryName].words;
        const matches = selectedWords.filter(word => categoryWords.includes(word));
        
        if (matches.length === 4) {
            foundCategory = categoryName;
            break;
        } else if (matches.length > correctCount) {
            correctCount = matches.length;
        }
    }
    
    if (foundCategory) {
        // Correct answer
        selected.forEach(tile => {
            tile.classList.remove("selected");
            tile.classList.add("correct");
        });
        
        solvedCategories.push(foundCategory);
        displaySolvedCategory(foundCategory);
        
        selected = [];
        updateMessage(`Correct! Category: ${foundCategory}`, "success");
        showSuccessOverlay();
        createConfetti();
        
        // Check if puzzle is complete
        if (solvedCategories.length === 4) {
            setTimeout(() => {
                updateMessage("Congratulations! You solved the entire puzzle!", "success");
            }, 2000);
        }
    } else {
        // Wrong answer
        attempts++;
        const remaining = maxAttempts - attempts;
        
        if (remaining > 0) {
            updateMessage(`Not quite right. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining. You were ${4 - correctCount} word(s) away.`, "error");
        } else {
            updateMessage("No more attempts remaining! The puzzle is over.", "error");
            revealAllCategories();
        }
        
        showErrorOverlay();
        
        // Clear selection
        selected.forEach(tile => tile.classList.remove("selected"));
        selected = [];
    }
}

function displaySolvedCategory(categoryName) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = `solved-category difficulty-${puzzle[categoryName].difficulty}`;
    
    const titleDiv = document.createElement("div");
    titleDiv.className = "category-title";
    titleDiv.textContent = categoryName.toUpperCase();
    
    const wordsDiv = document.createElement("div");
    wordsDiv.className = "category-words";
    wordsDiv.textContent = puzzle[categoryName].words.join(", ");
    
    const explanationDiv = document.createElement("div");
    explanationDiv.className = "category-explanation";
    explanationDiv.textContent = puzzle[categoryName].explanation;
    
    categoryDiv.appendChild(titleDiv);
    categoryDiv.appendChild(wordsDiv);
    categoryDiv.appendChild(explanationDiv);
    
    solvedCategoriesDiv.appendChild(categoryDiv);
}

function revealAllCategories() {
    for (const categoryName in puzzle) {
        if (!solvedCategories.includes(categoryName)) {
            displaySolvedCategory(categoryName);
        }
    }
}

function updateMessage(text, type = "") {
    const message = document.getElementById("message");
    message.textContent = text;
    message.className = `message ${type}`;
}

function showSuccessOverlay() {
    resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    resultIcon.className = "result-icon success";
    resultOverlay.className = "result-overlay success visible";
    
    setTimeout(() => {
        hideResultOverlay();
    }, 1500);
}

function showErrorOverlay() {
    resultIcon.innerHTML = '<i class="fas fa-times"></i>';
    resultIcon.className = "result-icon error";
    resultOverlay.className = "result-overlay error visible";
    
    setTimeout(() => {
        hideResultOverlay();
    }, 1500);
}

function hideResultOverlay() {
    resultOverlay.className = "result-overlay";
}

function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const container = document.querySelector('body');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const size = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = `-20px`;
        
        container.appendChild(confetti);
        
        const animation = confetti.animate(
            [
                { 
                    transform: `translate(0, 0) rotate(0deg)`,
                    opacity: 1
                },
                { 
                    transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 500 + 500}px) rotate(${Math.random() * 360}deg)`,
                    opacity: 0
                }
            ],
            {
                duration: Math.random() * 2000 + 1500,
                easing: 'cubic-bezier(0.1, 0.8, 0.9, 0.2)'
            }
        );
        
        animation.onfinish = () => {
            confetti.remove();
        };
    }
}

// Event listeners
submitButton.addEventListener("click", checkAnswer);
resetButton.addEventListener("click", initializeGame);
