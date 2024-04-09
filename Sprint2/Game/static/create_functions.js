const createForm = document.getElementById('create_form');

createForm.addEventListener("submit", (e) => {
    e.preventDefault();
  
    let username = document.getElementById("username");
    let password = document.getElementById("password");
  
    if (username.value == "" || password.value == "") {
      console.log('empty values');
    } else {
        login(username.value, password.value);
    }
  });