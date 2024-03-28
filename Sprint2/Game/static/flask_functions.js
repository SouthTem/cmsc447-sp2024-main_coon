const LOGIN_ENDPOINT = "/login";
const RUN_ENDPOINT = "/run";
const COIN_ENDPOINT = "/update_coins"

function get_token()
{
    return sessionStorage.getItem('access_token');
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
    var data = JSON.stringify
    ({
        username: username,
        password: password
    });

    fetch(LOGIN_ENDPOINT, {
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
            throw new Error(`Response from ${LOGIN_ENDPOINT} was no ok`);
        
        return response.json();
    })
    .then(json => {
        console.log('login', json);

        // add the token to session storage (reloading the page will remove it)
        // alternatively could be added to local storage which lasts for longer
        sessionStorage.setItem("access_token", json.access_token);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

/**
 * Sends a request to the /run endpoint in order to
 * update the database with a new run
 * @param {integer} points number of points earned in the run
 * @param {integer} coins number of coins obtained in the run
 * @param {integer} levelId id of the level just ran
 */
function addRun(points, coins, levelId)
{
    var data = JSON.stringify
    ({
        points: points,
        coins: coins,
        level_id: levelId 
    });

    token = get_token();

    fetch(RUN_ENDPOINT, {
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
            throw new Error(`Response from ${RUN_ENDPOINT} was no ok`);
        }

        
        return response.json();
    })
    .then(json => {
        console.log('addRun', json);
    })
    .catch(error => {
        console.error(error);
    });
}

/**
 * Sends a request to the /update_coins endpoint in order to
 * update the database with a new coin count for the player
 * @param {integer} coins how many to coins (+ or -) to add to the players total
 */
function addCoins(coins)
{
    var data = JSON.stringify
    ({
        coins: coins
    });

    const token = get_token()

    fetch(COIN_ENDPOINT, {
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
            throw new Error(`Response from ${COIN_ENDPOINT} was no ok`);
        
        return response.json();
    })
    .then(json => {
        console.log('addCoins', json);
    })
    .catch(error => {
        console.log(error);
    });
}