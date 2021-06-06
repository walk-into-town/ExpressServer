"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendSort = exports.rankingSort = exports.campaignSort = void 0;
const campaignSort = function (campA, campB) {
    if (campA.name < campB.name) {
        return -1;
    }
    if (campA.name > campB.name) {
        return 1;
    }
    if (campA.name == campB.name) {
        return 0;
    }
};
exports.campaignSort = campaignSort;
const rankingSort = function (a, b) {
    if (a.cleared > b.cleared) {
        return -1;
    }
    if (a.cleared < b.cleared) {
        return 1;
    }
    if (a.cleared == b.cleared) {
        return 0;
    }
};
exports.rankingSort = rankingSort;
const recommendSort = function (a, b) {
    if (a.score > b.score) {
        return -1;
    }
    if (a.score < b.score) {
        return 1;
    }
    if (a.score == b.score) {
        return 0;
    }
};
exports.recommendSort = recommendSort;
