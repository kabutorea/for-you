/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://qjkeammjnzcosuyynxxr.supabase.co";
const SUPABASE_KEY = "sb_publishable_B-XLgbqAYzRNBdn1gQriZA_REnnRP3D";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   SETTINGS
========================================================= */

const READ_LETTERS_KEY = "forYouReadLetters";

let archivePassword = "";


/* =========================================================
   MAIN SCREENS
========================================================= */

const homeScreen =
    document.getElementById("homeScreen");

const passwordScreen =
    document.getElementById("passwordScreen");

const archiveScreen =
    document.getElementById("archiveScreen");


/* =========================================================
   HOME / PASSWORD
========================================================= */

const enterButton =
    document.getElementById("enterButton");

const passwordInput =
    document.getElementById("passwordInput");

const passwordButton =
    document.getElementById("passwordButton");

const passwordError =
    document.getElementById("passwordError");


/* =========================================================
   ROSES
========================================================= */

const roseScene =
    document.getElementById("roseScene");

const blooms =
    Array.from(
        document.querySelectorAll(".bloom")
    );


/* =========================================================
   ARCHIVE
========================================================= */

const lettersContainer =
    document.getElementById("lettersContainer");


/* =========================================================
   LETTER OVERLAY
========================================================= */

const letterOverlay =
    document.getElementById("letterOverlay");

const letterBackdrop =
    document.getElementById(
        "letterOverlayBackdrop"
    );

const envelopeScene =
    document.getElementById(
        "envelopeScene"
    );

const closedEnvelopeImage =
    document.getElementById(
        "closedEnvelopeImage"
    );

const openEnvelopeImage =
    document.getElementById(
        "openEnvelopeImage"
    );

const brokenSeal =
    document.getElementById(
        "brokenSeal"
    );

const letterPaper =
    document.getElementById(
        "letterPaper"
    );

const letterCloseButton =
    document.getElementById(
        "letterCloseButton"
    );

const letterOpenDate =
    document.getElementById(
        "letterOpenDate"
    );

const letterOpenTitle =
    document.getElementById(
        "letterOpenTitle"
    );

const letterOpenText =
    document.getElementById(
        "letterOpenText"
    );


/* =========================================================
   BASIC CHECK
========================================================= */

if (
    !homeScreen ||
    !passwordScreen ||
    !archiveScreen ||
    !enterButton ||
    !passwordInput ||
    !passwordButton ||
    !passwordError ||
    !roseScene ||
    !lettersContainer ||
    !letterOverlay ||
    !letterBackdrop ||
    !closedEnvelopeImage ||
    !openEnvelopeImage ||
    !brokenSeal ||
    !letterPaper ||
    !letterCloseButton ||
    !letterOpenDate ||
    !letterOpenTitle ||
    !letterOpenText
) {
    console.error(
        "for you. — some required HTML elements are missing."
    );
}


/* =========================================================
   WAIT
========================================================= */

function wait(ms) {
    return new Promise(
        (resolve) => {
            setTimeout(
                resolve,
                ms
            );
        }
    );
}


/* =========================================================
   READ LETTERS
========================================================= */

function getReadLetters() {
    try {
        const saved =
            localStorage.getItem(
                READ_LETTERS_KEY
            );

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        if (
            !Array.isArray(parsed)
        ) {
            return [];
        }

        return parsed;

    } catch (error) {
        console.error(
            "Could not read saved letters:",
            error
        );

        return [];
    }
}


function saveReadLetters(
    readLetters
) {
    localStorage.setItem(
        READ_LETTERS_KEY,
        JSON.stringify(
            readLetters
        )
    );
}


function getLetterKey(letter) {
    return String(
        letter.id
    );
}


function isLetterRead(letter) {
    const readLetters =
        getReadLetters();

    return readLetters.includes(
        getLetterKey(letter)
    );
}


function markLetterAsRead(letter) {
    const readLetters =
        getReadLetters();

    const key =
        getLetterKey(letter);

    if (
        !readLetters.includes(key)
    ) {
        readLetters.push(key);

        saveReadLetters(
            readLetters
        );
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   GET LETTERS
   EDGE FUNCTION ÜZERİNDEN
========================================================= */

async function getLetters() {

    if (!archivePassword) {
        throw new Error(
            "Archive password is missing."
        );
    }

    const result =
        await supabaseClient.functions.invoke(
            "check-archive-password",
            {
                body: {
                    password:
                        archivePassword
                }
            }
        );

    const data =
        result.data;

    const error =
        result.error;

    if (error) {
        throw error;
    }

    if (
        !data ||
        data.success !== true
    ) {
        throw new Error(
            "Archive access denied."
        );
    }

    if (
        !Array.isArray(
            data.letters
        )
    ) {
        return [];
    }

    return data.letters;
}


/* =========================================================
   RENDER LETTERS
========================================================= */

function renderLetters(
    letters
) {

    lettersContainer.innerHTML = "";

    if (
        !letters ||
        letters.length === 0
    ) {

        lettersContainer.innerHTML = `
            <div class="letter-card empty-state">
                <p>there is nothing here yet.</p>
            </div>
        `;

        return;
    }


    letters.forEach(
        (letter) => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "letter-card";


            const read =
                isLetterRead(letter);


            const envelopeImage =
                read
                    ? "envelope-open-cutout.png"
                    : "envelope-vintage-cutout.png";


            card.innerHTML = `
                <div class="letter-date">
                    ${escapeHTML(
                        letter.date
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        letter.title
                    )}
                </h3>

                <div
                    class="envelope-card ${
                        read
                            ? "is-read"
                            : "is-unread"
                    }"
                    role="button"
                    tabindex="0"
                    aria-label="Open letter"
                >
                    <img
                        src="${envelopeImage}"
                        alt="Vintage envelope"
                    >
                </div>

                <button
                    type="button"
                    class="open-letter-button"
                >
                    open letter
                </button>
            `;


            const envelope =
                card.querySelector(
                    ".envelope-card"
                );

            const openButton =
                card.querySelector(
                    ".open-letter-button"
                );


            /*
                ZARFA TIKLAMA
            */

            envelope.addEventListener(
                "click",
                () => {
                    openLetter(
                        letter
                    );
                }
            );


            /*
                ENTER / SPACE
            */

            envelope.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        openLetter(
                            letter
                        );
                    }

                }
            );


            /*
                OPEN LETTER BUTONU
            */

            openButton.addEventListener(
                "click",
                () => {
                    openLetter(
                        letter
                    );
                }
            );


            lettersContainer.appendChild(
                card
            );

        }
    );
}


/* =========================================================
   LOAD ARCHIVE
========================================================= */

async function loadArchive() {

    lettersContainer.innerHTML = `
        <div class="loading">
            opening the archive...
        </div>
    `;


    try {

        const letters =
            await getLetters();

        renderLetters(
            letters
        );

    } catch (error) {

        console.error(
            "Could not load archive:",
            error
        );

        lettersContainer.innerHTML = `
            <div class="letter-card empty-state">
                <p>
                    the archive could not be opened.
                </p>
            </div>
        `;
    }
}


/* =========================================================
   ROSE ANIMATION
========================================================= */

function animateBloom(
    bloom,
    delay
) {

    setTimeout(
        () => {

            bloom.classList.add(
                "is-swelling"
            );


            setTimeout(
                () => {

                    bloom.classList.remove(
                        "is-swelling"
                    );

                    bloom.classList.add(
                        "is-opening"
                    );


                    setTimeout(
                        () => {

                            bloom.classList.remove(
                                "is-opening"
                            );

                            bloom.classList.add(
                                "is-open"
                            );

                        },
                        1000
                    );

                },
                1000
            );

        },
        delay
    );
}


function bloomAll() {

    roseScene.classList.add(
        "active"
    );


    blooms.forEach(
        (bloom, index) => {

            animateBloom(
                bloom,
                index * 350
            );

        }
    );


    setTimeout(
        () => {
            showArchive();
        },
        4000
    );
}


/* =========================================================
   SHOW ARCHIVE
========================================================= */

function showArchive() {

    archiveScreen.classList.add(
        "visible"
    );

    window.scrollTo(
        0,
        0
    );

    loadArchive();
}


/* =========================================================
   PASSWORD
========================================================= */

async function checkPassword() {

    const password =
        passwordInput.value.trim();


    if (!password) {

        passwordError.textContent =
            "enter the password.";

        passwordError.classList.add(
            "visible"
        );

        return;
    }


    passwordButton.disabled = true;


    passwordError.classList.remove(
        "visible"
    );


    try {

        const result =
            await supabaseClient.functions.invoke(
                "check-archive-password",
                {
                    body: {
                        password:
                            password
                    }
                }
            );


        const data =
            result.data;

        const error =
            result.error;


        if (
            error ||
            !data ||
            data.success !== true
        ) {
            throw new Error(
                "Invalid password."
            );
        }


        /*
            Şifreyi kod içine koymuyoruz.
            Sadece başarılı girişten sonra
            RAM'de tutuyoruz.
        */

        archivePassword =
            password;


        passwordInput.value =
            "";


        passwordError.classList.remove(
            "visible"
        );


        passwordInput.blur();


        passwordScreen.classList.remove(
            "active"
        );


        bloomAll();


    } catch (error) {

        console.error(
            "Password verification failed:",
            error
        );


        passwordError.textContent =
            "that isn't the right password.";


        passwordError.classList.add(
            "visible"
        );


        passwordInput.classList.remove(
            "password-wrong"
        );


        void passwordInput.offsetWidth;


        passwordInput.classList.add(
            "password-wrong"
        );


        passwordInput.value =
            "";


        passwordButton.disabled =
            false;


        setTimeout(
            () => {

                passwordInput.classList.remove(
                    "password-wrong"
                );

            },
            500
        );

    }
}


/* =========================================================
   LETTER OVERLAY — RESET
========================================================= */

function resetLetterOverlay() {

    letterOverlay.classList.remove(
        "visible",
        "seal-visible",
        "envelope-swapped",
        "paper-visible"
    );


    letterOverlay.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "letter-open"
    );


    /*
        ÖNEMLİ:
        Burada inline opacity / visibility /
        transform KULLANMIYORUZ.

        Animasyon tamamen CSS class'ları
        üzerinden çalışıyor.
    */


    letterOpenDate.textContent =
        "";

    letterOpenTitle.textContent =
        "";

    letterOpenText.textContent =
        "";
}


/* =========================================================
   OPEN LETTER
========================================================= */

async function openLetter(
    letter
) {

    if (!letter) {
        return;
    }


    /*
        Her açılışın temiz başlaması
        gerekiyor.
    */

    resetLetterOverlay();


    /*
        Mektup bilgileri
    */

    letterOpenDate.textContent =
        letter.date ?? "";

    letterOpenTitle.textContent =
        letter.title ?? "";

    letterOpenText.textContent =
        letter.content ?? "";


    /*
        Okundu olarak işaretle
    */

    markLetterAsRead(
        letter
    );


    /*
        OVERLAY AÇILIR
    */

    letterOverlay.classList.add(
        "visible"
    );


    letterOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "letter-open"
    );


    /*
        1.
        MÜHÜR GELİR
    */

    await wait(350);


    letterOverlay.classList.add(
        "seal-visible"
    );


    /*
        2.
        KAPALI ZARF → AÇIK ZARF
    */

    await wait(600);


    letterOverlay.classList.add(
        "envelope-swapped"
    );


    /*
        3.
        KAĞIT ÇIKAR
    */

    await wait(1800);


    letterOverlay.classList.add(
        "paper-visible"
    );
}


/* =========================================================
   CLOSE LETTER
========================================================= */

async function closeLetter() {

    if (
        !letterOverlay.classList.contains(
            "visible"
        )
    ) {
        return;
    }


    /*
        Önce kağıdı kapat.
    */

    letterOverlay.classList.remove(
        "paper-visible"
    );


    await wait(700);


    /*
        Sonra açık zarfı kapat.
    */

    letterOverlay.classList.remove(
        "envelope-swapped"
    );


    await wait(500);


    /*
        Sonra mühürü kapat.
    */

    letterOverlay.classList.remove(
        "seal-visible"
    );


    await wait(250);


    /*
        Overlay kapanır.
    */

    letterOverlay.classList.remove(
        "visible"
    );


    letterOverlay.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "letter-open"
    );


    /*
        Bir sonraki açılış için
        temiz duruma dön.
    */

    resetLetterOverlay();


    /*
        Okundu zarfı arşivde
        güncellensin.
    */

    loadArchive();
}


/* =========================================================
   ENTER
========================================================= */

enterButton.addEventListener(
    "click",
    () => {

        homeScreen.classList.remove(
            "active"
        );


        passwordScreen.classList.add(
            "active"
        );


        setTimeout(
            () => {
                passwordInput.focus();
            },
            300
        );

    }
);


/* =========================================================
   PASSWORD BUTTON
========================================================= */

passwordButton.addEventListener(
    "click",
    checkPassword
);


/* =========================================================
   PASSWORD ENTER
========================================================= */

passwordInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            checkPassword();
        }

    }
);


/* =========================================================
   LETTER CLOSE BUTTON
========================================================= */

letterCloseButton.addEventListener(
    "click",
    closeLetter
);


/* =========================================================
   BACKDROP
========================================================= */

letterBackdrop.addEventListener(
    "click",
    closeLetter
);


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            letterOverlay.classList.contains(
                "visible"
            )
        ) {

            closeLetter();
        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

    /*
        Ana ekran
    */

    homeScreen.classList.add(
        "active"
    );


    passwordScreen.classList.remove(
        "active"
    );


    archiveScreen.classList.remove(
        "visible"
    );


    /*
        Güller başlangıçta kapalı
    */

    blooms.forEach(
        (bloom) => {

            bloom.classList.remove(
                "is-swelling",
                "is-opening",
                "is-open"
            );

        }
    );


    /*
        Şifre
    */

    passwordInput.value =
        "";

    passwordError.classList.remove(
        "visible"
    );

    passwordButton.disabled =
        false;


    /*
        Overlay
    */

    resetLetterOverlay();
}


initialize();
