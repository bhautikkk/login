// Menu elements
const menu = document.getElementById("menuOverlay");
const btnSolo = document.getElementById("btnSolo");
const btnCreate = document.getElementById("btnCreate");
const btnJoin = document.getElementById("btnJoin");
const roomCodeInput = document.getElementById("roomCodeInput");
const roomInfo = document.getElementById("roomInfo");

// ❗ IMPORTANT: Menu ke andar click/touch game tak mat jaane do
if (menu) {
    menu.addEventListener("mousedown", (e) => {
        e.stopPropagation();    // window wale mousedown tak event nahi jayega
    });

    menu.addEventListener("touchstart", (e) => {
        e.stopPropagation();
    });
}

// 6 digit code generator
function generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// PLAY ALONE
btnSolo.onclick = () => {
    // Sirf menu hide kar rahe hain, game abhi bhi "getReady" state me hoga
    // user canvas pe tap karega to hi game start hoga
    menu.style.display = "none";
};

// CREATE ROOM
btnCreate.onclick = () => {
    const code = generateRoomCode();
    roomInfo.textContent = "Room Code: " + code;
    // Yahin future me "host room" ka socket code aayega
};

// JOIN ROOM
btnJoin.onclick = () => {
    let code = roomCodeInput.value.trim();
    if (code.length < 6) {
        roomInfo.textContent = "Enter valid 6-digit code!";
        return;
    }

    roomInfo.textContent = "Joining room: " + code;
    // Abhi ke liye: menu hide, game normal start jaise
    menu.style.display = "none";
};
