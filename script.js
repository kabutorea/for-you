const SUPABASE_URL = "https://qjkeammjnzcosuyynxxr.supabase.co";
const SUPABASE_KEY = "sb_publishable_B-XLgbqAYzRNBdn1gQriZA_REnnRP3D";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const READ_LETTERS_KEY = "forYouReadLetters";

let archivePassword = "";

const homeScreen = document.getElementById("homeScreen");
const passwordScreen = document.getElementById("passwordScreen");
const archiveScreen = document.getElementById("archiveScreen");

const enterButton = document.getElementById("enterButton");
const passwordInput = document.getElementById("passwordInput");
const passwordButton = document.getElementById("passwordButton");
const passwordError = document.getElementById("passwordError");

const roseScene = document.getElementById("roseScene");

const lettersContainer = document.getElementById("lettersContainer");

const letterOverlay = document.getElementById("letterOverlay");
const overlayBackdrop = letterOverlay?.querySelector(".letter-overlay-backdrop");

const overlayClosedEnvelope = letterOverlay?.querySelector(
  ".overlay-envelope.closed"
);

const overlayOpenEnvelope = letterOverlay?.querySelector(
  ".overlay-envelope.open"
);

const overlaySeal = letterOverlay?.querySelector(".overlay-seal");

const letterPaper = letterOverlay?.querySelector(".letter-paper");

const letterDate = document.getElementById("letterDate");
const letterTitle = document.getElementById("letterTitle");
const letterText = document.getElementById("letterText");

const closeLetterButton = document.getElementById("closeLetterButton");

const blooms = Array.from(document.querySelectorAll(".bloom"));

function getReadLetters() {
  try {
    return JSON.parse(localStorage.getItem(READ_LETTERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveReadLetters(readLetters) {
  localStorage.setItem(
    READ_LETTERS_KEY,
    JSON.stringify(readLetters)
  );
}

function getLetterKey(letter) {
  return String(letter.id);
}

function isLetterRead(letter) {
  return getReadLetters().includes(getLetterKey(letter));
}

function markLetterAsRead(letter) {
  const readLetters = getReadLetters();
  const key = getLetterKey(letter);

  if (!readLetters.includes(key)) {
    readLetters.push(key);
    saveReadLetters(readLetters);
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getLetters() {
  if (!archivePassword) {
    throw new Error("Archive password is missing.");
  }

  const { data, error } = await supabaseClient.functions.invoke(
    "check-archive-password",
    {
      body: {
        password: archivePassword,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error("Archive access denied.");
  }

  return data.letters ?? [];
}

function renderLetters(letters) {
  lettersContainer.innerHTML = "";

  if (!letters.length) {
    lettersContainer.innerHTML = `
      <div class="letter-card empty-state">
        <p>there is nothing here yet.</p>
      </div>
    `;

    return;
  }

  letters.forEach((letter) => {
    const read = isLetterRead(letter);

    const card = document.createElement("article");
    card.className = "letter-card";

    card.innerHTML = `
      <div class="letter-date">
        ${escapeHTML(letter.date)}
      </div>

      <h3>
        ${escapeHTML(letter.title)}
      </h3>

      <div class="envelope-card ${read ? "is-read" : "is-unread"}">
        <img
          src="${
            read
              ? "envelope-open-cutout.png"
              : "envelope-vintage-cutout.png"
          }"
          alt="letter envelope"
        >

        <button
          type="button"
          class="open-letter-button"
          aria-label="Open letter"
        ></button>
      </div>
    `;

    const envelopeButton = card.querySelector(".open-letter-button");

    envelopeButton.addEventListener("click", () => {
      openLetter(letter);
    });

    lettersContainer.appendChild(card);
  });
}

async function loadArchive() {
  lettersContainer.innerHTML = `
    <div class="loading">
      opening the archive...
    </div>
  `;

  try {
    const letters = await getLetters();
    renderLetters(letters);
  } catch (error) {
    console.error("Could not load archive:", error);

    lettersContainer.innerHTML = `
      <div class="letter-card empty-state">
        <p>the archive could not be opened.</p>
      </div>
    `;
  }
}

function showArchive() {
  archiveScreen.classList.add("visible");
  loadArchive();
}

function animateBloom(bloom, delay) {
  setTimeout(() => {
    bloom.classList.add("is-swelling");

    setTimeout(() => {
      bloom.classList.remove("is-swelling");
      bloom.classList.add("is-opening");

      setTimeout(() => {
        bloom.classList.remove("is-opening");
        bloom.classList.add("is-open");
      }, 1000);
    }, 1000);
  }, delay);
}

function bloomAll() {
  roseScene.classList.add("active");

  blooms.forEach((bloom, index) => {
    animateBloom(bloom, index * 350);
  });

  setTimeout(() => {
    showArchive();
  }, 4000);
}

function checkPassword() {
  const password = passwordInput.value;

  if (!password) {
    passwordError.textContent = "enter the password.";
    passwordError.classList.add("visible");
    return;
  }

  passwordButton.disabled = true;
  passwordError.classList.remove("visible");

  supabaseClient.functions
    .invoke("check-archive-password", {
      body: {
        password,
      },
    })
    .then(({ data, error }) => {
      if (error || !data?.success) {
        passwordError.textContent = "that isn't the right password.";
        passwordError.classList.add("visible");

        passwordInput.classList.remove("password-wrong");

        void passwordInput.offsetWidth;

        passwordInput.classList.add("password-wrong");

        passwordInput.value = "";
        passwordButton.disabled = false;

        setTimeout(() => {
          passwordInput.classList.remove("password-wrong");
        }, 500);

        return;
      }

      archivePassword = password;

      passwordError.classList.remove("visible");
      passwordInput.blur();

      passwordScreen.classList.remove("active");

      bloomAll();
    })
    .catch((error) => {
      console.error("Password verification failed:", error);

      passwordError.textContent =
        "something went wrong. try again.";

      passwordError.classList.add("visible");

      passwordButton.disabled = false;
    });
}

function resetLetterOverlay() {
  letterOverlay.classList.remove(
    "visible",
    "envelope-swapped",
    "seal-visible",
    "paper-visible"
  );

  document.body.classList.remove("letter-open");

  letterDate.textContent = "";
  letterTitle.textContent = "";
  letterText.textContent = "";
}

function openLetter(letter) {
  letterDate.textContent = letter.date;
  letterTitle.textContent = letter.title;
  letterText.textContent = letter.content;

  letterOverlay.classList.add("visible");
  document.body.classList.add("letter-open");

  setTimeout(() => {
    letterOverlay.classList.add("seal-visible");
  }, 300);

  setTimeout(() => {
    letterOverlay.classList.add("envelope-swapped");
  }, 900);

  setTimeout(() => {
    letterOverlay.classList.add("paper-visible");
  }, 1700);

  markLetterAsRead(letter);
}

function closeLetter() {
  letterOverlay.classList.remove("paper-visible");

  setTimeout(() => {
    resetLetterOverlay();
    loadArchive();
  }, 700);
}

enterButton.addEventListener("click", () => {
  homeScreen.classList.remove("active");
  passwordScreen.classList.add("active");

  setTimeout(() => {
    passwordInput.focus();
  }, 300);
});

passwordButton.addEventListener("click", checkPassword);

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkPassword();
  }
});

closeLetterButton?.addEventListener("click", closeLetter);

overlayBackdrop?.addEventListener("click", closeLetter);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    letterOverlay.classList.contains("visible")
  ) {
    closeLetter();
  }
});

function initialize() {
  resetLetterOverlay();
  passwordError.classList.remove("visible");
  passwordButton.disabled = false;
}

initialize();