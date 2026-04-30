// --- 1. GESTION DES COMPTES ---
function register() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(user && pass) {
        localStorage.setItem(user, pass);
        alert("Compte créé !");
    }
}

function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(localStorage.getItem(user) === pass && user !== "") {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('generatorSection').style.display = 'block';
        document.getElementById('userDisplay').innerText = user;
    } else {
        alert("Erreur de connexion");
    }
}

function logout() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('generatorSection').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// --- 2. GÉNÉRATEUR DE CARTE AVEC QR CODE ---
function generateFinalCard() {
    const canvas = document.getElementById('otakuCanvas');
    const ctx = canvas.getContext('2d');
    
    const pseudo = document.getElementById('pseudoInput').value || "Utilisateur";
    const statut = document.getElementById('statutInput').value || "Membre";
    const passions = document.getElementById('passionsInput').value || "...";
    const classement = document.getElementById('classementInput').value || "N/A";
    const imageInput = document.getElementById('imageInput');

    // --- CONFIGURATION DU LIEN DE TON SITE ---
    const lienMonSite = "https://ton-site-otaku.com"; // REMPLACE PAR TON VRAI LIEN ICI

    const cardBase = new Image();
    cardBase.src = '1777295010788.png'; 

    cardBase.onload = function() {
        canvas.style.display = "block";
        ctx.drawImage(cardBase, 0, 0, 1000, 641);

        // Dessin du texte (sans les étoiles, comme demandé)
        ctx.fillStyle = "black";
        ctx.font = "bold 45px Arial"; 
        ctx.fillText(pseudo, 350, 225); 

        ctx.font = "bold 28px Arial";
        ctx.fillText(statut, 350, 325); 

        ctx.font = "20px Arial";
        ctx.fillText(passions, 350, 395); 

        ctx.font = "bold 32px Arial";
        ctx.fillText("Niveau " + classement, 350, 480); 

        // --- AJOUT DU QR CODE ---
        const qrDiv = document.createElement('div');
        new QRCode(qrDiv, {
            text: lienMonSite,
            width: 80,
            height: 80,
            colorDark : "#000000",
            colorLight : "#ffffff",
        });

        // Gestion de la photo et du téléchargement
        let photoLoaded = false;

        const finishCard = () => {
            if (photoLoaded || !imageInput.files || !imageInput.files[0]) {
                const downloadLink = document.getElementById('downloadLink');
                if(downloadLink) {
                    downloadLink.href = canvas.toDataURL("image/png");
                    downloadLink.download = "Carte_" + pseudo + ".png";
                    downloadLink.style.display = "inline-block";
                }
            }
        };

        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const userImg = new Image();
                userImg.onload = function() {
                    ctx.drawImage(userImg, 38, 130, 278, 355);
                    photoLoaded = true;
                    finishCard();
                };
                userImg.src = e.target.result;
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            photoLoaded = true;
            finishCard();
        }

        // QR code avec délai suffisant
        setTimeout(() => {
            const qrImg = qrDiv.querySelector('img');
            if(qrImg) {
                ctx.drawImage(qrImg, 900, 545, 75, 75);
            }
        }, 150);
    };
}
