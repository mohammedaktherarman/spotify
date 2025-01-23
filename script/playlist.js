let token = "";

function getToken() {
    token = window.location.href.split("access_token=")[1];
}

getToken()

console.log(token)