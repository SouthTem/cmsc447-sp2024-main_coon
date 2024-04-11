const createForm = document.getElementById('login_form');

createForm.addEventListener("submit", (e) => {
    e.preventDefault();
  
    let username = document.getElementById("username");
    let password = document.getElementById("password");

    console.log(username, password);
  
    if (username.value == "" || password.value == "") {
      console.log('empty values');
    } else {
        let x = login(username.value, password.value);
        console.log(x);
        x.then(success => {
          console.log(success);
          if (success)
            alert('login success');
          else{
            alert('bad login');
          }
        });
        //window.location.href = "/";
    }
  });