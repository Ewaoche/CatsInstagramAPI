const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');




const { CreateCat, getAllCats, getOwnersCat, getCatById, deleteCat, updateCat } = require('../controller/catsController');

router.post('/createcat', protect, CreateCat);
router.get('/getAllCats', getAllCats);
router.get('/getownersCat', protect, getOwnersCat);
router.get('/getownersCat/:id', protect, getCatById);
router.delete('/deleteCat/:id', protect, deleteCat);
router.put('/updateCat/:id', protect, updateCat);


module.exports = router;