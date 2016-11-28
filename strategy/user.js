
var passport = require('passport');
// var localStrategy = require('passport-local').Strategy;
var encryptLib = require('../modules/encryption');
var connection = require('../modules/connection');
var pg = require('pg');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  pg.connect(connection, function (err, client) {
    var user = {};
      var query = client.query("SELECT * FROM primers WHERE id = $1", [id]);
      query.on('row', function (row) {
        user = row;
        done(null, user);
      });
      // After all data is returned, close connection and return results
      query.on('end', function () {
          client.end();
      });
      // Handle Errors
      if (err) {
          console.log(err);
      }
  });
});

// Does actual work of logging in
passport.use(new HerokuStrategy({
// passport.use('local', new localStrategy({
    passReqToCallback: true,
    usernameField: 'username'
    }, function(req, username, password, done){
	    pg.connect(connection, function (err, client) {
	    	console.log('called local - pg');
	    	var user = {};
        var query = client.query("SELECT * FROM primers WHERE username = $1", [username]);

        query.on('row', function (row) {
        	console.log('User obj', row);
        	user = row;

          // Hash and compare
          if(encryptLib.comparePassword(password, user.password)) {
            // all good!
            console.log('matched');
            done(null, user);
          } else {
            console.log('nope');
            done(null, false, {message: 'Incorrect credentials.'});
          }
        });
        // After all data is returned, close connection and return results
        query.on('end', function () {
            client.end();
        });
        // Handle Errors
        if (err) {
            console.log(err);
        }
	    });
    }
));
module.exports = passport;
