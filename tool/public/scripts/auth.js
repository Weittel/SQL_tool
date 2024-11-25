const Url = 'http://localhost:3000/index'
var auth = {
    login: "***",
    password: "***",
    authorization: function(){
        log = document.getElementById("login");
        pass = document.getElementById("password");
        auth.login = log.value
        auth.password = pass.value
        async function getAuth(){
            const res =  await fetch(Url, {
                method: 'GET'
            })
            const result = await res.text()
            if (result == 'true') {
                window.location="main.html"
            }
            else {
                alert( "Амогус" )
            }
        }
        async function postAuth(){
            const res =  await fetch(Url, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    parcel: auth
                })
            })
        }
        postAuth()
        getAuth()
    }
}
function init() {
    var Voiti = document.getElementById("Войти");
	Voiti.onclick = auth.authorization;
}
window.onload = init;