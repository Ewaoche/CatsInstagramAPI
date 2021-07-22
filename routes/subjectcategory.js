const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

//Re-route into other routers
//route POST /api/v1/:subjectcategoryId/createsubject

router.use('/:subjectcategoryId/createsubject', require('../routes/subject'));

const { CreateSubjectCategory, getAllSubjectCategory } = require('../controllers/subjectCategoryController');

router.post('/subjectcategory', protect, authorize('admin'), CreateSubjectCategory);
router.get('/getsubjectcategory', getAllSubjectCategory);

module.exports = router;