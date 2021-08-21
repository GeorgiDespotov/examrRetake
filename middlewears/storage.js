const hoseServices = require('../services/house');


module.exports = () => (req, res, next) => {
    req.storage = {
        ...hoseServices
    };
    next();
};