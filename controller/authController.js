const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');


//@desc   Register users
//route POST /api/v1/auth/register
// Access Public

const register = asyncHandler(async(req, res, next) => {
    const { name, email, password, address, role } = req.body;
    //Create User
    const user = await User.create({
        name,
        email,
        password,
        address,
        role
    });

    // Create Token 
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, user, token: token });
    // sendTokenResponse(user, 200, res);

});





//@desc   Login users
//route POST /api/v1/auth/login
// Access Public

const login = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;

    // Validate emil & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }
    const token = user.getSignedJwtToken();

    // sendTokenResponse(user, 200, res);
    res.status(200).json({
        message: 'successfully logged in',
        user,
        token
    })
});


//Get token from Model Create cookie and send response
const sendTokenResponse = (user, statuscode, res) => {
    // Create Token 
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true

    }
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statuscode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });

};

//@desc  Get Current Loggedin users
//route POST /api/v1/auth/me
// Access Private

const getMe = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
});



//@desc  LogOut users // clear cookies
//@route POST /api/v1/auth/logout
//@Access Private

const logout = asyncHandler(async(req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date.now() + 10 * 1000,
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: "successfully logout!"
    });
});

//@desc  Forgot Password
//route POST /api/v1/auth/forgotpassword
// Access Public

const forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorResponse('There is no user with this email !', 404))
    }

    //Get reset token from User model
    const resetToken = user.getResetPasswordToken();
    // console.log(resetToken);


    // include hash password and hashed pass expired into DB since it called on Schema
    await user.save({ validateBeforeSave: true });

    //Create reset Url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this message because you (or someone ) made a request for reset poassword
    Please make a put request to : \n\n ${resetUrl}`;

    // Call sendEmail from utill
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message: message
        });
        res.status(200).json({
            success: true,
            data: 'Email Sent'
        });
    } catch (err) {
        // console.log(err);
        user.getResetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('oop! Password reset Email could not be sent', 500))

    }
    res.status(200).json({
        success: true,
        data: user
    });
});


//@desc  Reset Password
//route PUT /api/v1/auth/resetpassword/:resettoken
// Access Public

const resetPassword = asyncHandler(async(req, res, next) => {
    //Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    };

    //Set new Password from the user
    user.password = req.body.password;
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);

});


//@desc  Update  users details 
//@route PUT /api/v1/auth/updatedetails
//@Access Private

const updateDetails = asyncHandler(async(req, res, next) => {

    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: user
    });
});

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    updateDetails,
    logout,
    getMe
}