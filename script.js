// Object containing information on web keyboard. Used to quickly access the specific key
const keyDict = {
    q: { row: 0, col: 0 }, w: { row: 0, col: 1 }, e: { row: 0, col: 2 }, r: { row: 0, col: 3 }, t: { row: 0, col: 4 }, y: { row: 0, col: 5 }, u: { row: 0, col: 6 }, i: { row: 0, col: 7 }, o: { row: 0, col: 8 }, p: { row: 0, col: 9 },
    a: { row: 1, col: 0 }, s: { row: 1, col: 1 }, d: { row: 1, col: 2 }, f: { row: 1, col: 3 }, g: { row: 1, col: 4 }, h: { row: 1, col: 5 }, j: { row: 1, col: 6 }, k: { row: 1, col: 7 }, l: { row: 1, col: 8 },
    z: { row: 2, col: 1 }, x: { row: 2, col: 2 }, c: { row: 2, col: 3 }, v: { row: 2, col: 4 }, b: { row: 2, col: 5 }, n: { row: 2, col: 6 }, m: { row: 2, col: 7 }
};

// Object containing information to create the sign up form
const signUpForm = {
    h1: { textContent: "Sign Up" },
    div: {
        id: "form-mode", p: [
            { textContent: "Login", className: "selectable unselected" },
            { textContent: "Sign Up", className: "signup selectable selected" }
        ]
    },
    input: [
        { type: "email", name: "email", placeholder: "Email", className: "field", autocomplete: "email" },
        { type: "password", name: "password", placeholder: "Password", className: "field", autocomplete: "new-password" },
        { type: "password", name: "confirmPassword", placeholder: "Confirm password", className: "field" }
    ],
    button: { type: "submit", textContent: "Sign Up", id: "submit", className: "signup" },
    p: { innerHTML: 'Already have an account? <span class="login">Login</span>' }
    // p: { innerHTML: 'Already have an account?' }
}

// Object containing information to create the login form
const loginForm = {
    h1: { textContent: "Login" },
    div: {
        id: "form-mode", p: [
            { textContent: "Login", className: "login selectable selected" },
            { textContent: "Sign Up", className: "selectable unselected" }
        ]
    },
    input: [
        { type: "email", name: "email", placeholder: "Email", className: "field", autocomplete: "email" },
        { type: "password", name: "password", placeholder: "Password", className: "field", autocomplete: "current-password" },
    ],
    button: { type: "submit", textContent: "Login", id: "submit", className: "login" },
    p: { innerHTML: `Don't have an account? <span class="signup">Sign Up</span>` }
    // p: { innerHTML: `Don't have an account?` }
}

const wordList = ["audio", "range", "avert", "house", "latch", "itchy", "sully"]
// const answer = wordList[Math.floor(Math.random() * wordList.length)];
const answer = "trust";
// console.log(answer);
const maxGuesses = 6;
const pastGuesses = [];
const keyboardColors = {}; // Used to color letters green or gray (exists/does not exist)

let guessPos = 0; // Index of the guess (row of the guess)
let letterPos = 0; // Index of the letter of the current guess

const guesses = document.getElementById("guesses");
const webKeyboard = document.getElementById("keyboard");
const loginSignUpDiv = document.getElementById("login-signup-div");
const overlayDiv = document.getElementById("overlay");

// Handles hovering over spans (expected to be login/sign up text)
function handleSpanHover(e) {
    e.preventDefault();
    if (e.target.localName === "span") {
        e.target.classList.toggle("nav-hover-effect");
        if (e.target.parentElement.localName != "p") {
            e.target.classList.toggle(((e.target.textContent.toLowerCase()).includes("sign") ? "signup" : "login"));
        }
    }
}

// Handles clicking spans (expected to be login/sign up text)
function handleSpanClick(e) {
    e.preventDefault();
    if (e.target.localName === "span") {
        if (overlayDiv.style.display === "none") {
            overlayDiv.style.display = "flex";
            document.body.removeEventListener("keydown", handleUserKeyboard);
        }
        overlayDiv.removeChild(overlayDiv.firstElementChild);
        createOverlay((loginSignUpDiv.contains(e.target)) ? e.target.id.slice(0, e.target.id.length - 3) : e.target.classList[0]);
    }
}

// Handles hovering over a key on the interactive web keyboard
function handleKeyHover(e) {
    e.preventDefault();
    if (e.target.localName === "button") {
        e.target.classList.toggle("key-hover-effect");
    }
}

// Handles button presses on web keyboard
function handleWebKeyboard(e) {
    e.preventDefault();
    if (e.target.localName === "button" && e.target.classList.contains("key")) {
        handleInput(e.target.value.toLowerCase());
    }
}

// Handles user's keyboard input
function handleUserKeyboard(e) {
    e.preventDefault();
    if (e instanceof KeyboardEvent && !e.repeat) {
        handleInput(e.key.toLowerCase());
    }
}

// Handles adding/removing letter keys or action keys
function handleInput(letter) {
    const guessColors = {}; // Local letter colors
    const ansLetters = letterCounter(answer);
    const colorDict = { valid: "var(--green-bg)", exists: "var(--yellow-bg)", nonexistent: "var(--gray-bg)" };
    if (letter.length === 1 && (letterPos >= 0 && letterPos < 5)) { // Handle letters
        addLetter(letter);
    } else if (letter === "enter") { // Handle complete guesses
        const userGuess = getGuess();
        if (userGuess.length < 5) { // Guess is too short

        } else if(pastGuesses.includes(userGuess)) { // Repeated guess

        }else if (userGuess === answer) { // Correct answer
            checkValidPositions(userGuess);
            displayGuessColors(); // Update guess to show colors
            displayKeyboardColors(); // Update colors on web keyboard
            endGame();
            createOverlay("win");
        } else {
            // Find any letters in the user's guess that is in the correct position
            checkValidPositions(userGuess);

            // Filter the answer and guess to no exclude the matched letters
            const filteredAnswer = (Object.keys(guessColors).length > 0) ? filterAnswer() : answer;

            // Check which remaining letters exist or don't exist in the answer
            checkExistsNotExists(userGuess, filteredAnswer);
            displayGuessColors(); // Update guess to show colors
            displayKeyboardColors(); // Update colors on web keyboard
            letterPos = 0;
            guessPos++;
            pastGuesses.push(userGuess);
            if (guessPos >= maxGuesses) {
                endGame();
                createOverlay("lose");
            }
        }
    } else if (letter === "backspace") {
        removeLetter();
    }

    // Ends the game
    function endGame() {
        // Remove all event listeners related to playing the game
        document.body.removeEventListener("keydown", handleUserKeyboard);
        webKeyboard.removeEventListener("mouseover", handleKeyHover);
        webKeyboard.removeEventListener("mouseout", handleKeyHover);
        webKeyboard.removeEventListener("click", handleWebKeyboard);
        overlayDiv.style.display = "flex";
    }

    // Updates the colors of the guess's letters based on valid, existing, and nonexisting indexes
    function displayGuessColors() {
        for (const index in guessColors) {
            guesses.children[guessPos].children[index].style.border = "none";
            guesses.children[guessPos].children[index].style.backgroundColor = colorDict[guessColors[index]];
        }
    }

    // Updates colors of the web keyboard's keys based on valid, existing, and nonexisting letters
    function displayKeyboardColors() {
        for(const letter in keyboardColors){
            // Use keyDict to set the key at that specific row and col to correct color
            webKeyboard.children[keyDict[letter].row].children[keyDict[letter].col].style.backgroundColor = colorDict[keyboardColors[letter]];
        }
    }

    // Adds a letter to the guess
    function addLetter(letter) {
        guesses.children[guessPos].children[letterPos].textContent = letter.toUpperCase();
        guesses.children[guessPos].children[letterPos].classList.add("typed");
        letterPos++;
    }

    // Removes a letter from the guess
    function removeLetter() {
        letterPos = (letterPos === 0) ? letterPos : letterPos - 1;
        guesses.children[guessPos].children[letterPos].textContent = "";
        guesses.children[guessPos].children[letterPos].classList.remove("typed");
    }

    // Combines all input from the current row into a five letter word
    function getGuess() {
        let word = "";
        for (const letter of guesses.children[guessPos].children) {
            word += letter.textContent;
        }
        return word.toLowerCase();;
    }

    // Removes letters from answer based on the correct indexes the user guessed
    function filterAnswer() {
        console.log("Filtering answer...")
        let filteredAnswer = "";
        for (let i = 0; i < answer.length; i++) {
            if (guessColors[i] === "valid") {
                ansLetters[answer[i]]--; // Update the letter count
            } else {
                filteredAnswer += answer[i];
            }
        }
        console.log(`Filtered answer is ${filteredAnswer}`);
        return filteredAnswer;
    }

    // Returns an object of key-value pair letter: count
    function letterCounter(word) {
        const counter = {};
        for (const letter of word) {
            if (counter[letter]) {
                counter[letter]++;
            } else {
                counter[letter] = 1;
            }
        }
        return counter;
    }

    // Finds indexes where the guess's letter is at the correct position and updates valid letters for keyboard
    function checkValidPositions(guess) {
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === answer[i]) {
                guessColors[i] = "valid";
                keyboardColors[guess[i]] = "valid";
            }
        }
    }

    // Check if letters not set as valid from the user's guess are included in the remaining letters of the answer. Updates the global object for showing web keyboard colors and the local object (object in this instance) for the current user's guess.
    function checkExistsNotExists(guess, answer) {
        console.log(`Comparing ${guess} to ${answer}`);
        for (let i = 0; i < guess.length; i++) {
            if (guessColors[i] === "valid") {
                continue;
            } else if (answer.includes(guess[i]) && ansLetters[guess[i]] > 0) {
                ansLetters[guess[i]]--;
                guessColors[i] = "exists";
                if (keyboardColors[guess[i]] != "valid") {
                    keyboardColors[guess[i]] = "exists";
                }
            } else {
                guessColors[i] = "nonexistent";
                keyboardColors[guess[i]] = "nonexistent";
            }
        }
    }
}

// Creates the frag within the overlay
function createOverlay(type) {
    console.log("Creating overlay for: ", type);
    const frag = document.createDocumentFragment();
    if (type === "login" || type === "signup") {
        const formContainer = frag.appendChild(document.createElement("div"));
        const form = formContainer.appendChild(document.createElement("form"));
        formContainer.classList.add("loginsignupform");
        form.id = `${type}-form`;
        const formInfo = (type === "login") ? loginForm : signUpForm;
        for (const elementTag in formInfo) {
            if (elementTag === "div") {
                const div = form.appendChild(document.createElement(elementTag));
                div.id = formInfo[elementTag].id;
                for (const pAttr of formInfo[elementTag].p) {
                    div.appendChild(Object.assign(document.createElement("p"), pAttr));
                }
            } else if (elementTag === "input") {
                for (const inputAttr of formInfo[elementTag]) {
                    form.appendChild(Object.assign(document.createElement(elementTag), inputAttr));
                }
            } else { // h1, p, and submit button
                form.appendChild(Object.assign(document.createElement(elementTag), formInfo[elementTag]));
            }
        }
    } else if (type === "win" || type === "lose") {
        const div = frag.appendChild(document.createElement("div"));
        div.id = "results";
    } else if (type === "settings") {

    }
    overlayDiv.style.display = "flex";
    overlayDiv.appendChild(frag);
    if (type === "login" || type === "signup"){
        const form = document.getElementById(`${type}-form`);
        form.parentElement.addEventListener("click", (e) => e.stopPropagation()); // Prevent clicks from reaching the overlayDiv
        form.addEventListener("submit", (type === "login") ? handleLogin : handleSignUp);
        form.querySelector(`span`).addEventListener("click", handleSpanClick);
    }
}

function closeOverlay(e) {
    e.preventDefault();
    if (e.target === e.currentTarget) { // Clicked outside of the overlay
        overlayDiv.style.display = "none";
        document.body.addEventListener("keydown", handleUserKeyboard);
    }
}

function emailExists(email) {
    const userObjects = JSON.parse(localStorage.getItem("users")); // Retrieve array of user objects
    if (userObjects.length > 0){
        for (const user of userObjects){
            if (user.email === email){
                return true;
            }
        }
    }
    return false;
}

// Handles form validation for user sign up
function handleSignUp(e) {
    e.preventDefault();
    console.log("Sign up validation");
    const form = overlayDiv.querySelector("form");
    const email = form.elements["email"].value.toLowerCase();
    const password = form.elements["password"].value;
    const passwordConfirm = form.elements["confirmPassword"].value;

    const emailErrors = validateEmail();
    const passwordErrors = validatePassword();

    if (!(emailErrors || passwordErrors)){
        console.log("No signup errors!");
        // Create the user object for local storage.
        const userObject = {
            email: email.toLowerCase(),
            password: password.value
        };
    } else { // Validation failed, so form should not be submitted.
        console.log("Found signup errors!");
    }

    function checkUpperLower(word) {
        let countLower = 0;
        let countUpper = 0;
        for (const ch in word){
            if (ch >= "a" && ch <= "z"){
                countLower++;
            } else if (ch >= "A" && ch <= "Z"){
                countUpper++;
            }
            if (countLower > 0 && countUpper > 0){
                return true;
            }
        }
        return false;
    }
    
    function validateEmail(){
        if (!email) {
            return "The email cannot be blank.";
        } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return "The email must be a valid email address.";
        } else if (emailExists(email)) {
            return "That email is already taken.";
        }
    }

    function validatePassword() {
        if (!password){
            return "Passwords must be at least 10 characters long.";
        } else if (!password.match(/\W/)) {
            return "Passwords must contain at least one special character.";
        } else if (password.toLowerCase().match(/password/)) {
            return 'Passwords cannot contain the word "password" (uppercase, lowercase, or mixed).';
        } else if (checkUpperLower(password)){
            return "Password must contain at least one uppercase and lowercase character."
        }else if (password != passwordConfirm){
            return "Both password must match.";
        }
    }
}

function handleLogin(e) {
    e.preventDefault();
    console.log("Login validation");
    const form = overlayDiv.querySelector("form");
    const email = form.elements["email"].value.toLowerCase();
    const password = form.elements["password"].value;

    // Handle login form
    if (form.children[0].textContent === "Login"){
        

    } else { // Handle sign up form

        
    }

    function validatePassword() {
        if (!password){

        }
    }

    function validateEmail(){
        if (!email) {
            return "The email cannot be blank.";
        } else if (!emailExists(email)) {
            return "An account with this email does not exist.";
        }
    }
}

// Create the function to show alerts for invalid guesses. Use setTimeOut or something for delaying so the alert is displayed for a reasonable amount of time.

// Create the results pop up, settings pop up, and instructions pop up.
// Maybe for results, show how long it took for each guess (maybe) and number of guesses it took
// Settings - dark mode toggle (do research)
// Instructions - Just show how to play the game. Maybe an interactive side scroller with guesses and examples?
// Form validation!
// Go back to rubric and see what needs to be added (what is missing?)

// Adding eventlisteners
webKeyboard.addEventListener("mouseover", handleKeyHover);
webKeyboard.addEventListener("mouseout", handleKeyHover);
webKeyboard.addEventListener("click", handleWebKeyboard);

loginSignUpDiv.addEventListener("click", handleSpanClick);
document.body.addEventListener("mouseover", handleSpanHover);
document.body.addEventListener("mouseout", handleSpanHover);

document.body.addEventListener("keydown", handleUserKeyboard);
overlayDiv.addEventListener("click", closeOverlay);

if (!localStorage.getItem("users")){
    localStorage.setItem("users", JSON.stringify([]));
}
console.log(localStorage);