const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller.js');

// API Endpoint: POST /api/auth/login
router.post('/login', login);

module.exports = router;