const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

//protect route
exports.protect = asyncHandler(async(req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {

        token = req.headers.authorization.split(' ')[1];
    }
    // else if(req.cookies.token){
    // token = req.cookies.token;
    // }

    if (!token) {
        return next(new ErrorResponse('You are not Authorized for this route', 401));
    }

    //Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('You are not Authorized for this route', 401));

    }
});

//Grant Access to specific role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`Your Role as ${req.user.role} is not allowed to this route`, 403));

        }
        next();

    }
};