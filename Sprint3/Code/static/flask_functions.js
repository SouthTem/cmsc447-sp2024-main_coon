const LOGIN_ENDPOINT = "/login";
const RUN_ENDPOINT = "/run";
const COIN_ENDPOINT = "/update_coins"
const CREATE_ENDPOINT = "/create";
const USER_ENDPOINT = "/account";
const POPULATE_ENDPOINT = "/populate";
const OUTFIT_ENDPOINT = "/outfit";
const TOP_ENDPOINT = "/top_leaderboard";
const PERSONAL_ENDPOINT = "/personal_leaderboard";

/**
 * Gets the auth token from storage
 * @returns The access token in session storage or null if none is found
 */
function get_token()
{
    return localStorage.getItem('access_token');
}

function delete_token()
{
    localStorage.removeItem('access_token');
}

function create(username, password)
{
    var data = JSON.stringify
    ({
        username: username,
        password: password
    });

    return fetch(CREATE_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })
    .then(response => {
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new Error(`Expected a json response from ${LOGIN_ENDPOINT}`);

        if (!response.ok) 
            throw new Error(`Response from ${LOGIN_ENDPOINT} was not ok`);
        
        return response.json();
    })
    .then(json => {
        console.log('create', json);
        let success = json.success;
        
        // if the response from the server is bad fail here
        if (!success) return false;

        login(username, password);

        return success;
    })
    .catch(error => {
        console.error("Error:", error);
        return false;
    });
}

/**
 * Sends a request to the /login endpoint in order to
 * create an access token in session storage which is required
 * for interactions with most flask endpoints
 * @param {string} username - the user's username
 * @param {string} password - the user's password
 */
function login(username, password)
{
    console.log('login!!');
    var data = JSON.stringify
    ({
        username: username,
        password: password
    });

    return fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })
    .then(response => {
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new Error(`Expected a json response from ${LOGIN_ENDPOINT}`);

        if (!response.ok) 
            throw new Error(`Response from ${LOGIN_ENDPOINT} was not ok`);
        
        return response.json();
    })
    .then(json => {
        console.log('login', json);
        let success = json.success;
        
        // if the response from the server is bad fail here
        if (!success) return false;

        // looks like we need local storage so that when changing html pages the information is the same
        
        // add the token to session storage (reloading the page will remove it)
        // alternatively could be added to local storage which lasts for longer
        localStorage.setItem("access_token", json.access_token);

        return success;
    })
    .catch(error => {
        console.error("Error:", error);
        return false;
    });
}

/**
 * Sends a request to the /run endpoint in order to
 * update the database with a new run
 * @param {integer} points number of points earned in the run
 * @param {integer} coins number of coins obtained in the run
 * @param {string} levelName name of the level just ran
 * @param {boolean} newLevel whether or not this a new level
 */
function addRun(points, coins, levelName, newLevel = false)
{
    var data = JSON.stringify
    ({
        points: points,
        coins: coins,
        level_name: levelName,
        new_level: newLevel
    });

    token = get_token();

    // can't do anything if token is null
    if (token == null)
    {
        return Promise.resolve(false);
    }

    return fetch(RUN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        body: data
    })
    .then(response => {
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new Error(`Expected a json response from ${RUN_ENDPOINT}`);

        if (!response.ok)
        {
            console.warn(response.json())
            throw new Error(`Response from ${RUN_ENDPOINT} was not ok`);
        }
        
        return response.json();
    })
    .then(json => {
        console.log('addRun', json);
        let success = json.success;

        // if the response from the server is bad fail here
        if (!success) return false;

        return true;
    })
    .catch(error => {
        console.error(error);
        return false;
    });
}

function getUser()
{
    token = get_token();

    var data = {
        name: "",
        coins: 0,
        lastLevel: "",
        success: false,
        equippedOutfits: [],
        unlockedOutfits: [],
        message: ''
    };

    // can't do anything if token is null
    if (token == null)
    {
        success = false;
        message = "token is null";
        return Promise.resolve(data);
    }

    return fetch(USER_ENDPOINT, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
    })
    .then(response => {
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new Error(`Expected a json response from ${USER_ENDPOINT}`);

        if (!response.ok)
        {
            console.warn(response.json())
            throw new Error(`Response from ${USER_ENDPOINT} was not ok`);
        }
        
        return response.json();
    })
    .then(json => {
        let success = json.success;
        let name = json.name;
        let coins = json.coins;
        let lastLevel = json.lastLevel;
        let equippedOutfits = json.equippedOutfits;
        let unlockedOutfits = json.unlockedOutfits;

        data.success = success;
        data.name = name;
        data.coins = coins;
        data.lastLevel = lastLevel;
        data.equippedOutfits = equippedOutfits;
        data.unlockedOutfits = unlockedOutfits;

        return data;
    })
    .catch(error => {
        data.message = error;
        return data;
    });
}

/**
 * Sends a request to the /update_coins endpoint in order to
 * update the database with a new coin count for the player
 * @param {integer} coins how many to coins (+ or -) to add to the players total
 */
function addCoins(coinCount)
{
    console.log(coinCount);
    var data = JSON.stringify
    ({
        coins: coinCount,
    });

    const token = get_token()

    // can't do anything if token is null
    if (token == null)
    {
        return Promise.resolve(false);
    }

    return fetch(COIN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        body: data
    })
    .then(response => {
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new Error(`Expected a json response from ${COIN_ENDPOINT}`);

        if (!response.ok) 
            throw new Error(`Response from ${COIN_ENDPOINT} was not ok`);
        
        return response.json();
    })
    .then(json => {
        let success = json.success;

        if (success) return false;

        return true;
    })
    .catch(error => {
        console.log(error);
        return false;
    });
}

/**
 * Updates the database with outfit related information
 * 
 * @param {Array} outfits list of outfits to update
 */
function changeOutfit(outfits)
{
    var data = JSON.stringify(outfits);
    console.log(data);

    const token = get_token()

    // can't do anything if token is null
    if (token == null)
    {
        return Promise.resolve(false);
    }

    return fetch(OUTFIT_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        body: data
    })
    .then(response => {
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new Error(`Expected a json response from ${OUTFIT_ENDPOINT}`);

        if (!response.ok) 
            throw new Error(`Response from ${OUTFIT_ENDPOINT} was not ok`);
        
        return response.json();
    })
    .then(json => {
        let success = json.success;

        if (success) return false;

        return true;
    })
    .catch(error => {
        console.log(error);
        return false;
    });
}

function getLeaderboard()
{
    return fetch(TOP_ENDPOINT, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new Error(`Expected a json response from ${TOP_ENDPOINT}`);

        if (!response.ok)
        {
            console.warn(response.json())
            throw new Error(`Response from ${TOP_ENDPOINT} was not ok`);
        }
        
        return response.json();
    })
    .then(json => {
        if (!json.success) return false;

        return true;
    })
    .catch(error => {
        return false;
    });
}

/**
 * Populates the database based on the data passed in
 * @param {Array} levels the level data to update with
 * @param {Array} outfits the outfit data to update with
 */
function populateDatabase(levels = [], outfits = [])
{
    var data = JSON.stringify
    ({
        levels: levels,
        outfits: outfits,
    });

    return fetch(POPULATE_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })
    .then(response => {
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new Error(`Expected a json response from ${POPULATE_ENDPOINT}`);

        if (!response.ok) 
            throw new Error(`Response from ${POPULATE_ENDPOINT} was not ok`);
        
        return response.json();
    })
    .then(json => {
        return json;
    })
    .catch(error => {
        console.error("Error:", error);
        return false;
    });
}