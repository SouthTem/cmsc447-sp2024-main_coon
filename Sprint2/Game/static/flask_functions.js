function login()
{
    var data = JSON.stringify
    ({
        username: "test",
        password: "pass"
    });

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })
    .then(response => {
        if (response.ok)
        {
            response.json().then(data =>{
                console.log("Login Success")
                console.log("data:", data)
    
                // add the token to session storage (reloading the page will remove it)
                // alternatively could be added to local storage which lasts for longer
                sessionStorage.setItem("access_token", data.access_token)
            });
        }
        else 
        {
            console.error("Error", response.statusText);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function addCoins()
{
    var data = JSON.stringify
    ({
        coins: 999
    });

    const token = sessionStorage.getItem('access_token')

    fetch("/update_coins", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        body: data
    })
    .then(response => {
        if (response.ok)
        {
            response.json().then(data =>{
                console.log("data:", data)
            });
        }
        else 
        {
            console.error("Error", response.statusText);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}