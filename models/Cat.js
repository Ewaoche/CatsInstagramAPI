const mongoose = require('mongoose');




SubjectSchema = new mongoose.Schema({
    Description: {
        type: String,
        required: [true, 'please add Description']
    },
    ImageUrl: {
        type: String,
        required: [true, 'please add Description']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Subject', SubjectSchema);