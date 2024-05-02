const createForm = document.getElementById('login_form');

createForm.addEventListener("submit", (e) =>
{
  e.preventDefault();

  let username = document.getElementById("username");
  let password = document.getElementById("password");

  if (username.value == "" || password.value == "")
  {

  } 
  else
  {
    let x = login(username.value, password.value);
    x.then(success =>
    {
      if (success)
      {
        alert('login success');
        accountNav.innerText =  `User: ${username.value}`;
        window.location.href = "/";
      }
      else
      {
        alert('bad login');
      }
    });
    //window.location.href = "/";
  }
});