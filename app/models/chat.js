var mongoose = require('mongoose');

// Schema defines how chat messages will be stored in MongoDB
var ChatSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  message_body: {
    type: String,
    required: true
  },
  // Used to store yt link
  link: {
    type: String,
  }
},
{
  timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

// Export module
module.exports = mongoose.model('Chat', ChatSchema);
