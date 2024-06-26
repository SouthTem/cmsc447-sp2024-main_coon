const accountNav = document.getElementById('account');
let user = getUser();

user.then(json => {
    let success = json.success;
    let name = json.name;

    if (success)
    {
        accountNav.innerText = `User: ${name}`;
    }
    else
    {
        accountNav.innerText = 'Guest';
    }
});