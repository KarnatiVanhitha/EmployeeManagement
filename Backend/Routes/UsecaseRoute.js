const express = require('express');
const router = express.Router({ mergeParams: true });
const UseCaseController = require('../Controllers/UseCaseController');

// Handles POST /api/projects/usecases OR POST /api/projects/:projectId/usecases
router.post('/', UseCaseController.createUseCase);

// Handles GET /api/projects/usecases/project/:projectId OR GET /api/usecases/project/:projectId
router.get('/project/:projectId', UseCaseController.getUseCasesByProject);

module.exports = router;