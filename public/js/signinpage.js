document.querySelector('#signInButton').addEventListener("click", (e)=>{
    e.preventDefault();
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    if (password && username){
        console.log(username,password)
        fetch('/api/users/login', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username:username,
                password:password
            })
        }).then(response=>{
            if (response.ok){
                document.location.replace('/dashboard');
                return null;
            }
            return response.json();
        }).then(data=>{
            if (data){
                Alert(data.message);
            }
    
        });
    }
})

document.querySelector('#signUpButton').addEventListener("click", (e)=>{
    e.preventDefault();
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    if (password && username){
        if (password.length < 8){
            Alert("Password must be atleast 8 characters")
            return;
        }

        console.log(username,password)
        fetch('/api/users', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username:username,
                password:password
            })
        }).then(response=>{
            if (response.ok){
                Alert("Account created")
                return null;
            }
            return response.json();
        }).then(data=>{
            if (data){
                Alert(data.message);
            }
    
        });
    }else{
        Alert("Password and username fields must be filled out.")
    }
})

