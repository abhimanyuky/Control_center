const express = require('express')
const app = express()
const path = require('path')
const jwt = require('jsonwebtoken')

const SECRET = "SECRET...."

app.use(express.json()) // to support JSON-encoded bodies
app.use(express.urlencoded()) // to support URL-encoded bodies

var auth = function (req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token) {

    return res.status(401).send({
      auth: false,
      message: 'No token provided.'
    });
  }

  jwt.verify(token, SECRET, function (err, decoded) {
    if (err) return res.status(500).send({
      auth: false,
      message: 'Failed to authenticate token.'
    });
  })
  next()
}
app.post('/auth', function (req, res, next) {

  if (req.body.username == 'admin' && req.body.password == 'admin') {
    // create a token
    var token = jwt.sign({
      id: req.body.username
    }, SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).send({
      auth: true,
      token: token
    });
  } else {
    res.sendFile(path.join(__dirname, 'views', 'fail.html'))
  }
})
//
// app.get('/private', function (req, res, next) {
//   res.sendFile(path.join(__dirname, 'views', 'index.html'))
// })
//
// app.get('/logout', function (req, res, next) {
//   res.sendFile(path.join(__dirname, 'views', 'index.html'))
// })

// app.use('/admin', jwt({
//   secret: 'secret'
// })) //check for jwt for all pages under /admin

app.use(express.static('views')) //Send all the static files

app.listen(3000, function () {
  console.log('Server running on port 3000');
})