const Url = 'http://localhost:3000/postgres'
var postgres = {
    standList: [],
    userNameList: [],
    DBList: [],
    tableList: [],
    roleList: [],
    allDB: false,
    currentDBList: [],
    allTable: false,
    currenttableList: [],
    allRole: false,
    currentroleList: [],
    allSelect: function(){
        for(var i = 0; i<postgres.standList.length; i++){
            document.getElementById("stand").options[document.getElementById("stand").options.length] = new Option(postgres.standList[i], i);
        }
        for(var i = 0; i<postgres.userNameList.length; i++){
            document.getElementById("user").options[document.getElementById("user").options.length] = new Option(postgres.userNameList[i], i);
        }
        for(var i = 0; i<postgres.DBList.length; i++){
            document.getElementById("db").options[document.getElementById("db").options.length] = new Option(postgres.DBList[i], i);
        }
        for(var i = 0; i<postgres.tableList.length; i++){
            document.getElementById("table").options[document.getElementById("table").options.length] = new Option(postgres.tableList[i], i);
        }
        for(var i = 0; i<postgres.roleList.length; i++){
            document.getElementById("role").options[document.getElementById("role").options.length] = new Option(postgres.roleList[i], i);
        }
    },
    addDB: function(){
        if (document.getElementById("cb1").checked) {
            postgres.currentDBList = postgres.DBList;
            document.getElementById("picked1").innerHTML = postgres.DBList;
        } else {
            if (postgres.currentDBList.indexOf(document.getElementById("db").options[document.getElementById("db").selectedIndex].text) == -1){
                postgres.currentDBList.push(document.getElementById("db").options[document.getElementById("db").selectedIndex].text);
                document.getElementById("picked1").innerHTML = postgres.currentDBList;
            } else document.getElementById("picked1").innerHTML = postgres.currentDBList;
        }
        postgres.refresh()
    },
    addTable: function(){
        if (document.getElementById("cb2").checked) {
            postgres.currenttableList = postgres.tableList;
            document.getElementById("picked2").innerHTML = postgres.tableList;
        }else {
            if (postgres.currenttableList.indexOf(document.getElementById("table").options[document.getElementById("table").selectedIndex].text) == -1){
                postgres.currenttableList.push(document.getElementById("table").options[document.getElementById("table").selectedIndex].text);
                document.getElementById("picked2").innerHTML = postgres.currenttableList;
            } else document.getElementById("picked2").innerHTML = postgres.currenttableList;
        }
        postgres.refresh()
    },
    addRole: function(){
        if (document.getElementById("cb3").checked) {
            postgres.currentroleList = postgres.roleList;
            document.getElementById("picked3").innerHTML = postgres.roleList;
        }else {
            if (postgres.currentroleList.indexOf(document.getElementById("role").options[document.getElementById("role").selectedIndex].text) == -1){
                postgres.currentroleList.push(document.getElementById("role").options[document.getElementById("role").selectedIndex].text);
                document.getElementById("picked3").innerHTML = postgres.currentroleList;
            } else document.getElementById("picked3").innerHTML = postgres.currentroleList;
        }
        postgres.refresh()
    },
    Clear: function(){
        document.getElementById("login").value = "";
        document.getElementById("password").value = "";
        postgres.currentDBList = [];
        postgres.currenttableList = [];
        postgres.currentroleList = [];
        document.getElementById("picked1").innerHTML = postgres.currentDBList;
        document.getElementById("picked2").innerHTML = postgres.currenttableList;
        document.getElementById("picked3").innerHTML = postgres.currentroleList;
        document.getElementById("cb1").checked = false;
        document.getElementById("cb2").checked = false;
        document.getElementById("cb3").checked = false;
        postgres.refresh()
    },
    addUser: function(){
        postgres.refresh()
        message.requestType = "add"
        postM()
    },
    grantRole: function(){
        postgres.refresh()
        message.requestType = "grant"
        if((document.getElementById("cb1").checked == false && document.getElementById("picked1").innerHTML == [])
             || (document.getElementById("cb2").checked == false && document.getElementById("picked2").innerHTML == [])
             || (document.getElementById("cb3").checked == false && document.getElementById("picked3").innerHTML == [])){
            alert( "Данные не введены" )
        } else {
            postM()
        }
    },
    revokeRole: function(){
        postgres.refresh()
        message.requestType = "revoke"
        if((document.getElementById("cb1").checked == false && document.getElementById("picked1").innerHTML == [])
             || (document.getElementById("cb2").checked == false && document.getElementById("picked2").innerHTML == [])
             || (document.getElementById("cb3").checked == false && document.getElementById("picked3").innerHTML == [])){
            alert( "Данные не введены" )
        } else {
            postM()
        }
    },
    deleteRole: function(){
        postgres.refresh()
        message.requestType = "delete"
        postM()
    },
    refresh: function(){
        message.login = document.getElementById("login").value
        message.password = document.getElementById("password").value
        message.stand = document.getElementById("stand").options[document.getElementById("stand").selectedIndex].text
        message.user = document.getElementById("user").options[document.getElementById("user").selectedIndex].text
        message.allDbChecked = document.getElementById("cb1").checked
        message.allTableChecked = document.getElementById("cb2").checked
        message.allRoleChecked = document.getElementById("cb3").checked
        message.db = postgres.currentDBList
        message.table = postgres.currenttableList
        message.role = postgres.currentroleList
    },
}
async function getM(){
    const res =  await fetch(Url, {
        method: 'GET'
    })
    const result = await res.json()
    postgres.standList = result.stand
    postgres.userNameList = result.user
    postgres.DBList = result.db
    postgres.tableList = result.table
    postgres.roleList = result.role
}
async function postM(){
    const res =  await fetch(Url, {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            parcel: message
        })
    })
    const result = await res.json()
    if (result.command) {
        alert( "Запрос " + result.command + " выполнен" )
    }
    else {
        alert( "Запрос невыполнен" )
    }
}
var message = {
    login: "",
    password: "",
    stand: "",
    user: "",
    allDbChecked: false,
    allTableChecked: false,
    allRoleChecked: false,
    db: [''],
    table: [''],
    role: [''],
    requestType: ""
}
function init() {
    getM().then(() => {
        postgres.allSelect()
    })
    var Create = document.getElementById("Создать")
	Create.onclick = postgres.addUser
    var Add1 = document.getElementById("add1")
	Add1.onclick = postgres.addDB
    var Add2 = document.getElementById("add2")
	Add2.onclick = postgres.addTable
    var Add3 = document.getElementById("add3")
	Add3.onclick = postgres.addRole
    var Clear = document.getElementById("Очистить")
    Clear.onclick = postgres.Clear
    var Grant = document.getElementById("Выдать")
	Grant.onclick = postgres.grantRole
    var Revoke = document.getElementById("Отозвать")
	Revoke.onclick = postgres.revokeRole
    var Delete = document.getElementById("Удалить")
	Delete.onclick = postgres.deleteRole
}
window.onload = init;