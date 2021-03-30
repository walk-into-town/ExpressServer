"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionController = void 0;
const CloudfrontConnection_1 = require("./CloudfrontConnection");
class DistributionController {
    constructor() {
        this.cloudconn = CloudfrontConnection_1.CloudfrontConnection.getCloudfront();
    }
}
exports.DistributionController = DistributionController;
