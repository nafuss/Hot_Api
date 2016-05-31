var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// Schema defines how the user data will be stored in MongoDB
var UserSchema = new mongoose.Schema({
  identifiant: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
  lastname: {
    type: String
  },
  // User choose if he allow to appear in the search page
  status: {
    type: String,
    enum: ['Private', 'Public'],
    default: ['Private']
  }
},
{
  timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

// Saves the user's password hashed
UserSchema.pre('save', function (next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// Create method to compare password input to password saved in database
UserSchema.methods.comparePassword = function(pw, cb) {
  bcrypt.compare(pw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

// Export module
module.exports = mongoose.model('User', UserSchema);
