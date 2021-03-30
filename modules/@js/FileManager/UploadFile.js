"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFile = void 0;
const S3Connection_1 = require("./S3Connection");
const multer_1 = __importDefault(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
const multer_s3_1 = __importDefault(require("multer-s3"));
var randstr = require('crypto-random-string');
class UploadFile {
    static test() {
        let getS3 = new S3Connection_1.S3Connection();
        let s3 = getS3.getS3();
        let storage = multer_s3_1.default({
            s3: s3,
            bucket: 'testbucket102345',
            acl: 'public-read',
            key: function (req, file, cb) {
                cb(null, Date.now() + '.' + file.originalname.split('.').pop());
            }
        });
        const upload = multer_1.default({
            storage: storage
        }, 'NONE');
        return upload;
    }
    static uploadFile() {
        return multer_1.default({ storage: UploadFile.storage });
    }
}
exports.UploadFile = UploadFile;
UploadFile.storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        let ext = `.${mime_types_1.default.extension(file.mimetype)}`;
        let filename = randstr({ length: 30 });
        cb(null, filename + ext);
    }
});
