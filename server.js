const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('./data/dbConfig');

const server = express();

server.use(express.json());
server.use(session({
    name: 'John Doe',
    secret: 'Secret, Secret, I have a Secret',
    cookie: {
      maxAge: 60 * 100 * 1000,
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false
  }));
  server.use('/api/users', (req, res, next) => {
    if (req.session && req.session.user) {
      next();
    } else {
      res.status(401).json({message: 'You shall not pass!'});
    }
  });
  
  server.post('/api/register', ({body: {username, password}}, res) => {
    const encryptedPassword = bcrypt.hashSync(password, 14);
  
    db('users')
      .insert({username, password: encryptedPassword})
      .then(() => res.status(201).json({message: 'Welcome user'}))
      .catch(() => res.status(500).json({message: 'User error'}));
  });
  
  server.post('/api/login', (req, res) => {
    const {body: {username, password}} = req;
  
    db('users')
      .where({username})
      .select()
      .first()
      .then(user => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
          return res.status(401).json({message: 'Login fail'});
        }
  
        req.session.user = user;
        res.json({message: 'Hello again'});
      })
      .catch(e => {
        console.log(e);
        res.status(500).json({message: 'login error'})
      });
  });
  
  server.get('/api/users', (req, res) => {
    db('users')
      .then(users => res.json(users))
      .catch(() => res.status(500).json({message: 'user error'}));
  });


module.exports = server;