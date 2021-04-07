"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionController = void 0;
const CloudfrontConnection_1 = require("./CloudfrontConnection");
class DistributionController {
    constructor(res) {
        this.cloudconn = CloudfrontConnection_1.CloudfrontConnection.getCloudfront();
        this.res = res;
    }
    getDistributionConfig() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            console.log('start');
            try {
                const results = yield this.cloudconn.getDistributionConfig({ Id: 'E2TJXQ9T2CU6A3' }).promise();
                return results.DistributionConfig;
            }
            catch (err) {
                console.error(err);
            }
        });
        let respond = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield run();
            this.res.status(200).send(JSON.stringify(result, null, 2));
        });
        respond();
    }
    listDistributions() {
        var params = {};
        this.cloudconn.listDistributions(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            }
            else {
                data.DistributionList.Items.forEach((item) => console.log(JSON.stringify(item)));
            }
        });
    }
}
exports.DistributionController = DistributionController;
