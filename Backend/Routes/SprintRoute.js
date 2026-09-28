const express = require('express');

const router = express.Router();

const SprintController =
    require('../Controllers/SprintController');


router.post(
    '/',
    SprintController.createSprint
);


router.get(
    '/project/:projectId',
    SprintController.getSprintsByProject
);


module.exports = router;