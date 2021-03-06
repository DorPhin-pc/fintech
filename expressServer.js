const express = require('express')
const app = express()
const path = require('path')
var request = require('request');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');

var auth = require('./lib/auth');

app.set('views', path.join(__dirname, 'views')); // ejs file location
app.set('view engine', 'ejs'); //select view templet engine

app.use(express.static(path.join(__dirname, 'public')));//to use static asset

app.use(express.json());
app.use(express.urlencoded({extended:false}));

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1q2w3e4r',
    database : 'fintech'
  });

  connection.connect();
  
app.get('/', function (req, res) {
    var title = "javascript"
    res.send('<html><h1>'+title+'</h1><h2>contents</h2></html>')
})

app.get('/ejs', function(req, res){
    res.render('test')
})

app.get('/test', function(req, res){
    res.send('Test')
})

app.get('/design', function(req, res){
    res.render('designTest');
})

//datasend Router add
app.get('/dataSend', function(req, res){
    res.render('dataSend');
})

app.post('/getTime', function(req, res){
    var nowTime = new Date();
    res.json(nowTime);
})

app.post('/getData', function(req, res){
    console.log(req.body);
    var userData = req.body.userInputData;
    console.log('userData = ', userData);
    res.json(userData + "!!!!!")
})

app.post('/authTest',auth,function(req,res){
    res.json(req.decoded)
})

//------------------service start //
app.get('/signup', function(req, res){
    res.render('signup');
})

app.get('/login',function(req,res){
    res.render('login');
})

app.get('/main',function(req,res){
    res.render('main');
})

app.get('/authResult', function(req, res){
    var authCode = req.query.code
    console.log(authCode);
    var option = {
        method : "POST",
        url : "https://testapi.openbanking.or.kr/oauth/2.0/token",
        header : {
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        form : {
            code : authCode,
            client_id : 'HxTaO0dyeVPIepwel60gaJT2uCwCod8dwbWGH24m',
            client_secret : 'XFoOqPP7IUOaW0H9VGwcdjtYZa25mc5KKl1yoeKC',
            redirect_uri : 'http://localhost:3000/authResult',
            grant_type : 'authorization_code'
        }
    }
    request(option, function(err, response, body){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            var accessRequestResult = JSON.parse(body);
            console.log(accessRequestResult);
            res.render('resultChild', {data : accessRequestResult} )
        }
    })
})

app.post('/signup', function(req, res){
    //data req get db store
    var userName = req.body.userName
    var userEmail = req.body.userEmail
    var userPassword = req.body.userPassword
    var userAccessToken = req.body.userAccessToken
    var userRefreshToken = req.body.userRefreshToken
    var userSeqNo = req.body.userSeqNo
    console.log(userName, userEmail,userPassword,userAccessToken,userRefreshToken, userSeqNo);
    var sql = "INSERT INTO fintech.user (name, email, password, accesstoken, refreshtoken, userseqno) VALUES (?,?,?,?,?,?)"
    connection.query(sql, // excute sql
        [userName,userEmail,userPassword,userAccessToken,userRefreshToken,userSeqNo], // ? <- value
        function(err,result){
            if(err){
                console.error(err);
                res.json(0);
                throw err;
            }else{
                res.json(1);
            }
    })
})

app.post('/login', function(req, res){
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    console.log(userEmail, userPassword)
    var sql = "SELECT * FROM user WHERE email = ?";
    connection.query(sql, [userEmail], function(err, result){
        if(err){
            console.error(err);
            res.json(0);
            throw err;
        }
        else {
            console.log(result);
            if(result.length == 0){
                res.json(3)
            }
            else {
                var dbPassword = result[0].password;
                if(dbPassword == userPassword){
                    var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%"
                    jwt.sign(
                      {
                          userId : result[0].id,
                          userEmail : result[0].email
                      },
                      tokenKey,
                      {
                          expiresIn : '10d',
                          issuer : 'fintech.admin',
                          subject : 'user.login.info'
                      },
                      function(err, token){
                          console.log('로그인 성공', token)
                          res.json(token)
                      }
                    )            
                }
                else {
                    res.json(2);
                }
            }
        }
    })
})

app.post('/list',function(req, res){
    var option = {
        method : "GET",
        url : "https://testapi.openbanking.or.kr/v2.0/user/me",
        headers : {
            Authorization : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxMTAwNzU4NzY3Iiwic2NvcGUiOlsiaW5xdWlyeSIsImxvZ2luIiwidHJhbnNmZXIiXSwiaXNzIjoiaHR0cHM6Ly93d3cub3BlbmJhbmtpbmcub3Iua3IiLCJleHAiOjE1OTcyMDkwNDIsImp0aSI6IjEyNTQ1NzQxLWFmYWUtNDY3OC1iYjJkLTdhNmQ0ZjY5MDViZSJ9.9h4CdtDV9ADHXbKmyvE5A4yq6JnqhyKDu49QYF0NHqk'
        },
        qs : {
            user_seq_no : "1100758767"
        }
    }
    request(option, function(err, response, body){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            var accessRequestResult = JSON.parse(body);
            console.log(accessRequestResult);
            res.json(accessRequestResult);
        }
    })
})

app.listen(3000)

