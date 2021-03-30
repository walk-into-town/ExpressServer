"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFile = void 0;
const S3Connection_1 = require("./S3Connection");
const multer = __importStar(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
let multerS3 = require('multer-s3');
class UploadFile {
    static test() {
        let getS3 = new S3Connection_1.S3Connection();
        let s3 = getS3.getS3(); //S3Connection클래스에서 S3 객체를 획득
        let storage = multerS3({
            s3: s3,
            bucket: 'testbucket102345',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                cb(null, Date.now() + '.' + file.originalname.split('.').pop());
            }
        });
        const upload = multer.default({
            storage: storage
        });
        return upload;
    }
    static uploadFile() {
        return multer.default({ storage: UploadFile.storage });
    }
}
exports.UploadFile = UploadFile;
UploadFile.storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        let ext = `.${mime_types_1.default.extension(file.mimetype)}`; //file.mimetype을 통해 mimeType을 얻어내고 mime-types모듈의 extension을 통해 확장자명 지정
        let filename = crypto_random_string_1.default({ length: 30 }); //crypto-random-string을 통해 무작위 이름 생성
        cb(null, filename + ext);
    }
});
