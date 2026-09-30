// =========================================
// SUPABASE
// =========================================

const SUPABASE_URL = "https://qjkeammjnzcosuyynxxr.supabase.co";
const SUPABASE_KEY = "sb_publishable_B-XLgbqAYzRNBdn1gQriZA_REnnRP3D";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// =========================================
// ELEMENTS
// =========================================

const loginSection =
  document.getElementById("loginSection");

const adminSection =
  document.getElementById("adminSection");

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("emailInput");

const passwordInput =
  document.getElementById("passwordInput");

const loginButton =
  document.getElementById("loginButton");

const loginMessage =
  document.getElementById("loginMessage");

const logoutButton =
  document.getElementById("logoutButton");

const letterForm =
  document.getElementById("letterForm");

const letterIdInput =
  document.getElementById("letterId");

const letterDateInput =
  document.getElementById("letterDate");

const letterTitleInput =
  document.getElementById("letterTitle");

const letterTextInput =
  document.getElementById("letterText");

const letterPublishedInput =
  document.getElementById("letterPublished");

const saveButton =
  document.getElementById("saveButton");

const cancelButton =
  document.getElementById("cancelButton");

const formMessage =
  document.getElementById("formMessage");

const lettersList =
  document.getElementById("lettersList");


// =========================================
// STATE
// =========================================

let editingId = null;


// =========================================
// UI
// =========================================

function showLogin() {

  loginSection.classList.remove(
    "hidden"
  );

  adminSection.classList.add(
    "hidden"
  );

}


function showAdmin() {

  loginSection.classList.add(
    "hidden"
  );

  adminSection.classList.remove(
    "hidden"
  );

}


function loginError(message) {

  loginMessage.textContent =
    message;

  loginMessage.className =
    "message error";

}


function loginSuccess(message) {

  loginMessage.textContent =
    message;

  loginMessage.className =
    "message success";

}


function formError(message) {

  formMessage.textContent =
    message;

  formMessage.className =
    "message error";

}


function formSuccess(message) {

  formMessage.textContent =
    message;

  formMessage.className =
    "message success";

}


function clearFormMessage() {

  formMessage.textContent =
    "";

  formMessage.className =
    "message";

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// =========================================
// DATE
// =========================================

function formatDate(value) {

  if (!value) {
    return "";
  }

  const date =
    new Date(`${value}T00:00:00`);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );

}


// =========================================
// RESET FORM
// =========================================

function resetForm() {

  editingId = null;

  letterIdInput.value =
    "";

  letterDateInput.value =
    "";

  letterTitleInput.value =
    "";

  letterTextInput.value =
    "";

  letterPublishedInput.checked =
    true;

  saveButton.textContent =
    "Save letter";

  cancelButton.classList.add(
    "hidden"
  );

  clearFormMessage();

}


// =========================================
// CHECK SESSION
// =========================================

async function checkSession() {

  const {
    data,
    error
  } =
    await supabaseClient.auth.getSession();


  if (error) {

    console.error(
      "Session error:",
      error
    );

    showLogin();

    loginError(
      "Could not check your session."
    );

    return;
  }


  if (data.session) {

    showAdmin();

    await loadLetters();

  } else {

    showLogin();

  }

}


// =========================================
// LOGIN
// =========================================

async function handleLogin(event) {

  event.preventDefault();


  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


  if (!email || !password) {

    loginError(
      "Please enter your email and password."
    );

    return;
  }


  loginButton.disabled =
    true;

  loginButton.textContent =
    "Signing in...";


  const {
    data,
    error
  } =
    await supabaseClient.auth.signInWithPassword(
      {
        email,
        password
      }
    );


  if (error) {

    console.error(
      "Login error:",
      error
    );

    loginError(
      "Email or password is incorrect."
    );

    loginButton.disabled =
      false;

    loginButton.textContent =
      "Login";

    return;
  }


  if (!data.session) {

    loginError(
      "No login session was created."
    );

    loginButton.disabled =
      false;

    loginButton.textContent =
      "Login";

    return;
  }


  passwordInput.value =
    "";

  loginMessage.textContent =
    "";

  loginMessage.className =
    "message";


  showAdmin();

  resetForm();

  await loadLetters();


  loginButton.disabled =
    false;

  loginButton.textContent =
    "Login";

}


// =========================================
// LOGOUT
// =========================================

async function handleLogout() {

  const {
    error
  } =
    await supabaseClient.auth.signOut();


  if (error) {

    console.error(
      "Logout error:",
      error
    );

    return;
  }


  resetForm();

  showLogin();

}


// =========================================
// LOAD LETTERS
// =========================================

async function loadLetters() {

  lettersList.innerHTML = `
    <div class="loading">
      loading...
    </div>
  `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("letters")
      .select("*")
      .order(
        "date",
        {
          ascending: false
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Load letters error:",
      error
    );

    lettersList.innerHTML = `
      <div class="empty-state">
        Could not load letters.
      </div>
    `;

    return;
  }


  renderLetters(
    data || []
  );

}


// =========================================
// RENDER LETTERS
// =========================================

function renderLetters(letters) {

  if (letters.length === 0) {

    lettersList.innerHTML = `
      <div class="empty-state">
        There are no letters yet.
      </div>
    `;

    return;
  }


  lettersList.innerHTML =
    letters
      .map((letter) => {

        const preview =
          String(
            letter.content || ""
          )
            .replace(
              /\s+/g,
              " "
            )
            .trim();


        const shortPreview =
          preview.length > 160
            ? `${preview.slice(0, 160)}...`
            : preview;


        const statusClass =
          letter.published
            ? "published"
            : "hidden-status";


        const statusText =
          letter.published
            ? "Published"
            : "Hidden";


        return `

          <article class="saved-letter">

            <div class="saved-letter-top">

              <div class="saved-letter-info">

                <div class="saved-letter-date">
                  ${escapeHTML(
                    formatDate(
                      letter.date
                    )
                  )}
                </div>

                <h3 class="saved-letter-title">
                  ${escapeHTML(
                    letter.title
                  )}
                </h3>

                <p class="saved-letter-preview">
                  ${escapeHTML(
                    shortPreview
                  )}
                </p>

                <div class="saved-letter-meta">

                  <span
                    class="status ${statusClass}"
                  >
                    ${statusText}
                  </span>

                </div>

              </div>


              <div class="saved-letter-actions">

                <button
                  type="button"
                  class="small-button edit-button"
                  data-id="${escapeHTML(
                    letter.id
                  )}"
                >
                  Edit
                </button>


                <button
                  type="button"
                  class="small-button delete delete-button"
                  data-id="${escapeHTML(
                    letter.id
                  )}"
                >
                  Delete
                </button>

              </div>

            </div>

          </article>

        `;

      })
      .join("");


  // EDIT

  lettersList
    .querySelectorAll(
      ".edit-button"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.id;

          const letter =
            letters.find(
              (item) =>
                String(item.id) ===
                String(id)
            );


          if (letter) {

            startEdit(
              letter
            );

          }

        }
      );

    });


  // DELETE

  lettersList
    .querySelectorAll(
      ".delete-button"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          const id =
            button.dataset.id;

          const letter =
            letters.find(
              (item) =>
                String(item.id) ===
                String(id)
            );


          if (letter) {

            await deleteLetter(
              letter
            );

          }

        }
      );

    });

}


// =========================================
// START EDIT
// =========================================

function startEdit(letter) {

  editingId =
    letter.id;

  letterIdInput.value =
    letter.id;

  letterDateInput.value =
    letter.date || "";

  letterTitleInput.value =
    letter.title || "";

  letterTextInput.value =
    letter.content || "";

  letterPublishedInput.checked =
    Boolean(
      letter.published
    );

  saveButton.textContent =
    "Update letter";

  cancelButton.classList.remove(
    "hidden"
  );

  clearFormMessage();


  window.scrollTo(
    {
      top: 0,
      behavior: "smooth"
    }
  );


  letterTitleInput.focus();

}


// =========================================
// DELETE
// =========================================

async function deleteLetter(
  letter
) {

  const confirmed =
    window.confirm(
      `Delete "${letter.title}"?\n\nThis cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("letters")
      .delete()
      .eq(
        "id",
        letter.id
      );


  if (error) {

    console.error(
      "Delete error:",
      error
    );

    window.alert(
      "The letter could not be deleted."
    );

    return;
  }


  if (
    editingId &&
    String(editingId) ===
      String(letter.id)
  ) {

    resetForm();

  }


  await loadLetters();

}


// =========================================
// SAVE LETTER
// =========================================

async function handleSave(
  event
) {

  event.preventDefault();

  clearFormMessage();


  const date =
    letterDateInput.value;

  const title =
    letterTitleInput.value.trim();

  const content =
    letterTextInput.value.trim();

  const published =
    letterPublishedInput.checked;


  if (!date) {

    formError(
      "Please choose a date."
    );

    return;
  }


  if (!title) {

    formError(
      "Please enter a title."
    );

    return;
  }


  if (!content) {

    formError(
      "Please write the letter."
    );

    return;
  }


  saveButton.disabled =
    true;

  saveButton.textContent =
    editingId
      ? "Updating..."
      : "Saving...";


  // UPDATE

  if (editingId) {

    const {
      error
    } =
      await supabaseClient
        .from("letters")
        .update(
          {
            date,
            title,
            content,
            published,
            updated_at:
              new Date().toISOString()
          }
        )
        .eq(
          "id",
          editingId
        );


    if (error) {

      console.error(
        "Update error:",
        error
      );

      formError(
        "The letter could not be updated."
      );

      saveButton.disabled =
        false;

      saveButton.textContent =
        "Update letter";

      return;
    }


    resetForm();

    await loadLetters();

    formSuccess(
      "Letter updated."
    );

    return;
  }


  // INSERT

  const {
    error
  } =
    await supabaseClient
      .from("letters")
      .insert(
        {
          date,
          title,
          content,
          published
        }
      );


  if (error) {

    console.error(
      "Insert error:",
      error
    );

    formError(
      "The letter could not be saved."
    );

    saveButton.disabled =
      false;

    saveButton.textContent =
      "Save letter";

    return;
  }


  resetForm();

  await loadLetters();

  formSuccess(
    "Letter saved."
  );

}


// =========================================
// AUTH STATE
// =========================================

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (
      event === "SIGNED_IN" &&
      session
    ) {

      showAdmin();

      loadLetters();

    }


    if (
      event === "SIGNED_OUT"
    ) {

      resetForm();

      showLogin();

    }

  }
);


// =========================================
// EVENTS
// =========================================

loginForm.addEventListener(
  "submit",
  handleLogin
);

logoutButton.addEventListener(
  "click",
  handleLogout
);

letterForm.addEventListener(
  "submit",
  handleSave
);

cancelButton.addEventListener(
  "click",
  resetForm
);


// =========================================
// START
// =========================================

checkSession();