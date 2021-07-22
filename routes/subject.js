const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });



const { CreateSubject, getAllSubject, getSubject } = require('../controllers/subjectController');

router.post('/', protect, authorize('admin'), CreateSubject);
router.get('/getsubject/:id', getSubject);
router.get('/getallsubject', getAllSubject);


module.exports = router;