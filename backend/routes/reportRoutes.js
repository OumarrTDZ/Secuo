const express = require('express');
const { authUser } = require('../middleware/authMiddleware');
const { getReports, getReportById, updateReport } = require('../controllers/report.controller');

const router = express.Router();

// Obtener reportes:
// 🔒 Admins ven todos los reportes,
// 🔒 Propietarios solo los de sus espacios
router.get('/', authUser, getReports);

// Obtener detalle de un reporte:
// 🔒 Inquilino que reporta, propietario del espacio o admin pueden acceder
router.get('/:id', authUser, getReportById);

// Modificar reporte:
// 🔒 Solo el inquilino que creó el reporte puede actualizarlo
router.patch('/:id', authUser, updateReport);

module.exports = router;
