// ----- Firebase Config -----
const firebaseConfig = {
  apiKey: "AIzaSyByiXkAvHOqU-yISQfJDgedmjEOtZxJTaM",
  authDomain: "schoolfirstaidapp.firebaseapp.com",
  projectId: "schoolfirstaidapp",
  storageBucket: "schoolfirstaidapp.firebasestorage.app",
  messagingSenderId: "208082789848",
  appId: "1:208082789848:web:46ca8c857a4dcfcc1efead",
  measurementId: "G-35XMNR49D2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ----- Elements -----
const listElement = document.getElementById('first-aiders-list');
const searchBar = document.getElementById('search-bar');
const statusSelect = document.getElementById('status-select');
const updateBtn = document.getElementById('update-status-btn');
const firstAidersRef = db.collection('firstAiders');

const loginBtn = document.getElementById('login-btn');
const codeInput = document.getElementById('aider-code');
const loginError = document.getElementById('login-error');
const statusSection = document.getElementById('status-update');

let myAiderId = null;
let myAiderRef = null;
let notifiedAlerts = {};

// ----- Hybrid Login -----
loginBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if(!code) return;

    firstAidersRef.where('code', '==', code).get()
        .then(snapshot => {
            if(snapshot.empty){
                loginError.style.display = 'block';
            } else {
                loginError.style.display = 'none';
                const doc = snapshot.docs[0];
                myAiderId = doc.id;
                myAiderRef = firstAidersRef.doc(myAiderId);

                statusSection.style.display = 'block';
                document.getElementById('login-section').style.display = 'none';

                const data = doc.data();
                if(!data.status || data.status === 'offline'){
                    myAiderRef.update({ status: 'online' });
                }

                statusSelect.value = data.status || 'online';
            }
        })
        .catch(err => console.error(err));
});

// ----- Status Update -----
updateBtn.addEventListener('click', () => {
    if(!myAiderRef) return;
    const newStatus = statusSelect.value;
    myAiderRef.update({ status: newStatus });
});

// ----- Display First Aiders -----
function displayFirstAiders(aiders){
    listElement.innerHTML = '';
    if(aiders.length === 0){
        const li = document.createElement('li');
        li.textContent = 'No first aiders found.';
        listElement.appendChild(li);
        return;
    }

    aiders.forEach(aider => {
        const li = document.createElement('li');
        const infoDiv = document.createElement('div');

        const statusCircle = document.createElement('span');
        statusCircle.classList.add('status', aider.status);

        const namePhone = document.createElement('span');
        namePhone.textContent = `${aider.name} - ${aider.phone}`;

        if(aider.alert){
            const badge = document.createElement('span');
            badge.classList.add('alert-badge', 'pulse');
            badge.textContent = 'ALERT!';
            namePhone.appendChild(badge);

            if(!notifiedAlerts[aider.id]){
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
                audio.play();
                notifiedAlerts[aider.id] = true;
            }
        } else {
            notifiedAlerts[aider.id] = false;
        }

        infoDiv.appendChild(statusCircle);
        infoDiv.appendChild(namePhone);

        const alertBtn = document.createElement('button');
        alertBtn.classList.add('alert-btn');

        if(aider.alert){
            alertBtn.textContent = 'Resolve Alert';
            alertBtn.addEventListener('click', () => {
                firstAidersRef.doc(aider.id).update({ alert: false });
            });
        } else {
            if(aider.status === 'available' || aider.status === 'online'){
                alertBtn.textContent = 'Alert First Aider';
                alertBtn.addEventListener('click', () => {
                    firstAidersRef.doc(aider.id).update({ alert: true });
                });
            } else {
                alertBtn.textContent = 'Cannot Alert';
                alertBtn.disabled = true;
            }
        }

        li.appendChild(infoDiv);
        li.appendChild(alertBtn);
        listElement.appendChild(li);
    });
}

// ----- Real-time Listener -----
firstAidersRef.onSnapshot(snapshot => {
    const aiders = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        aiders.push({ id: doc.id, ...data });
    });
    displayFirstAiders(aiders);
});

// ----- Search Functionality -----
searchBar.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    firstAidersRef.get().then(snapshot => {
        const filtered = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if(data.name.toLowerCase().includes(term) || data.phone.includes(term)){
                filtered.push({ id: doc.id, ...data });
            }
        });
        displayFirstAiders(filtered);
    });
});
