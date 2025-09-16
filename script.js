const keyPos = [{q: [0, 0], w: [0, 1], e: [0, 2], r: [0, 3], t: [0, 4], y: [0, 5], u: [0, 6], i: [0, 7], o: [0, 8], p: [0, 9]}, {a: [1, 0], s: [1, 1], d: [1, 2], f: [1, 3], g: [1, 4], h: [1, 5], j: [1, 6], k: [1, 7], l: [1, 8]}, {Enter: [2, 0], z: [2, 1], x: [2, 2], c: [2, 3], v: [2, 4], b: [2, 5], n: [2, 6], m: [2, 7], Backspace: [2, 8]}]

const webKeyboard = document.getElementById("keyboard");
const wordList = ["audio", "range", "avert", "house", "etch", "itch", "sully"]
const answer = wordList[Math.floor(Math.random() * wordList.length)];

function createWebKeyboard() {
    const frag = document.createDocumentFragment();
    for(const row of keyPos){
        const keyRow = frag.appendChild(document.createElement("div"));
        keyRow.classList.add("keyRow");
        for (const key in row){
            const keyButton = keyRow.appendChild(document.createElement("button"));
            keyButton.value = key;
            keyButton.classList.add("key");
            if (key.length === 1){ // Letter
                keyButton.textContent = key.toUpperCase();
                keyButton.classList.add("keyLetter");
            } else{ // Enter button
                if (key === "Enter"){
                    keyButton.textContent = key;
                }
                keyButton.classList.add("actionBtn");
                keyButton.id = key.toLowerCase();
            }
        }
    }
    webKeyboard.appendChild(frag);
}

// Do this every time an element is hovered over
function handleHover(e) {
    e.preventDefault();
    if (e.target.localName != "div"){
        e.target.classList.toggle("hover-effect");
    }
}

function handleWebKeyboard(e) {

}

function handleUserKeyboard(e) {

}

// Handles adding/removing letters
function handleLetters(letter){

}

// Main stuff
webKeyboard.addEventListener("mouseover", handleHover);
webKeyboard.addEventListener("mouseout", handleHover);
webKeyboard.addEventListener("click", handleWebKeyboard);

if (document.readyState === "loading"){
    createWebKeyboard();
}