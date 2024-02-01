import { constants } from "../constants.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = res ? (res.statusCode ? res.statusCode : 500) : 500;
    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            res.json({ title: "Bad Request", message: err.message, stackTrace: err.stack });
            break;
        case constants.UNATHORIZED:
            res.json({ title: "Unathorized", message: err.message, stackTrace: err.stack });
            break;
        case constants.FORBIDDEN:
            res.json({ title: "Forbidden", message: err.message, stackTrace: err.stack });
            break;
        case constants.NOT_FOUND:
            res.json({ title: "Not Found", message: err.message, stackTrace: err.stack });
            break;
        case constants.SERVER_ERROR:
            res.json({ title: "Server Error", message: err.message, stackTrace: err.stack });
            break;
        default:
            break;
    }
};

export default errorHandler;
