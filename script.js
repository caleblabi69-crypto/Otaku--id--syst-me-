// --- HASH PASSWORD SIMPLE (MD5-like) ---
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Conversion en entier 32-bit
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

// --- 1. VALIDATION DES FORMULAIRES ---
function validateForm() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username.length < 3) {
        alert("❌ Le nom d'utilisateur doit contenir au moins 3 caractères");
        return false;
    }
    
    if (password.length < 6) {
        alert("❌ Le mot de passe doit contenir au moins 6 caractères");
        return false;
    }

    return true;
}

// --- 2. VÉRIFIER SI L'USERNAME EXISTE DÉJÀ ---
function checkUsernameExists(username) {
    return localStorage.getItem(username) !== null;
}

// --- 3. GESTION DES COMPTES ---
function register() {
    if (!validateForm()) return;

    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (checkUsernameExists(user)) {
        alert("❌ Ce nom d'utilisateur existe déjà !");
        return;
    }

    const hashedPass = hashPassword(pass);
    localStorage.setItem(user, hashedPass);
    alert("✅ Compte créé avec succès !");
    
    // Réinitialiser les champs
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function login() {
    if (!validateForm()) return;

    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const hashedPass = hashPassword(pass);

    if (localStorage.getItem(user) === hashedPass && user !== "") {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('generatorSection').style.display = 'block';
        document.getElementById('userDisplay').innerText = user;
        
        // Charger les données sauvegardées
        loadUserData(user);
    } else {
        alert("❌ Nom d'utilisateur ou mot de passe incorrect");
    }
}

function logout() {
    const user = document.getElementById('userDisplay').innerText;
    saveUserData(user);
    
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('generatorSection').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Réinitialiser le formulaire
    resetCard();
}

// --- 4. SAUVEGARDE DES DONNÉES UTILISATEUR ---
function saveUserData(username) {
    const userData = {
        pseudo: document.getElementById('pseudoInput').value,
        statut: document.getElementById('statutInput').value,
        passions: document.getElementById('passionsInput').value,
        classement: document.getElementById('classementInput').value
    };
    
    localStorage.setItem(username + '_data', JSON.stringify(userData));
}

// --- 5. CHARGEMENT DES DONNÉES UTILISATEUR ---
function loadUserData(username) {
    const savedData = localStorage.getItem(username + '_data');
    
    if (savedData) {
        try {
            const userData = JSON.parse(savedData);
            document.getElementById('pseudoInput').value = userData.pseudo || '';
            document.getElementById('statutInput').value = userData.statut || '';
            document.getElementById('passionsInput').value = userData.passions || '';
            document.getElementById('classementInput').value = userData.classement || '';
        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
        }
    }
}

// --- 6. APERÇU IMAGE EN TEMPS RÉEL ---
function previewImage() {
    const fileInput = document.getElementById('imageInput');
    const preview = document.getElementById('imagePreview');
    const file = fileInput.files[0];

    if (!file) {
        preview.style.display = 'none';
        return;
    }

    // Vérifier le format
    const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validFormats.includes(file.type)) {
        alert("❌ Format non supporté ! Utilisez JPG, PNG, GIF ou WebP");
        fileInput.value = '';
        preview.style.display = 'none';
        return;
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert("❌ L'image est trop volumineuse (max 5MB) !");
        fileInput.value = '';
        preview.style.display = 'none';
        return;
    }

    // Afficher l'aperçu
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.onerror = function() {
        handleImageError("Erreur lors de la lecture du fichier");
    };
    reader.readAsDataURL(file);
}

// --- 7. GESTION DES ERREURS D'IMAGE ---
function handleImageError(errorMessage) {
    console.error("Erreur image :", errorMessage);
    alert("❌ " + errorMessage);
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}

// --- 8. RÉINITIALISER LA CARTE ---
function resetCard() {
    document.getElementById('pseudoInput').value = '';
    document.getElementById('statutInput').value = '';
    document.getElementById('passionsInput').value = '';
    document.getElementById('classementInput').value = '';
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('otakuCanvas').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'none';
    
    const canvas = document.getElementById('otakuCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- 2. GÉNÉRATEUR DE CARTE AVEC QR CODE ---
function generateFinalCard() {
    try {
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
        
        cardBase.onerror = function() {
            handleImageError("Impossible de charger l'image de base de la carte");
        };

        cardBase.onload = function() {
            // Nettoyer le canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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
                    document.getElementById('downloadBtn').style.display = "inline-block";
                    document.getElementById('resetBtn').style.display = "inline-block";
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
                    userImg.onerror = function() {
                        handleImageError("Erreur lors du chargement de votre photo");
                    };
                    userImg.src = e.target.result;
                };
                reader.onerror = function() {
                    handleImageError("Erreur lors de la lecture du fichier");
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
    } catch (error) {
        console.error("Erreur lors de la génération :", error);
        alert("❌ Erreur lors de la génération de la carte");
    }
}

// --- 3. FONCTION DE TÉLÉCHARGEMENT AVEC DIALOGUE DE SÉLECTION DE DOSSIER ---
function handleDownload() {
    const canvas = document.getElementById('otakuCanvas');
    const pseudo = document.getElementById('pseudoInput').value || "Utilisateur";
    downloadCardWithDialog(canvas, pseudo);
}

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
    try {
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `Carte_${pseudo}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("✅ Carte téléchargée avec succès !");
    } catch (error) {
        console.error("Erreur lors du téléchargement :", error);
        alert("❌ Erreur lors du téléchargement");
    }
}
