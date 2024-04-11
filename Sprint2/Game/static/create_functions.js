const createForm = document.getElementById('create_form');

createForm.addEventListener("submit", (e) => {
    e.preventDefault();
  
    let username = document.getElementById("username");
    let password = document.getElementById("password");
  
    if (username.value == "" || password.value == "") {
      console.log('empty values');
    } else {
        let x = create(username.value, password.value);
        console.log(x);
        x.then(success => {
          console.log(success);
          if (success)
          {
            alert('create success');
            window.location.href = "/";
          }
          else{
            alert('create failed');
          }
        });
        //window.location.href = "/";
    }
  });