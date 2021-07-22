const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
// const SubjectCategory = require('../models/Category');
const Cat = require('../models/Cat');



//@desc   Create Subject Category
//route POST /api/v1/subjectcategory
// Access Private

const CreateCat = asyncHandler(async(req, res, next) => {

    //add user to req body
    req.body.user = req.user.id;

    const cat = await Cat.create(req.body);

    if (cat) {
        res.status(200).json({
            message: 'Subject cat was created successfully',
            data: cat
        });
    }
});


const getAllCats = asyncHandler(async(req, res, next) => {

    const AllCat = await Cat.find();
    if (AllCat) {
        res.status(200).json({
            message: 'successfully retrived',
            AllCat
        });
    }
});


const getCatById = asyncHandler(async(req, res, next) => {
    const cat = await Cat.findById(req.params.id);
    if (cat) {
        res.status(200).json({
            message: 'successfully retrived',
            cat
        });
    }
});

const getOwnersCat = asyncHandler(async(req, res, next) => {
    const AllOwnerCat = await Cat.find({ user: req.user.id });
    if (AllOwnerCat) {
        res.status(200).json({
            message: 'successfully retrived',
            AllOwnerCat
        });
    }
});

const updateCat = asyncHandler(async(req, res, next) => {

    let getcat = await Cat.findById(req.params.id);

    if (!getcat) {
        return next(new ErrorResponse(`No Cat with the id of ${req.params.id}`, 404));
    }

    //Make sure user is the Course owner
    if (getcat.user.toString() !== req.user.id && req.user.role !== 'admin') {

        return next(
            new ErrorResponse(`User with  ${req.user.id} is not authorized to update a cat in  except the owner`, 401)
        );
    }

    cat = await Cat.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: cat
    })

});

//@desc   DELETE  course
//route DELETE /api/v1/courses/:id
// Access Private

const deleteCat = asyncHandler(async(req, res, next) => {

    const getcat = await Cat.findById(req.params.id);

    if (!getcat) {
        return next(new ErrorResponse(`No Cat with the id of ${req.params.id}`, 404));
    }

    //Make sure user is the Course owner
    if (getcat.user.toString() !== req.user.id && req.user.role !== 'admin') {

        return next(
            new ErrorResponse(`User with  ${req.user.id} is not authorized to delete a cat  except the cat owner`, 401)
        );
    }

    await Cat.remove()

    res.status(200).json({
        success: true,
        data: {}
    })

})

module.exports = {
    CreateCat,
    getAllCats,
    getOwnersCat,
    getCatById,
    deleteCat,
    updateCat
}