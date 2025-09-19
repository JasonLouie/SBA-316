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
    p: { id: "text-recommend", innerHTML: 'Already have an account? <span class="login">Login</span>' }
};

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
    p: { id: "text-recommend", innerHTML: `Don't have an account? <span class="signup">Sign Up</span>` }
};

const resultsForm = {
    h1: { textContent: "Results" },
    mainText: { // paragraph element
        textContent: {
            win: "Congratulations! You successfully guessed today's word!",
            lose: "Unfortunately, you ran out of guesses..."
        }
    },
    img: {
        win: {
            src: "./images/congratulations.png",
            alt: "Cute animal spreading confetti in celebration",
            className: "pic"
        },
        lose: {
            src: "./images/sad-depression.png",
            alt: "Cute animal brooding",
            className: "pic"
        }
    },
    div: { id: "stats" },
    p: [
        { id: "plugForAcc", textContent: "Want to view your past results?" },
        { id: "formOptions", innerHTML: '<span class="login">Login</span> or <span class="signup">Sign Up</span>' }
    ]
};

const wordList = ["audio", "range", "avert", "house", "latch", "itchy", "sully", "trust"];
// const validGuesses = []; // To be implemented. Need to use an API to fetch lots of words.
const answer = wordList[Math.floor(Math.random() * wordList.length)];
const start = Date.now();
const maxGuesses = 6;
const pastGuesses = [];
const keyboardColors = {}; // Used to color letters green or gray (exists/does not exist)

let guessPos = 0; // Index of the guess (row of the guess)
let letterPos = 0; // Index of the letter of the current guess (column of the guess)
let timeTaken = ""; // Used later on to revisit results

const guesses = document.getElementById("guesses");
const webKeyboard = document.getElementById("keyboard");
const loginSignUpDiv = document.getElementById("login-signup-div");
const overlayDiv = document.getElementById("overlay");
const resultsBtn = document.getElementById("resultsBtn");
const gameContainer = document.getElementById("wordle");

// Handles hovering over spans (expected to be login/sign up text)
function handleSpanHover(e) {
    e.preventDefault();
    if (e.target.localName === "span") {
        e.target.classList.toggle("span-hover-effect");
        if (loginSignUpDiv.contains(e.target)) { // Only do this for navbar login sign up spans
            e.target.classList.toggle(((e.target.textContent.toLowerCase()).includes("sign") ? "signup" : "login"));
        }
    }
}

// Handles clicking spans (expected to be login/sign up text)
function handleSpanClick(e) {
    e.preventDefault();
    if (e.target.localName === "span") {
        document.body.removeEventListener("keydown", handleUserKeyboard);
        if (overlayDiv.style.display === "none") {
            overlayDiv.style.display = "flex";
        }
        if (overlayDiv.firstElementChild) {
            overlayDiv.removeChild(overlayDiv.firstElementChild);
        }
        createOverlay("form", (loginSignUpDiv.contains(e.target)) ? e.target.id.slice(0, e.target.id.length - 3) : e.target.classList[0]);
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
        const keyValue = e.key.toLowerCase();
        handleInput(e.key.toLowerCase());
    }
}

// Handles adding/removing letter keys or action keys
function handleInput(letter) {
    const guessColors = {}; // Local letter colors
    const ansLetters = letterCounter(answer);
    const colorDict = { valid: "var(--green-bg)", exists: "var(--yellow-bg)", nonexistent: "var(--gray-bg)" };
    if (letter.length === 1 && (letterPos >= 0 && letterPos < 5) && (letter >= "a" && letter <= "z")) { // Handle letters
        addLetter(letter);
    } else if (letter === "enter") { // Handle complete guesses
        const userGuess = getGuess();
        if (userGuess.length < 5) { // Guess is too short
            createError("Your guess must contain five letters.");
        } else if (pastGuesses.includes(userGuess)) { // Repeated guess
            createError("Your guess cannot be a repeated guess.");
        } else if (userGuess === answer) { // Correct answer
            pastGuesses.push(userGuess);
            checkValidPositions(userGuess);
            displayGuessColors(); // Update guess to show colors
            displayKeyboardColors(); // Update colors on web keyboard
            endGame();
            createOverlay("results", "win");
        } else {
            // Find any letters in the user's guess that is in the correct position
            checkValidPositions(userGuess);

            // Filter the answer and guess to no exclude the matched letters
            const filteredAnswer = (Object.keys(guessColors).length > 0) ? filterAnswer() : answer;

            // Check which remaining letters exist or don't exist in the answer
            checkExistsNotExists(userGuess, filteredAnswer);
            displayGuessColors(); // Update guess to show colors
            displayKeyboardColors(); // Update colors on web keyboard
            letterPos = 0; // Reset position for typing
            guessPos++; // Move onto the next row
            pastGuesses.push(userGuess); // Add user's guess to the pastGuesses
            if (guessPos >= maxGuesses) { // Check if game should end
                endGame();
                createOverlay("results", "lose");
            }
        }
    } else if (letter === "backspace") {
        removeLetter();
    }

    // Shows error to the user
    function createError(errorMsg) {
        const errorDiv = document.createElement("div");
        errorDiv.id = "alert";
        const errorP = document.createElement("p");
        errorP.textContent = errorMsg;
        errorP.id = "alertText";
        errorDiv.appendChild(errorP);
        gameContainer.appendChild(errorDiv);
        setTimeout(() => {
            gameContainer.removeChild(errorDiv);
        }, 3000)
    }

    // Handles showing user's results only after the game ends
    function handleOpenResults(e) {
        if (e.target === e.currentTarget) {
            createOverlay("results", `${(pastGuesses.includes(answer)) ? "win" : "lose"}`)
        }
    }

    // Ends the game
    function endGame() {
        // Remove all event listeners related to playing the game
        document.body.removeEventListener("keydown", handleUserKeyboard);
        webKeyboard.removeEventListener("mouseover", handleKeyHover);
        webKeyboard.removeEventListener("mouseout", handleKeyHover);
        webKeyboard.removeEventListener("click", handleWebKeyboard);
        resultsBtn.addEventListener("click", handleOpenResults); // Allow user to view today's results
        resultsBtn.style.visibility = "visible";
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
        for (const letter in keyboardColors) {
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
        let filteredAnswer = "";
        for (let i = 0; i < answer.length; i++) {
            if (guessColors[i] === "valid") {
                ansLetters[answer[i]]--; // Update the letter count
            } else {
                filteredAnswer += answer[i];
            }
        }
        return filteredAnswer;
    }

    // Returns an object of key-value pair letter: count
    function letterCounter(word) {
        const counter = {};
        for (const letter of word) {
            counter[letter] = (counter[letter] || 0) + 1;
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
        for (let i = 0; i < guess.length; i++) {
            if (guessColors[i] === "valid") {
                continue;
            } else if (answer.includes(guess[i]) && ansLetters[guess[i]] > 0) { // Current letter is in the answer, but in the wrong position
                ansLetters[guess[i]]--;
                guessColors[i] = "exists";
                if (keyboardColors[guess[i]] != "valid") { // Do not overwrite keys that are valid in the global object
                    keyboardColors[guess[i]] = "exists";
                }
            } else { // Current letter is not in the answer
                guessColors[i] = "nonexistent";
                if (keyboardColors[guess[i]] != "valid" && keyboardColors[guess[i]] != "exists") { // Do not overwrite keys that are valid or exist in the global object.
                    keyboardColors[guess[i]] = "nonexistent";
                }
            }
        }
    }
}

// Creates the frag within the overlay
function createOverlay(category, type) {
    const frag = document.createDocumentFragment();
    if (category === "form" && type) {
        overlayDiv.removeEventListener("mouseover", handleImgHover);
        overlayDiv.removeEventListener("mouseout", handleImgHover);
        const formContainer = frag.appendChild(document.createElement("div"));
        const form = formContainer.appendChild(document.createElement("form"));
        form.addEventListener("submit", (type === "login") ? handleLogin : handleSignUp);
        formContainer.classList.add("loginsignupform");
        form.id = `${type}-form`;
        form.noValidate = true;
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
                    if (inputAttr.name != "confirmPassword") {
                        const errorMsg = form.appendChild(document.createElement("p"));
                        errorMsg.id = `${inputAttr.name}Error`;
                        errorMsg.classList.add("form-error");
                    }
                }
            } else { // h1, p, and submit button
                form.appendChild(Object.assign(document.createElement(elementTag), formInfo[elementTag]));
            }
        }
        form.querySelector("span").addEventListener("click", handleSpanClick);
    } else if (category === "results" && type) {
        overlayDiv.addEventListener("mouseover", handleImgHover);
        overlayDiv.addEventListener("mouseout", handleImgHover);
        const divContainer = frag.appendChild(document.createElement("div"));
        divContainer.id = category;
        for (const elementTag in resultsForm) {
            if (elementTag === "div") { // Handle stats
                const div = divContainer.appendChild(document.createElement(elementTag));
                div.id = resultsForm[elementTag].id;
                const stat1 = div.appendChild(document.createElement("p"));
                const stat2 = div.appendChild(document.createElement("p"));
                timeTaken = (timeTaken) ? timeTaken : timeElapsed();
                stat1.textContent = (type === "win") ? `It took you ${guessPos + 1} ${(guessPos + 1 === 1) ? "try" : "tries"} to guess today's word.` : countExistsAndValids();
                stat2.textContent = `You ${(type === "win") ? "completed" : "played"} the game ${(type === "win") ? "in" : "for"} ${timeTaken}`;
            } else if (elementTag === "img") {
                const img = divContainer.appendChild(Object.assign(document.createElement(elementTag), resultsForm[elementTag][type]));
            } else if (elementTag === "p") {
                for (const pAttr of resultsForm[elementTag]) {
                    divContainer.appendChild(Object.assign(document.createElement(elementTag), pAttr));
                }
            } else if (elementTag === "mainText") {
                const mainText = divContainer.appendChild(document.createElement("p"));
                mainText.id = "message";
                mainText.textContent = resultsForm[elementTag].textContent[type];
            } else { // h1
                divContainer.appendChild(Object.assign(document.createElement(elementTag), resultsForm[elementTag]));
            }
        }
        const formOptions = divContainer.querySelector("#formOptions");
        formOptions.addEventListener("click", handleSpanClick);

        function timeElapsed() {
            const totalSeconds = Math.floor((Date.now() - start) / 1000);
            const secondsPassed = totalSeconds % 60;
            const minutesPassed = (totalSeconds - secondsPassed) / 60;
            if (minutesPassed > 0) {
                if (secondsPassed > 0) { // Minutes and seconds
                    return `${minutesPassed} minute${(minutesPassed === 1) ? "" : "s"} and ${secondsPassed} second${(secondsPassed === 1) ? "" : "s"}.`;
                } else { // No seconds, but there are minutes
                    return `${minutesPassed} minute${(minutesPassed === 1) ? "" : "s"}.`;
                }
            }
            else if (secondsPassed > 0) { // No minutes, but there seconds
                return `${secondsPassed} second${(secondsPassed === 1) ? "" : "s"}.`;
            } else {
                return "0 seconds!?";
            }
        }

        function countExistsAndValids() {
            let validCount = 0;
            let existCount = 0;
            for (const letter in keyboardColors) {
                if (keyboardColors[letter] === "valid") {
                    validCount++;
                } else if (keyboardColors[letter] === "exists") {
                    existCount++;
                }
            }
            if (validCount > 0) {
                if (existCount > 0) { // User found at least one letter in the correct position and at least one letter that is in the word, but not in the correct position.
                    return `You found ${validCount} letter${(validCount === 1) ? "" : "s"} in the correct position and ${existCount} letter${(existCount === 1) ? "" : "s"} that exist in the word.`;
                } else { // User only found at least one letter in the correct position.
                    return `You found ${validCount} letter${(validCount === 1) ? "" : "s"} in the correct position.`;
                }
            }
            else if (existCount > 0) { // User only found at least one letter that is in the word, but not in the correct position.
                return `You found ${existCount} letter${(existCount === 1) ? "" : "s"} that exist in the word.`;
            } else { // User did not find any letters in the correct position or letters that exist in the answer, but are in the wrong position.
                return "None of your guesses were close to today's word. Better luck next time!";
            }
        }
    } else if (category === "settings") {

    } else if (category === "instructions") {

    }
    overlayDiv.style.display = "flex";
    overlayDiv.appendChild(frag);
    const divContainer = overlayDiv.firstElementChild;
    divContainer.addEventListener("mouseover", handleSpanHover);
    divContainer.addEventListener("mouseout", handleSpanHover);
    divContainer.addEventListener("click", (e) => e.stopPropagation()); // Prevent clicks from reaching the overlayDiv
}

// Handles closing the overlay and returning back to the game
function closeOverlay(e) {
    e.preventDefault();
    if (e.target === e.currentTarget) { // Clicked outside of the overlay's children elements
        overlayDiv.style.display = "none";
        if (overlayDiv.firstElementChild){
            overlayDiv.removeChild(overlayDiv.firstElementChild);
        }
        if (timeTaken === ""){ // Only reactivate this event listener if game isn't done. This variable is non-empty when the game ends.
            document.body.addEventListener("keydown", handleUserKeyboard);
        }
    }
}

// Handles switching from png to gif for results pic. When cursor is in the overlayDiv only, pause. If the cursor is anywhere inside the child element, animate (turn it back into a gif).
function handleImgHover(e) {
    if (overlayDiv.style.display === "flex") { // Only do this if the overlay div is not hidden
        if (e.target != e.currentTarget) { // In the overlay div's child element, so make the img a gif.
            const img = document.getElementsByClassName("pic")[0];
            const imgType = img.src.slice(-3);
            if (imgType == "png") {
                img.src = img.src.slice(0, -3) + "gif";
            }
        } else { // Make the img back to a png (cursor is in the overlay div)
            const img = document.getElementsByClassName("pic")[0];
            const imgType = img.src.slice(-3);
            if (imgType == "gif") {
                img.src = img.src.slice(0, -3) + "png";
            }
        }
    }
}

// Checks if email exists in localStorage
function emailExists(email) {
    const userObjects = JSON.parse(localStorage.getItem("users")); // Retrieve array of user objects
    if (userObjects.length > 0) {
        for (const user of userObjects) {
            if (user.email === email) {
                return true;
            }
        }
    }
    return false;
}

// Handles form validation for user sign up
function handleSignUp(e) {
    e.preventDefault(); // Prevent form from reloading page
    const form = overlayDiv.querySelector("form");
    const email = form.elements["email"].value.toLowerCase();
    const password = form.elements["password"].value;
    const passwordConfirm = form.elements["confirmPassword"].value;
    const emailErrorDisplay = form.querySelector("#emailError");
    const passwordErrorDisplay = form.querySelector("#passwordError");

    const emailErrors = validateEmail();
    const passwordErrors = validatePassword();

    if (!(emailErrors || passwordErrors)) { // If there are no errors with either field, handle signing up.
        // Create the user object for local storage.
        const userObject = {
            email: email,
            password: password
        };
        const userStorage = JSON.parse(localStorage.getItem("users"));
        form.reset();
        emailErrorDisplay.textContent = ""; // Reset email error to have no text content.
        passwordErrorDisplay.textContent = ""; // Reset password error to have no text content.
        userStorage.push(userObject);
        localStorage.setItem("users", JSON.stringify(userStorage));
        alert("Sign up was successful!");
    } else { // Validation failed, so form should not be submitted.
        emailErrorDisplay.textContent = (emailErrors) ? emailErrors : ""; // Show an error if it exists, otherwise don't.
        passwordErrorDisplay.textContent = (passwordErrors) ? passwordErrors : ""; // Show an error if it exists, otherwise don't.
    }

    function validateEmail() {
        if (!email) {
            return "Email cannot be blank.";
        } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return "Must be a valid email address.";
        } else if (emailExists(email)) {
            return "Email is already taken.";
        }
        return "";
    }

    function validatePassword() {
        if (password === "") {
            return "Password cannot be blank.";
        } else if (password.length < 10) {
            return "Must be at least 10 characters long.";
        } else if (!password.match(/\W/)) {
            return "Must contain at least one special character.";
        } else if (password.toLowerCase().match(/password/)) {
            return 'Cannot contain the word "password".';
        } else if (password != passwordConfirm) {
            return "Both passwords must match.";
        }
        return "";
    }
}

// Handles form validation for user login
function handleLogin(e) {
    e.preventDefault(); // Prevent form from reloading page
    const form = overlayDiv.querySelector("form");
    const email = form.elements["email"].value.toLowerCase();
    const password = form.elements["password"].value;
    const emailErrorDisplay = form.querySelector("#emailError");
    const passwordErrorDisplay = form.querySelector("#passwordError");

    const emailErrors = validateEmail();
    const passwordErrors = validatePassword();

    if (!(emailErrors && passwordErrors)) {
        emailErrorDisplay.textContent = ""; // Reset email error to have no text content.
        passwordErrorDisplay.textContent = ""; // Reset password error to have no text content.
        form.reset();
        alert("Login was successful!");
    } else {
        emailErrorDisplay.textContent = (emailErrors) ? emailErrors : ""; // Show an error if it exists, otherwise don't.
        passwordErrorDisplay.textContent = (passwordErrors) ? passwordErrors : ""; // Show an error if it exists, otherwise don't.
    }

    function validatePassword() {
        if (!password) {
            return "Password cannot be blank.";
        } else {
            return (validateLoginInfo(email, password)) ? "" : "Incorect Password.";
        }
    }

    function validateEmail() {
        if (!email) {
            return "Email cannot be blank.";
        } else if (!emailExists(email)) {
            return "An account with this email does not exist.";
        }
        return "";
    }

    function validateLoginInfo(email, password) {
        const userObjects = JSON.parse(localStorage.getItem("users")); // Retrieve array of user objects
        if (userObjects.length > 0) {
            for (const user of userObjects) {
                if (user.email === email && user.password === password) {
                    return true;
                }
            }
        }
        return false;
    }
}

// Bonus todos:
// Create the settings pop up, and instructions pop up.
// Settings - dark mode toggle (do research)
// Instructions - Just show how to play the game. Maybe an interactive side scroller with guesses and examples?

// Web keyboard responsiveness
webKeyboard.addEventListener("mouseover", handleKeyHover);
webKeyboard.addEventListener("mouseout", handleKeyHover);
webKeyboard.addEventListener("click", handleWebKeyboard);

// Span responsiveness for nav bar login/signup
loginSignUpDiv.addEventListener("click", handleSpanClick);
loginSignUpDiv.addEventListener("mouseover", handleSpanHover);
loginSignUpDiv.addEventListener("mouseout", handleSpanHover);

// User input responsiveness
document.body.addEventListener("keydown", handleUserKeyboard);

// Closing pop up overlay by clicking on it
overlayDiv.addEventListener("click", closeOverlay);

// Initialize the local storage for users.
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
}
// console.log(localStorage);