import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from '../common/index.js';
import db from "../models/index.js";
import { 
    default_delete_status, lfr_header_key, lfr_header_token, tag_internal_api_key, tag_root, 
} from "../config/config.js";

dotenv.config();

const { secret } = process.env;

const { verify } = jwt;

const API_KEYS = db.api_keys;

const verifyKey = (req, res, next) => {
    const key = req.headers[lfr_header_key] || req.query.key || req.body.key || '';
    if (!key) {
        ForbiddenError(res, "No key provided!", null);
    } else {
        req.API_KEY = key;
        next();
    }
};

const isRootKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_root,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_root} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

const isInternalKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_internal_api_key,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_internal_api_key} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

export default { verifyKey, isRootKey, isInternalKey };