const createForm = document.getElementById('login_form');

createForm.addEventListener("submit", (e) => {
    e.preventDefault();
  
    let username = document.getElementById("username");
    let password = document.getElementById("password");

    console.log(username, password);
  
    if (username.value == "" || password.value == "") {
      console.log('empty values');
    } else {
        login(username.value, password.value);
        alert('login success');
        //window.location.href = "/";
    }
  });