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
                    
                    // Ajouter un événement pour le téléchargement avec dialogue
                    downloadLink.onclick = async (e) => {
                        e.preventDefault();
                        await downloadCardWithDialog(canvas, pseudo);
                    };
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

// --- 3. FONCTION DE TÉLÉCHARGEMENT AVEC DIALOGUE DE SÉLECTION DE DOSSIER ---
async function downloadCardWithDialog(canvas, pseudo) {
    try {
        // Vérifier si l'API File System Access est disponible
        if (!window.showSaveFilePicker) {
            console.warn("L'API File System Access n'est pas disponible. Utilisation du téléchargement classique.");
            downloadCardClassic(canvas, pseudo);
            return;
        }

        // Ouvrir le dialogue de sélection de dossier
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: `Carte_${pseudo}.png`,
            types: [
                {
                    description: 'Images PNG',
                    accept: { 'image/png': ['.png'] }
                }
            ]
        });

        // Convertir le canvas en blob
        canvas.toBlob(async (blob) => {
            try {
                // Créer un writer pour écrire le fichier
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                
                alert("✅ Carte sauvegardée avec succès !");
            } catch (error) {
                console.error("Erreur lors de l'écriture du fichier :", error);
                alert("❌ Erreur lors de la sauvegarde du fichier.");
            }
        }, 'image/png');

    } catch (error) {
        // Si l'utilisateur annule le dialogue
        if (error.name === 'AbortError') {
            console.log("Téléchargement annulé par l'utilisateur.");
        } else {
            console.error("Erreur :", error);
            // Fallback : utiliser le téléchargement classique
            downloadCardClassic(canvas, pseudo);
        }
    }
}

// --- 4. FALLBACK : TÉLÉCHARGEMENT CLASSIQUE (pour les navigateurs non-compatibles) ---
function downloadCardClassic(canvas, pseudo) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL("image/png");
    link.download = `Carte_${pseudo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
