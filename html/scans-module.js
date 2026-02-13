import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();
const carsContainer = document.getElementById("carsContainer");
const scansList = document.getElementById("scansList");
let currentUser = null;

function showCars(user) {
    const carsRef = ref(db, `users/${user.uid}/cars`);
    onValue(carsRef, snap => {
                carsContainer.innerHTML = "";
                scansList.innerHTML = "";
                snap.forEach(carSnap => {
                            const car = carSnap.val();
                            const carId = carSnap.key;
                            const div = document.createElement("div");
                            div.className = "card bg-dark text-white p-2";
                            div.style.cursor = "pointer";
                            div.style.width = "200px";
                            let imgUrl = car.img || "";
                            div.innerHTML = `
                <h5>${car.make} ${car.model} (${car.year})</h5>
                <p>Plate: ${car.plate}</p>
                ${imgUrl ? `<img src="${imgUrl}" style="max-width:180px; display:block; margin:auto;">` : ""}
            `;
            div.addEventListener("click", () => showCarScans(user.uid, carId));
            carsContainer.appendChild(div);
        });
    });
}

function showCarScans(uid, carId) {
    scansList.innerHTML = "<h4>סריקות קודמות של הרכב</h4>";
    const scansRef = ref(db, `users/${uid}/cars/${carId}/scans`);
    onValue(scansRef, snap => {
        scansList.innerHTML = "<h4>סריקות קודמות של הרכב</h4>";
        if (!snap.exists()) {
            scansList.innerHTML += "<p>אין סריקות קודמות לרכב זה</p>";
            return;
        }
        snap.forEach(scanSnap => {
            const scan = scanSnap.val();
            const div = document.createElement("div");
            div.className = "alert alert-info mt-2 text-dark";
            div.innerHTML = `
                <strong>תקלה:</strong> ${scan.label || "לא ידוע"}<br>
                <small>${scan.timestamp ? new Date(scan.timestamp + 3 * 60 * 60 * 1000).toLocaleString("he-IL") : ""}</small>
            `;
            scansList.appendChild(div);
        });
    });
}

onAuthStateChanged(auth, user => {
    if (!user) {
        carsContainer.innerHTML = "<p>נא להתחבר כדי לראות רכבים וסריקות</p>";
        scansList.innerHTML = "";
        return;
    }
    currentUser = user;
    showCars(user);
});