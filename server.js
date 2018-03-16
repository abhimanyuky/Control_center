const express = require('express')
const app = express()
const path = require('path')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const SECRET = "SECRET...."

app.use(cookieParser())
app.use(express.json()) // to support JSON-encoded bodies
app.use(express.urlencoded()) // to support URL-encoded bodies

app.post('/auth', function (req, res, next) {
  if (req.body.username == 'admin' && req.body.password == 'admin') {
    // create a token
    var token = jwt.sign({
      id: req.body.username
    }, SECRET, {
      expiresIn: 86400 // expires in 24 hours
    })

    res.cookie('id_token', token, {
      expires: new Date(Date.now() + 36000),
      httpOnly: true
    })

    //For proper applications also add the same into database

    res.redirect('/admin') //logged in and token saved as cookie
  } else {
    res.sendFile(path.join(__dirname, 'views', 'fail.html'))
  }
})

//check login for all pages under /admin
app.use('/admin', function (req, res, next) {
  var token = undefined;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token']
  } else if (req.cookies && req.cookies.id_token) {
    token = req.cookies.id_token
  }

  if (!token) {
    //not logged in so send login page
    // res.redirect('/login.html')
    // return
    return res.status(401).send('Not logged in')
  } else {
    jwt.verify(token, SECRET, function (err, decoded) {
      if (err) {
        return res.status(500).send({
          auth: false,
          message: 'Failed to authenticate token.'
        })
      } else {
        next() //Authenticated ! 👍
      }
    })
  }
})

app.get('/admin/logout', function (req, res, next) {
  //For now just deleting the cookie,
  //but for proper applications, delete the token from database as well
  res.cookie('id_token', "")
  res.end("<h1>you are logged out</h1><a href='/'>Go back to homepage</a>")
})

app.use(express.static('views')) //Send all the static files

app.listen(3000, function () {
  console.log('Server running on port 3000');
})