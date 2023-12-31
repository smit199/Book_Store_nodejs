const AppError = require("./../utils/appError");

const handleDBValidationError = (err, res) => {
    const errorMessage = Object.values(err.errors).map(item => res.__(item.message)).join('. ');
    return new AppError(errorMessage, 400);
}

const handleDBCastError = err => {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
}

const handleJWTError = err => {
    return new AppError('Invalid token! Please try again!', 401);
}

const handleJWTExpiredError = err => {
    return new AppError('Token has expired! Please login again!', 401);
}

const sendDevelopmentError = (err, res) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendProductionError = (err, res) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';

    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: res.__(err.status),
            message: res.__(err.message),
        });
    }
    else {
        console.log(err);
        res.status(500).json({
            status: res.__('error'),
            message: res.__('Programming error at server side!'),
        });
    }
}

exports.globalErrorHandler = (err, req, res, next) => {

    if(process.env.NODE_ENV === 'development') {
        sendDevelopmentError(err, res);
    }

    else if(process.env.NODE_ENV === 'production') {
        let error = err
        if(error.name === 'CastError')  error = handleDBCastError(error);
        if(error.name === 'ValidationError')   error = handleDBValidationError(error, res);
        if(error.name === 'JsonWebTokenError')  error = handleJWTError(error);
        if(error.name === 'TokenExpiredError')  error = handleJWTExpiredError(error);
        sendProductionError(error, res);
    }
}

exports.catchAsyncErrors = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}