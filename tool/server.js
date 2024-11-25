const express = require('express')
const fs = require('fs')
const path = require('path')
const Pool = require('pg').Pool
var p = {
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "testDB1"
}
const pool = new Pool(p)
const app = express()
const PORT = 3000
const createPath = (page) => path.resolve(__dirname, 'public', `${page}.html`)
const authJson = fs.readFileSync('public/scripts/json/auth.json', {encoding : 'utf8'})
const authPostgres = fs.readFileSync('public/scripts/json/postgres.json', {encoding : 'utf8'})
var authData = JSON.parse(authJson)
var postgresData = JSON.parse(authPostgres)
var num = false
var arr = []
app.use(express.static('public'))
app.use(express.json());
app.listen(PORT, () => {console.log(`Express web app on http://localhost:${PORT}`);})
app.get('/index', (req,res)=>{
    res.send(num)
    res.sendFile(createPath('index'))
})
app.post('/index', (req,res)=>{
    const { parcel } = req.body
    num = false
    for(var i=0;i<authData.length;i++){
        if(authData[i].login == parcel.login && authData[i].password == parcel.password){
            num = true
        }
    }
})
app.get('/main', (req,res)=>{
    res.sendFile(createPath('main'))
})
app.get('/postgres', async (req,res)=>{
    const GetRoles = await pool.query(`SELECT rolname FROM pg_catalog.pg_roles where rolcanlogin = 'true'`)
    for(var i=0;i<GetRoles.rows.length;i++){
        postgresData.user[i] = GetRoles.rows[i].rolname
    }
    const GetDbNames = await pool.query(`SELECT datname FROM pg_catalog.pg_database where datistemplate = 'false'`)
    for(var i=0;i<GetDbNames.rows.length;i++){
        postgresData.db[i] = GetDbNames.rows[i].datname
        p.database = GetDbNames.rows[i].datname
        arr[i] = new Pool(p)
        const GetTNames = await arr[i].query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`)
        for(var j=0;j<GetTNames.rows.length;j++){
            postgresData.table.push(GetTNames.rows[j].tablename)
        }
    }
    res.json(postgresData)
    postgresData.table = []
    res.sendFile(createPath('postgres'))
})
app.post('/postgres', async (req,res)=>{
    const { parcel } = req.body
    console.log(parcel)
    switch (parcel.requestType){
        case 'add': 
            a = String(parcel.login)
            b = String(parcel.password)
            c = parcel.db
            z = 'CREATE ROLE ' + a + ' WITH LOGIN ENCRYPTED PASSWORD ' + "'" + b + "'"
            console.log(z)
            const addU = await pool.query(z)
            res.json(addU)
            break
        case 'grant':
            if (parcel.allRoleChecked == true){
                a = 'ALL PRIVILEGES'
            } else {
                //расширить список ролей
                a = String(parcel.role)
            }
            b = parcel.db
            d = String(parcel.user)
            c = []
            for(var i=0;i<b.length;i++){
                p.database = b[i]
                arr[i] = new Pool(p)
                if (parcel.allTableChecked == true){
                    c = 'ALL TABLES IN SCHEMA public'
                    z = 'GRANT ' + a + ' ON ' + c + ' TO ' + d
                } else {
                    const GetTNames = await arr[i].query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`)
                    for(var j=0;j<GetTNames.rows.length;j++){
                        for(var l=0;l<parcel.table.length;l++){
                            if (parcel.table[l] == GetTNames.rows[j].tablename) {
                                c.push(String('public.' + '"' + parcel.table[l] + '"'))
                            }
                        }
                    }
                    z = 'GRANT ' + a + ' ON ' + c + ' TO ' + d
                }
                if (c != ''){
                    console.log(z)
                    const grantU = await arr[i].query(z)
                    c = []
                    if (i == (b.length-1)){
                        res.json(grantU)
                    }
                }
            } 
            break
        case 'revoke':
            if (parcel.allRoleChecked == true){
                a = 'ALL PRIVILEGES'
            } else {
                a = String(parcel.role)
            }
            b = parcel.db
            d = String(parcel.user)
            c = []
            for(var i=0;i<b.length;i++){
                p.database = b[i]
                arr[i] = new Pool(p)
                if (parcel.allTableChecked == true){
                    c = 'ALL TABLES IN SCHEMA public'
                    z = 'REVOKE ' + a + ' ON ' + c + ' FROM ' + d
                } else {
                    const GetTNames = await arr[i].query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`)
                    for(var j=0;j<GetTNames.rows.length;j++){
                        for(var l=0;l<parcel.table.length;l++){
                            if (parcel.table[l] == GetTNames.rows[j].tablename) {
                                c.push(String('public.' + '"' + parcel.table[l] + '"'))
                            }
                        }
                    }
                    z = 'REVOKE ' + a + ' ON ' + c + ' FROM ' + d
                }
                if (c != ''){
                    console.log(z)
                    //создание супер пользователя
                    const revokeU = await pool.query(z)
                    c = []
                    if (i == (b.length-1)){
                        res.json(revokeU)
                    }
                }
            } 
            break
        case 'delete':
            a = parcel.user
            const GetDbNames = await pool.query(`SELECT datname FROM pg_catalog.pg_database where datistemplate = 'false'`)
            for(var i=0;i<GetDbNames.rows.length;i++){
                p.database = GetDbNames.rows[i].datname
                arr[i] = new Pool(p)
                z = 'REASSIGN OWNED BY "' + a + '" TO postgres'
                const reassign = await arr[i].query(z)
                console.log(z)
                z = 'DROP OWNED BY "' + a + '"'
                const drop = await arr[i].query(z)
                console.log(z)
            }
            z = 'DROP USER IF EXISTS ' + a
            const deleteU = await pool.query(z)
            console.log(z)
            res.json(deleteU)
            break
        default: break
    }
})
app.use((req,res)=>{
    res.sendFile(createPath('error'))
})
// SELECT table_schema, table_name, privilege_type FROM information_schema.table_privileges WHERE grantee = 'tsygankovv';
// ALTER ROLE ablogini LOGIN ENCRYPTED PASSWORD '4K7Y1uvdRK'  SUPERUSER INHERIT CREATEDB CREATEROLE REPLICATION;