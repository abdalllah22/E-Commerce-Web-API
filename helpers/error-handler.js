function errorHandler(err, req, res, next) {
    if(err.name === 'UnauthorizedError'){
        res.status(401).json({
            message: "The user is not authorrized"
        })
    }
    if(err.name === 'ValdiationError'){
        res.status(401).json({
            message: err
        })
    }

    return res.status(500).json({
        message: err,
    })
}

module.exports = errorHandler