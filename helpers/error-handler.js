function errorHandler(err, req, res, next) {
    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({
            message: "The user is not authorrized"
        })
    }
    if(err.name === 'ValdiationError'){
        return res.status(401).json({
            message: err
        })
    }

    return res.status(500).json({
        message: err,
    })
}

module.exports = errorHandler