"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uControllers_1 = require("../controllers/uControllers");
const router = (0, express_1.Router)();
router.get("/:portfolioUrl", uControllers_1.getUPortfolio);
exports.default = router;
