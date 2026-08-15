function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    const WAIT = "Please wait..."
    const LOGIN = "Log In"

    // Handle the form data with JavaScript
    const username = document.querySelector('[name="acct_no"]').value;
    const password = document.querySelector('[name="acct_password"]').value;
    const login = document.querySelector('[name="login"]');
    if(login.innerText === WAIT) return
    login.innerText = WAIT
    login.setAttribute("style", "font-style:italic;opacity:0.4;cursor:not-allowed")

    
    const user = getUser(true)
    //console.log("user:::=> ", user)
    //If the username is the same as the recent one
    if(user && `${user.accountNumber_username}` === `${username}`) {
        setTimeout(() => {
            if(`${user.password}` === `${password}`) {
                console.log("user:::tRUE")
                location.href = "/online/pin"

            } else {
                login.innerText = LOGIN
                login.removeAttribute("style")
                Swal.fire({
                    type: "error",
                    title: "Authentication Error",
                    text: "Wrong username or password."
                })
            }
        }, getRandomRangeNoSeed(1000, 3000));
        return
    }


    // Validate reCAPTCHA
    /*
    try {
        grecaptcha.ready(function() {
            grecaptcha.execute('6Lf934UpAAAAAH9hWVrcmrC0cUbNQ3HNWQALpR1l', {action: 'submit'})
            .then(function(token) {
                // Add your logic to submit to your backend server here.
                // Perform any additional logic or send requests using the form data
                //console.log('Username:', username);
                //console.log('Password:', password);
                //console.log('recaptchaResponse:', token);

                // Example: Send an AJAX request
                // You can use fetch or any other method to send data to the server
                // Replace the URL and method with your actual endpoint and HTTP method
                fetch('https://us-central1-my-project-223a2.cloudfunctions.net/api/doc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        collection: "banks",
                        user_key: "accountNumber_username",
                        pass_key: "password",
                        user_value: parseInt(username),
                        pass_value: password,
                        recaptchaResponse: token
                    }),
                })
                .then(response => {
                    // Handle the response from the server
                    response.json()
                    .then(responseData => {
                        
                        //console.log('Server ResponseData:', responseData, response);
                        if(response.status != 200) {
                            login.innerText = LOGIN
                            login.removeAttribute("style")
                        
                            var error = responseData.error
                            if(error == "logins_finished") {
                                error = "Your account has currently been disabled. Please reach out to our customer care support center to resolve the issue on your account."
                            }
                            Swal.fire({
                                type: "error",
                                title: "Authentication Error",
                                text: error
                            })

                        } else {
                            const data = responseData.data
                            //console.log('Server Data:', data);
                            setUser(data)
                            .then(() => {
                                location.href = "/online/pin"
                            })
                            .catch(e => {
                                login.innerText = LOGIN
                                login.removeAttribute("style")
                                Swal.fire({
                                    type: "error",
                                    title: "Authentication Error",
                                    text: "An error occurred while trying to setup your account." + e.message
                                })
                                //console.log(e)
                            })
                        }
                    })
                    .catch(error => {
                        login.innerText = LOGIN
                        login.removeAttribute("style")
                        Swal.fire({
                            type: "error",
                            title: "Authentication Error",
                            text: error.message
                        })
                        //console.error('Error:', error);
                    })
                })
                .catch(error => {
                    login.innerText = LOGIN
                    login.removeAttribute("style")
                    Swal.fire({
                        type: "error",
                        title: "Authentication Error",
                        text: error.message
                    })
                    //console.error('Error:', error);
                });
            })
            .catch(error => {
                login.innerText = LOGIN
                login.removeAttribute("style")
                Swal.fire({
                    type: "error",
                    title: "Authentication Error",
                    text: error.message
                })
                //console.error('Error:', error);
            });
        });

    } catch (e) {
        login.innerText = LOGIN
        login.removeAttribute("style")
        Swal.fire({
            type: "error",
            title: "Authentication Error",
            text: "Make sure you're connected to the internet then reload the page to try again."
        })
        return
    }*/
    fetch('https://us-central1-my-project-223a2.cloudfunctions.net/api/doc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            collection: "banks",
            user_key: "accountNumber_username",
            pass_key: "password",
            user_value: parseInt(username),
            pass_value: password,
            recaptchaResponse: "token"
        }),
    })
    .then(response => {
        // Handle the response from the server
        response.json()
        .then(responseData => {
            
            //console.log('Server ResponseData:', responseData, response);
            if(response.status != 200) {
                login.innerText = LOGIN
                login.removeAttribute("style")
            
                var error = responseData.error
                if(error == "logins_finished") {
                    error = "Your account has currently been disabled. Please reach out to our customer care support center to resolve the issue on your account."

                } else if(error == "account_disabled") {
                    error = "This account is currently in-active."
                }
                Swal.fire({
                    type: "error",
                    title: "Authentication Error",
                    text: error
                })
                console.error('Error.1:', error);
                console.error('Error.1a:', responseData);

            } else {
                const data = responseData.data
                //console.log('Server Data:', data);
                setUser(data)
                .then(() => {
                    location.href = "/online/pin"
                })
                .catch(e => {
                    login.innerText = LOGIN
                    login.removeAttribute("style")
                    Swal.fire({
                        type: "error",
                        title: "Authentication Error",
                        text: "An error occurred while trying to setup your account." + e.message
                    })
                    //console.log(e)
                })
            }
        })
        .catch(error => {
            login.innerText = LOGIN
            login.removeAttribute("style")
            Swal.fire({
                type: "error",
                title: "Authentication Error",
                text: error.message
            })
            console.error('Error.2:', error);
        })
    })
    .catch(error => {
        login.innerText = LOGIN
        login.removeAttribute("style")
        Swal.fire({
            type: "error",
            title: "Authentication Error",
            text: error.message
        })
        console.error('Error.3:', error);
    });
}
$(document).ready(function() {
    setTimeout(() => {
        const user = getUser(true)
        if((user) && localStorage.getItem("pin_entered")) {
            window.location.href = '/online/user/dashboard'//localStorage.getItem("pin_entered")? '/online/user/dashboard' : '/online/pin';

        } else {
            try {
                localStorage.removeItem("pin_entered")

            } catch(e) {}
        }
    }, 3000);
});