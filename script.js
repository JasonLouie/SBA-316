const keyPos = [
    { q: [0, 0], w: [0, 1], e: [0, 2], r: [0, 3], t: [0, 4], y: [0, 5], u: [0, 6], i: [0, 7], o: [0, 8], p: [0, 9] },
    { a: [1, 0], s: [1, 1], d: [1, 2], f: [1, 3], g: [1, 4], h: [1, 5], j: [1, 6], k: [1, 7], l: [1, 8] },
    { enter: [2, 0], z: [2, 1], x: [2, 2], c: [2, 3], v: [2, 4], b: [2, 5], n: [2, 6], m: [2, 7], backspace: [2, 8] }
]

// Object containing information to create the sign up form
const signUpForm = {
    h1: { textContent: "Sign Up" },
    div: { id: "form-mode", button: [
        {type: "button", textContent: "Login"}, 
        {type: "button", textContent: "Sign Up", className: "signup"}
    ]},
    input: [
        {type: "text", name: "username", placeholder: "Username", className: "field", autocomplete: "username"},
        {type: "email", name: "email", placeholder: "Email", className: "field", autocomplete: "email"},
        {type: "password", name: "password", placeholder: "Password", className: "field", autocomplete: "new-password"},
        {type: "password", name: "confirmPassword", placeholder: "Confirm password", className: "field"}
    ],
    button: {type: "button", textContent: "Sign Up", id: "submit", className: "signup"},
    p: {innerHTML: 'Already have an account? <span class="login">Login</span>'}
}

// Object containing information to create the login form
const loginForm = {
    h1: { textContent: "Login" },
    div: { id: "form-mode", button: [
        {type: "button", textContent: "Login", className: "login"}, 
        {type: "button", textContent: "Sign Up"}
    ]},
    input: [
        {type: "text", name: "username", placeholder: "Username", className: "field", autocomplete: "username"},
        {type: "password", name: "password", placeholder: "Password", className: "field", autocomplete: "new-password"},
    ],
    button: {type: "button", textContent: "Login", id: "submit", className: "login"},
    p: {innerHTML: `Don't have an account? <span class="signup">Sign Up</span>`}
}

const wordList = ["audio", "range", "avert", "house", "etch", "itch", "sully"]
const answer = wordList[Math.floor(Math.random() * wordList.length)];
const maxGuesses = 6;

let guessPos = 0; // Index of the guess (row of the guess)
let letterPos = 0; // Index of the letter of the current guess

const guesses = document.getElementById("guesses");
const webKeyboard = document.getElementById("keyboard");
const loginSignUpDiv = document.getElementById("login-signup-div");
const overlayDiv = document.getElementById("overlay");

// Creates the interactive web keyboard
function createWebKeyboard() {
    const frag = document.createDocumentFragment();
    for (const row of keyPos) {
        const keyRow = frag.appendChild(document.createElement("div"));
        keyRow.classList.add("keyRow");
        for (const key in row) {
            const keyButton = keyRow.appendChild(document.createElement("button"));
            keyButton.value = key;
            keyButton.classList.add("key");
            if (key.length === 1) { // Letter
                keyButton.textContent = key.toUpperCase();
                keyButton.classList.add("keyLetter");
            } else {
                if (key === "enter") { // Enter button only
                    keyButton.textContent = "Enter";
                }
                keyButton.classList.add("actionBtn");
                keyButton.id = key.toLowerCase();
            }
        }
    }
    webKeyboard.appendChild(frag);
}

// Do this every time a key on the interactive web keyboard is hovered over
function handleKeyHover(e) {
    e.preventDefault();
    if (e.target.localName === "button") {
        e.target.classList.toggle("key-hover-effect");
    }
}

function handleSpanHover(e) {
    e.preventDefault();
    if (e.target.localName === "span") {
        e.target.classList.toggle("nav-hover-effect");
        if(e.target.parentElement.localName != "p"){
            e.target.classList.toggle(((e.target.textContent.toLowerCase()).includes("sign") ? "signup" : "login"));
        }
    }
}

function handleSpanClick(e) {
    e.preventDefault();
    if (e.target.localName === "span") {
        console.log("Clicked span!");
        if (overlayDiv.style.display === "none"){
            overlayDiv.style.display = "flex";
            document.body.removeEventListener("keydown", handleUserKeyboard);
        }
        overlayDiv.removeChild(overlayDiv.firstElementChild);
        createOverlay((loginSignUpDiv.contains(e.target))? e.target.id.slice(0, e.target.id.length - 3) : createOverlay(e.target.classList[0]));        
    }
}

function handleWebKeyboard(e) {
    e.preventDefault();
    if (e.target.localName === "button" && e.target.classList.contains("key")) {
        handleInput(e.target.value.toLowerCase());
    }
}

function handleUserKeyboard(e) {
    e.preventDefault();
    if (e instanceof KeyboardEvent && !e.repeat) {
        handleInput(e.key.toLowerCase());
    }
}

// Handles adding/removing letter keys or action keys
function handleInput(letter) {
    if (letter.length === 1 && (letterPos >= 0 && letterPos < 5)) { // Handle letters
        addLetter(letter);
    } else if (letter === "enter") { // Handle complete guesses
        const userGuess = getGuess();
        if (userGuess.length < 5) { // Guess is too short

        } else if (userGuess === answer) { // Correct answer

        }
    } else if (letter === "backspace") {
        removeLetter();
    }

    function displayGuessColors() {

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

    function getGuess() {
        let word = "";
        for (const letter of guesses.children[guessPos].children) {
            word += letter.textContent;
        }
        return word;
    }
}

// Refactor to only create the frag and update
function createOverlay(type) {
    const frag = document.createDocumentFragment();
    if (type === "login") {
        const form = frag.appendChild(document.createElement("form"));
        form.id = "login-form";
        for (const elementTag in loginForm){
            if (elementTag === "div"){
                const div = form.appendChild(document.createElement(elementTag));
                div.id = loginForm[elementTag].id;
                for(const buttonAttr of loginForm[elementTag].button){
                    div.appendChild(Object.assign(document.createElement("button"), buttonAttr));
                }
            } else if (elementTag === "input"){
                for(const inputAttr of loginForm[elementTag]){
                    form.appendChild(Object.assign(document.createElement(elementTag), inputAttr));
                }
            } else { // h1 and submit button
                form.appendChild(Object.assign(document.createElement(elementTag), loginForm[elementTag]));
            }
        }
    } else if (type === "signup") {
        const form = frag.appendChild(document.createElement("form"));
        form.id = "signup-form";
        for (const elementTag in signUpForm){
            if (elementTag === "div"){
                const div = form.appendChild(document.createElement(elementTag));
                div.id = signUpForm[elementTag].id;
                for(const buttonAttr of signUpForm[elementTag].button){
                    div.appendChild(Object.assign(document.createElement("button"), buttonAttr));
                }
            } else if (elementTag === "input"){
                for(const inputAttr of signUpForm[elementTag]){
                    form.appendChild(Object.assign(document.createElement(elementTag), inputAttr));
                }
            } else { // h1 and submit button
                form.appendChild(Object.assign(document.createElement(elementTag), signUpForm[elementTag]));
            }
        }
    }
    overlayDiv.appendChild(frag);
    overlayDiv.style.display = "flex";
}

function closeOverlay(e) {
    e.preventDefault();
    if (!overlayDiv.firstElementChild.contains(e.target)){ // Clicked outside of the firstElementChild
        overlayDiv.style.display = "none";
        document.body.addEventListener("keydown", handleUserKeyboard);
    }
    // Otherwise clicked inside firstElementChild
}

// 4 Scenarios:
// First open -> 
// Check if overLayDiv has a child or is still display flex
// Display flex if necessary, then create frag and add the child to overLayDiv
// still open -> remove the child, then recreate as needed
// Clicked outside -> remove child then display none

// Main stuff


webKeyboard.addEventListener("mouseover", handleKeyHover);
webKeyboard.addEventListener("mouseout", handleKeyHover);
webKeyboard.addEventListener("click", handleWebKeyboard);

document.body.addEventListener("click", handleSpanClick);
document.body.addEventListener("mouseover", handleSpanHover);
document.body.addEventListener("mouseout", handleSpanHover);

document.body.addEventListener("keydown", handleUserKeyboard);

overlayDiv.addEventListener("click", closeOverlay);

document.onreadystatechange = () => {
    if (document.readyState === "interactive") {
        createWebKeyboard();
    }
};