const countyImages = [
    'Acre.svg',
    'Alagoas.svg',
    'Amapá.svg',
    'Amazonas.png',  // Already updated for .png
    'Bahia.svg',
    'Ceará.svg',
    'Espírito_Santo.svg',
    'Goiás.svg',
    'Maranhão.svg',
    'Mato_Grosso.svg',
    'Mato_Grosso_do_Sul.svg',
    'Minas_Gerais.svg',
    'Pará.svg',
    'Paraíba.svg',
    'Paraná.svg',
    'Pernambuco.svg',
    'Piauí.svg',
    'Rio_de_Janeiro.svg',
    'Rio_Grande_do_Norte.svg',
    'Rio_Grande_do_Sul.svg',
    'Rondônia.svg',
    'Roraima.svg',
    'Santa_Catarina.svg',
    'São_Paulo.svg',
    'Sergipe.svg',
    'Tocantins.svg',
    'Distrito_Federal.svg'
];

// Convert filenames to display names (replace underscores with spaces and remove extension)
const stateNames = countyImages.map(image => image.replace(/\.(svg|png)$/, '').replace(/_/g, ' '));

let currentCountyIndex = Math.floor(Math.random() * countyImages.length);
let attemptsLeft = 5;
let incorrectGuesses = [];
let correctAnswer = stateNames[currentCountyIndex];
let gameOver = false;

document.getElementById('county-image').src = 'brazilian_states_svgs/' + countyImages[currentCountyIndex];
document.getElementById('attempts-left').value = `Attempts left: ${attemptsLeft}`;

const guessInput = document.getElementById('guess-input');
const dropdown = document.getElementById('dropdown-options');

// Show dropdown with filtered options when typing
guessInput.addEventListener('input', function () {
    const inputValue = guessInput.value.trim().toLowerCase();
    dropdown.innerHTML = ''; // Clear previous options

    if (inputValue.length === 0) {
        dropdown.style.display = 'none'; // Hide if no input
        return;
    }

    const filteredStates = stateNames.filter(state => 
        state.toLowerCase().includes(inputValue)
    );

    filteredStates.forEach(state => {
        const option = document.createElement('div');
        option.classList.add('dropdown-option');
        option.textContent = state;
        option.addEventListener('click', function () {
            guessInput.value = state;
            dropdown.style.display = 'none';
        });
        dropdown.appendChild(option);
    });

    dropdown.style.display = filteredStates.length > 0 ? 'block' : 'none';
});

// Hide dropdown when clicking outside
document.addEventListener('click', function (event) {
    if (!guessInput.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

function showModal(message) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <p>${message}</p>
        <button class="modal-button" onclick="closeModal()">OK</button>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    modal.style.display = 'none';
    document.body.removeChild(modal);
}

document.getElementById('submit-guess').addEventListener('click', function () {
    if (gameOver) return;

    const userGuess = guessInput.value.trim().toLowerCase();
    const correctAnswerLower = correctAnswer.toLowerCase();

    if (userGuess === correctAnswerLower) {
        document.getElementById('feedback').textContent = `Correct! The state was ${correctAnswer}.`;
        document.getElementById('feedback').style.color = 'green';
        showModal(`Correct! The state was ${correctAnswer}.`);
        gameOver = true;
    } else {
        attemptsLeft--;
        document.getElementById('attempts-left').value = `Attempts left: ${attemptsLeft}`;
        incorrectGuesses.push(userGuess);
        document.getElementById('attempts-left-' + attemptsLeft).value = userGuess;

        if (attemptsLeft === 0) {
            document.getElementById('feedback').textContent = `Game Over! The state was ${correctAnswer}.`;
            document.getElementById('feedback').style.color = 'red';
            showModal(`Game Over! The state was ${correctAnswer}.`);
            gameOver = true;
        } else {
            document.getElementById('feedback').textContent = 'Incorrect, try again!';
            document.getElementById('feedback').style.color = 'orange';
        }
    }

    if (gameOver) {
        guessInput.disabled = true;
        document.getElementById('submit-guess').disabled = true;
    }

    guessInput.value = '';
    dropdown.style.display = 'none'; // Hide dropdown after submission
});

document.getElementById('reload-button').addEventListener('click', function () {
    attemptsLeft = 5;
    incorrectGuesses = [];
    gameOver = false;

    for (let i = 0; i <= 4; i++) {
        document.getElementById('attempts-left-' + i).value = '';
    }
    document.getElementById('feedback').textContent = '';
    document.getElementById('attempts-left').value = `Attempts left: ${attemptsLeft}`;

    currentCountyIndex = Math.floor(Math.random() * countyImages.length);
    correctAnswer = stateNames[currentCountyIndex];
    document.getElementById('county-image').src = 'brazilian_states_svgs/' + countyImages[currentCountyIndex];

    guessInput.disabled = false;
    document.getElementById('submit-guess').disabled = false;
    guessInput.value = '';
    dropdown.style.display = 'none';

    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }

    const correctAnswerElement = document.querySelector('.correct-answer');
    if (correctAnswerElement) {
        correctAnswerElement.remove();
    }

    document.getElementById('feedback').textContent = '';
});