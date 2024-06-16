const BASE_URL = "https://mariomarkwart-join-default-rtdb.europe-west1.firebasedatabase.app/";
const FIREBASE_TASKS_ID = '-NyjPfIkvaXKtVoSc38U';
const FIREBASE_USERS_ID = '-NyjPrly5jgHTGp4FS99';


/**
 * Asynchronously creates an item in Firebase using the given JSON array and path.
 *
 * @param {Array} jsonArray - The JSON array to be posted.
 * @param {string} [path="_"] - The path to the Firebase location where the item will be created. Defaults to "_".
 * @return {Promise} A Promise that resolves with the response from the Firebase server.
 */
async function firebaseCreateItem(jsonArray, path="_") {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonArray)
    })
}


/**
 * Updates an item in Firebase using a PUT request.
 *
 * @param {Object} jsonArray - The JSON array to update.
 * @param {string} [path="_"] - The path to the item in Firebase. Defaults to "_".
 * @return {Promise<Response>} A Promise that resolves to the response from the PUT request.
 */
async function firebaseUpdateItem(jsonArray, path="_") {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        header: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonArray)
    })
}


/**
 * Retrieves an item from Firebase using the provided path.
 *
 * @param {string} [path="_"] - The path (the id) to the item in Firebase.
 * @return {Promise<Object>} A Promise that resolves to the retrieved item as a JSON object.
 */
async function firebaseGetItem(path="_") {
    let response = await fetch(BASE_URL + path + ".json");
    let responseAsJSON = await response.json();

    return responseAsJSON;
}


/**
 * 
 * @param {string} key - the key the values are stored in
 * @returns the users json
 */
async function remoteStorageGetItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return fetch(url).then(res => res.json()).then(res => {
        if (res.data) {
            return res.data.value;
        } throw `Could not find data with the key "${key}"`;
    });
}


/*
/**
 * Sets the currently logged in user in the local storage.
 *
 * @param {Object} loggedUser - The user object representing the logged in user.
 * @return {void} This function does not return anything.
 */
function setCurrentUser(name) {
    sessionStorage.setItem('currentUser', JSON.stringify({ username: name}));
}


/**
 * Retrieves the currently logged in user from the local storage.
 *
 * @return {Object} The user object representing the logged in user, parsed from the local storage.
 */
function getCurrentUser() {
    const currentUserJSON = sessionStorage.getItem('currentUser');
    if (currentUserJSON) {
        const currentUser = JSON.parse(currentUserJSON);
        return currentUser;
    }
}


function restoreUsersOnFirebase(){
    firebaseUpdateItem(users_backup, FIREBASE_USERS_ID);
}


/**
 * 
 * @param {string} key - the key the value can be found
 * @param {string} value - the value for the key
 * @returns 
 */
async function remoteStorageSetItem(key, value) {
    const payload = { key, value, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json());
}