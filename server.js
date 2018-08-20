const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');
// var io            = require("socket.io")(app.listen(port));
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt')
const user = require('./models/user');
const config = require('./config.js');

const crypticojs = require('./libs/cryptico/cryptico.js');
const crypto = require('crypto');
const NodeRSA = require('node-rsa');

const sslOptions = {
    key:  fs.readFileSync('private.key'), 
    cert: fs.readFileSync('STAR_unifil_br.crt')
};
const app = express();
const port = 8080;

console.log("Server Running At: localhost:" + port);

// io.use(socketioJwt.authorize({
//   secret: '123',
//   handshake: true
// }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.json());
app.use(morgan('dev'));

app.get('/welcome', function(req, res) {
    var io1 = require('socket.io-client');
    const socket1 = io1('https://plra.unifil.br:8080');
    console.log(socket1);
    res.send('Seja Bem-Vindo a API: http://localhost:' + port + '/api');
}); 

// app.use(
//     expressJWT({ secret: config.secret })
//          .unless({ path: ['/api/signin']})
//   );

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


//Rota Padrão da API:
// app.get('/', function(req, res) {
//     res.send('Seja Bem-Vindo a API: http://localhost:' + port + '/api');
// });


var apiRoutes = express.Router();
/**
https-proxy=https://plra.unifil.br:8000/
proxy=https://plra.unifil.br:8000/

*/

apiRoutes.post('/signin', function (req, res) {

    console.log('body', req.body);

    // console.log('key', sslOptions);
    // var buffer = new Buffer(req.body.passWord , 'base64');
    // var decrypted = crypto.privateDecrypt(sslOptions.key, buffer);
    // console.log('decrypted', decrypted.toString('utf8'));

//     fs.readFile('./rsa_1024_priv.pem', "utf8", (err, data) => {
//       if (err) throw err;

//       console.log('mykey',data);

//       const key = new NodeRSA(data);
// //       const key = new NodeRSA(
// // '-----BEGIN PUBLIC KEY-----\n'+
// // 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDbGx8mHOPFumbODip034XzlziL\n'+
// // 'pzHnM74pW86LEK/aeCWHv/D+IaZ0XWOuTmE3WKrxEvcbj4/SvcZbw2qb2J7fGJkP\n'+
// // 'wJJBzXQhmlrX2BmkhTnoaahadDsof9By/K2ExK0dMOu8eFuXvdCaiyYw2KV7sbbS\n'+
// // 'enYqba9JqyIZU8a+OQIDAQAB\n'+
// // '-----END PUBLIC KEY-----');

// //       const key = new NodeRSA(
// // '-----BEGIN PUBLIC KEY-----\n'+
// // 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Ox0mOJbKKCxtGXFG73t\n'+
// // 'PnVf/EmzPe8HOGyWqM2QVzophSPr8+pzR7gZpBstPCoILv2wCkF9mfJxfTKPkWtl\n'+
// // 'nmg6k+z3eCZzGO6WgI2dtQy4hUFKlgP3FJsHGg3xy6WgqVQ13x2NAHIqvCDrDA7G\n'+
// // 'DnO1xoUumO0aGTHRfzdWq6MY0SOrUqWDXxS7iM4hqIY1AUHzuBXJldxCzO+m2k6i\n'+
// // '2j1wJaKeQVI/XwahPa/YCCxpsp30fURFJUT10CvirTv5G04u3yQj+BI9yiAxff5F\n'+
// // '1aAClWDtzmranfa5yp8Nkh3XxWTTINXaQeR8jIAVy1IpdYSmd2g53gguQoben80O\n'+
// // 'ywIDAQAB\n'+
// // '-----END PUBLIC KEY-----');

// //       const key = new NodeRSA(
// // '-----BEGIN RSA PRIVATE KEY-----\n'+
// // 'MIIBOQIBAAJAVY6quuzCwyOWzymJ7C4zXjeV/232wt2ZgJZ1kHzjI73wnhQ3WQcL\n'+
// // 'DFCSoi2lPUW8/zspk0qWvPdtp6Jg5Lu7hwIDAQABAkBEws9mQahZ6r1mq2zEm3D/\n'+
// // 'VM9BpV//xtd6p/G+eRCYBT2qshGx42ucdgZCYJptFoW+HEx/jtzWe74yK6jGIkWJ\n'+
// // 'AiEAoNAMsPqwWwTyjDZCo9iKvfIQvd3MWnmtFmjiHoPtjx0CIQCIMypAEEkZuQUi\n'+
// // 'pMoreJrOlLJWdc0bfhzNAJjxsTv/8wIgQG0ZqI3GubBxu9rBOAM5EoA4VNjXVigJ\n'+
// // 'QEEk1jTkp8ECIQCHhsoq90mWM/p9L5cQzLDWkTYoPI49Ji+Iemi2T5MRqwIgQl07\n'+
// // 'Es+KCn25OKXR/FJ5fu6A6A+MptABL3r8SEjlpLc=\n'+
// // '-----END RSA PRIVATE KEY-----');
      
//       // const text = '123';
//       // const encrypted = key.encrypt(text, 'base64');
//       // console.log('encrypted1:', encrypted);
//       // console.log('decrypted1:', key.decrypt('OCFjZANZby1sbvX7zxzy482+TiTIt+5P2PR9qcjFXIaPm5bSv22/zImwOIMX3hp7V8DmEclOa4RfL50H8iZq1+1jVoPW24pEbArbhFzFgdk25ojk47pMGsefM5NGrfaS0/0RMUSoCe1oRMvM2lwSlMsm8Xgo4knZYXDOsQsRTnU=', 'utf8'));

//       console.log(' encrypted:', req.body.teste);
      
//       const decrypted = key.decrypt(req.body.teste, 'utf8');
//       console.log(' decrypted:', decrypted);
//     });
    // var crypt = new JSEncrypt();
    // var passWord = crypt.decrypt(enc);
    // console.log('passWord',passWord);
    if (req.body.userName != "daniel" || req.body.passWord != "123") {
        res.json({ success: false, message: 'Usuário ou senha incorreto(s)!' });

    } else {

        // var usuario = new user()
        // {
        //     name: "tadriano",
        //     admin: true
        // };

        var token = jwt.sign({
            name: "daniel",
            admin: true
        }, config.secret, {
            expiresIn: 144000000000000000000000
        });

        res.json({
            success: true,
            message: 'Token criado!!!',
            token: token
        });
    }


});


// apiRoutes.use(function (req, res, next) {

//     var token = req.body.token || req.query.token || req.headers['x-access-token'];
    
//     console.log('token', token);

//     if (token) {
//         jwt.verify(token, config.secret, function (err, decoded) {
//             if (err) {
//                 return res.json({ success: false, message: 'Falha ao tentar autenticar o token!' });
//             } else {
//                 //se tudo correr bem, salver a requisição para o uso em outras rotas
//                 req.decoded = decoded;
//                 next();
//             }
//         });

//     } else {
//         // se não tiver o token, retornar o erro 403
//         console.log('se não tiver o token, retornar o erro 403');
//         return res.status(403).send({
//             success: false,
//             message: '403 - Forbidden'
//         });
//     }
// });

function authenticationMiddleware() {
    return function (req, res, next) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        console.log('token', token);
    
        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Falha ao tentar autenticar o token!' });
                } else {
                    //se tudo correr bem, salver a requisição para o uso em outras rotas
                    req.decoded = decoded;
                    next();
                }
            });
    
        } else {
            // se não tiver o token, retornar o erro 403
            console.log('se não tiver o token, retornar o erro 403');
            return res.status(403).send({
                success: false,
                message: '403 - Forbidden'
            });
        }
    }
  }


apiRoutes.get('/', authenticationMiddleware(), function (req, res) {
    res.json({ message: 'Node.js com JWT' });
});

app.use('/api', apiRoutes);

// var port2 = process.env.PORT || port;
// app.listen(port2);
// app.listen(8080);
const io = require('socket.io').listen(https.createServer(sslOptions, app).listen(port));
// const io = require('socket.io').listen(app.listen(port));
const socketioJwt   = require("socketio-jwt");
var alunoAtual = {};



function insertAluno(connection, aluno){
  connection.execute(`insert into plra_leituras (sq_aluno, dt_incl) values(:sq, sysdate)`, 
    {sq: aluno.SQ_ALUNO}, 
    { autoCommit: true }, 
    function(err, result) {
      if (err) {
        console.error(err.message);
        doRelease(connection);
        return;
      }

      console.log('plra_leituras', result);
      doRelease(connection);
  });
}


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  /*socket.on('eventoAluno', function(data) {
      console.log('server - eventoAluno:', data.sqAluno);

      // if (Number.isInteger(data.sqAluno)){
        // - Conectar no banco.
        // - Buscar aluno, conforme parametro passado.
        // - Retornar o aluno.
        oracledb.getConnection(
        {
          user          : dbConfig.user,
          password      : dbConfig.password,
          connectString : dbConfig.connectString
        },
        function(err, connection) {
          if (err) {
            console.error(err.message);
            return;
          }
          connection.execute(
  `SELECT LA.NM_ALUNO
         ,LA.SQ_ALUNO
         ,LM.ID_TURMA
         ,LC.DS_CURSO
         ,'http://portal.filadelfia.br:7778/portal/pls/fotos/docs/'||TO_CHAR(LA.SQ_ALUNO, 'FM099999')||'.jpg' FOTO
         ,TO_CHAR(SYSDATE, 'DD/MM/RRRR HH24:MI:SS') DT_ATUAL
     FROM LAC_ALUNOS LA
         ,LAC_MATRICULAS LM
         ,LAC_TURMAS LT
         ,LAC_CURSOS LC
    WHERE LM.SQ_ALUNO     = LA.SQ_ALUNO
      AND LM.ID_TURMA     = LT.ID_TURMA
      AND LM.AN_MATRICULA = TO_CHAR(SYSDATE, 'RRRR')
      AND LC.ID_CURSO     = LT.ID_CURSO
      AND LM.ST_ACADEMICO IN ('1', 'B')
      AND TO_CHAR(LA.SQ_ALUNO, 'FM099999')     = :id
 GROUP BY LA.NM_ALUNO
         ,LM.ID_TURMA
         ,LC.DS_CURSO 
         ,LA.SQ_ALUNO`,
            [data.sqAluno],  // bind value for :id
            function(err, result) {
              if (err) {
                console.error(err.message);
                doRelease(connection);
                return;
              }

              var aluno = {};
              console.log('result',result);
              if(result.metaData && result.rows){
                console.log('result.rows.length',result.rows.length);
                if(result.rows.length > 0){
                  for(var i = 0; i < result.metaData.length; i++){
                      aluno[result.metaData[i].name] = result.rows[0][i];
                  }
                }
              }

              console.log('Comunicando os clientes'); 
              
              //Comunicando os clientes
              if(aluno){
                if(alunoAtual.SQ_ALUNO !== aluno.SQ_ALUNO || !alunoAtual.SQ_ALUNO){
                  alunoAtual = aluno;
                  console.log('send aluno',aluno);
                  insertAluno(connection, aluno);
                  io.emit('novoaluno', aluno);
                }
                
              } else {
                doRelease(connection);  
              }
              
            });

        });

      // }

    });*/
});

/*
io.sockets
  .on('connection', socketioJwt.authorize({
    secret: config.secret,
    // timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {

    console.log('a user connected');
    socket.on("unauthorized", function(error, callback) {
        if (error.data.type == "UnauthorizedError" || error.data.code == "invalid_token") {
            // redirect user to login page perhaps or execute callback:
          callback();
          console.log("User's token has expired");
        }
    });

    //this socket is authenticated, we are good to handle more events from it.
    // console.log(socket);
    // console.log('---------------------------------------------------------------------');
    // console.log(socket.decoded_token);


    socket.on('eventoAluno', function(data) {
      console.log('server - eventoAluno:', data.sqAluno);

      // if (Number.isInteger(data.sqAluno)){
        // - Conectar no banco.
        // - Buscar aluno, conforme parametro passado.
        // - Retornar o aluno.
        oracledb.getConnection(
        {
          user          : dbConfig.user,
          password      : dbConfig.password,
          connectString : dbConfig.connectString
        },
        function(err, connection) {
          if (err) {
            console.error(err.message);
            return;
          }
          connection.execute(
  `SELECT LA.NM_ALUNO
         ,LA.SQ_ALUNO
         ,LM.ID_TURMA
         ,LC.DS_CURSO
         ,'http://portal.filadelfia.br:7778/portal/pls/fotos/docs/'||TO_CHAR(LA.SQ_ALUNO, 'FM099999')||'.jpg' FOTO
         ,TO_CHAR(SYSDATE, 'DD/MM/RRRR HH24:MI:SS') DT_ATUAL
     FROM LAC_ALUNOS LA
         ,LAC_MATRICULAS LM
         ,LAC_TURMAS LT
         ,LAC_CURSOS LC
    WHERE LM.SQ_ALUNO     = LA.SQ_ALUNO
      AND LM.ID_TURMA     = LT.ID_TURMA
      AND LM.AN_MATRICULA = TO_CHAR(SYSDATE, 'RRRR')
      AND LC.ID_CURSO     = LT.ID_CURSO
      AND LM.ST_ACADEMICO IN ('1', 'B')
      AND TO_CHAR(LA.SQ_ALUNO, 'FM099999')     = :id
 GROUP BY LA.NM_ALUNO
         ,LM.ID_TURMA
         ,LC.DS_CURSO 
         ,LA.SQ_ALUNO`,
            [data.sqAluno],  // bind value for :id
            function(err, result) {
              if (err) {
                console.error(err.message);
                doRelease(connection);
                return;
              }

              var aluno = {};
              console.log('result',result);
              if(result.metaData && result.rows){
                console.log('result.rows.length',result.rows.length);
                if(result.rows.length > 0){
                  for(var i = 0; i < result.metaData.length; i++){
                      aluno[result.metaData[i].name] = result.rows[0][i];
                  }
                }
              }

              console.log('Comunicando os clientes'); 
              
              //Comunicando os clientes
              if(aluno){
                if(alunoAtual.SQ_ALUNO !== aluno.SQ_ALUNO || !alunoAtual.SQ_ALUNO){
                  alunoAtual = aluno;
                  console.log('send aluno',aluno);
                  insertAluno(connection, aluno);
                  io.emit('novoaluno', aluno);
                }
                
              } else {
                doRelease(connection);  
              }
              
            });

        });

      // }

    });
  });

// io.on('connection', function (socket) {
//   // in socket.io < 1.0
//   console.log('hello1!', socket.handshake.decoded_token.name);
//   // in socket.io 1.0
//   console.log('hello2! ', socket.decoded_token.name);
//   socket.on('eventoAluno', function(data) {
//     console.log('server - eventoAluno:', data);
//     // - Conectar no banco.
//     // - Buscar aluno, conforme parametro passado.
//     // - Retornar o aluno.
//     // oracledb.getConnection(
//     // {
//     //   user          : dbConfig.user,
//     //   password      : dbConfig.password,
//     //   connectString : dbConfig.connectString
//     // },
//     // function(err, connection) {
//     //   if (err) {
//     //     console.error(err.message);
//     //     return;
//     //   }
//     //   connection.execute(
//     //     `SELECT *
//     //      FROM CAC_ALUNOS
//     //      WHERE SQ_ALUNO = :id`,
//     //     [37474],  // bind value for :id
//     //     function(err, result) {
//     //       if (err) {
//     //         console.error(err.message);
//     //         doRelease(connection);
//     //         return;
//     //       }
//     //       console.log(result);
          

//     //       //Retornando
//     //       socket.emit('novoAluno', {aluno: result.rows});
//     //       doRelease(connection);
//     //     });
//     // });
    
//   });

//   socket.on('disconnect', function () {
//     console.log('User disconnected');
//   });

// });*/

function doRelease(connection) {
  connection.close(
    function(err) {
      if (err)
        console.error(err.message);
    });
}

// var io = require('socket.io').listen(app.listen(port));
// io.sockets.on("connection",function(socket) {
//   console.log('User connected');

//   socket.on('clientEvent', function(data) {
//     console.log(data.msg);
//     socket.emit('serverEvent', {msg: 'Olá eu sou o servidor!'});
//   });

//   socket.on('eventoAluno', function(data) {
//     console.log('server - eventoAluno:', data);
//     // - Conectar no banco.
//     // - Buscar aluno, conforme parametro passado.
//     // - Retornar o aluno.
//     oracledb.getConnection(
//     {
//       user          : dbConfig.user,
//       password      : dbConfig.password,
//       connectString : dbConfig.connectString
//     },
//     function(err, connection) {
//       if (err) {
//         console.error(err.message);
//         return;
//       }
//       connection.execute(
//         `SELECT *
//          FROM CAC_ALUNOS
//          WHERE SQ_ALUNO = :id`,
//         [37474],  // bind value for :id
//         function(err, result) {
//           if (err) {
//             console.error(err.message);
//             doRelease(connection);
//             return;
//           }
//           console.log(result);
          

//           //Retornando
//           socket.emit('novoAluno', {aluno: result.rows});
//           doRelease(connection);
//         });
//     });
    
//   });

//   socket.on('disconnect', function () {
//     console.log('User disconnected');
//   });

// });