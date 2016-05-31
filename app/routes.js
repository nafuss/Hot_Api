// Import dependencies
var passport = require('passport');
var express = require('express');
var config = require('../config/main');
var jwt = require('jsonwebtoken');

// Load models
var User = require('./models/user');
var Chat = require('./models/chat');

// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section

  // Initialize passport for use
  app.use(passport.initialize());

  // Bring in defined Passport Strategy
  require('../config/passport')(passport);

  // Create API group routes
  var apiRoutes = express.Router();

  // Register new users
  apiRoutes.post('/register', function(req, res) {
    if(!req.body.email || !req.body.password) {
      res.json({ success: false, message: 'Please enter email and password.' });
    } else {
      var newUser = new User({
        email: req.body.email,
        password: req.body.password,
        identifiant: req.body.identifiant,
        name: req.body.name,
        lastname: req.body.lastname,
        status: req.body.status
      });

      // Attempt to save the user
      newUser.save(function(err) {
        if (err) {
          return res.json({ success: false, message: 'That email address already exists.'});
        }
        res.json({ success: true, message: 'Successfully created new user.' });
      });
    }
  });


  // Authenticate the user and get a JSON Web Token to include in the header of future requests.
  apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
      identifiant: req.body.identifiant
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({ success: false, message: 'Authentication failed. User not found.' });
      } else {
        // Check if password matches
        user.comparePassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            // Create token if the password matched and no error was thrown
            var token = jwt.sign(user, config.secret, {
              expiresIn: 10080 // in seconds
            });
            res.json({ success: true, token: 'JWT ' + token });
          } else {
            res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
          }
        });
      }
    });
  });

  // Display list of users
  apiRoutes.get('/users', passport.authenticate('jwt', { session: false }), function(req, res) {
    User.find({}, '-password', function(err, users) {
      if (err)
        res.send(err);

      res.json(users);
    })
  });

  // Update user information
  apiRoutes.put('/users/:user_id', passport.authenticate('jwt', { session: false }), function(req, res) {
    User.findOne({'_id': req.params.user_id}, function(err, user) {
      if (err)
        res.send(err)

      user.email = req.body.email,
      user.password = req.body.password,
      user.identifiant = req.body.identifiant,
      user.name = req.body.name,
      user.lastname = req.body.lastname,
      user.status = req.body.status

      //Save user credentials
      user.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'User data edited!' });
      });
    })
  });

  // Protect chat routes with JWT
    // GET messages for authenticated user
    apiRoutes.get('/chat', passport.authenticate('jwt', { session: false }), function(req, res) {
      Chat.find({$or : [{'to': req.user._id}, {'from': req.user._id}]}, function(err, messages) {
        if (err)
          res.send(err);

        res.json(messages);
      });
    });

    // POST to create a new message from the authenticated user
  apiRoutes.post('/chat', passport.authenticate('jwt', { session: false }), function(req, res) {
    var chat = new Chat();
        chat.from = req.user._id;
        chat.to = req.body.to;
        chat.message_body = req.body.message_body;
        chat.link = req.body.link;

        // Save the chat message if there are no errors
        chat.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Message sent!' });
        });
  });

  // PUT to update a message the authenticated user sent
  apiRoutes.put('/chat/:message_id', passport.authenticate('jwt', { session: false }), function(req, res) {
    Chat.findOne({$and : [{'_id': req.params.message_id}, {'from': req.user._id}]}, function(err, message) {
      if (err)
        res.send(err);

      message.message_body = req.body.message_body;

      // Save the updates to the message
      message.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'Message edited!' });
      });
    });
  });

  // DELETE a message
    apiRoutes.delete('/chat/:message_id', passport.authenticate('jwt', { session: false }), function(req, res) {
      Chat.findOneAndRemove({$and : [{'_id': req.params.message_id}, {'from': req.user._id}]}, function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'Message removed!' });
      });
    });

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
