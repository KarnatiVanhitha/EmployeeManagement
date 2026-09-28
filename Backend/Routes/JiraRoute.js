const express = require('express');
const router = express.Router();
const jiraController = require('../Controllers/JiraController');

// Projects
router.get('/projects', jiraController.getProjects);
router.get('/projects/:idOrKey', jiraController.getProjectById);
router.get('/issue-types', jiraController.getIssueTypes);

// Confluence Spaces
router.get('/spaces', jiraController.getSpaces);

// Sprints
router.get('/boards', jiraController.getBoards);
router.get('/sprints', jiraController.getSprints);

// Issues
router.get('/issues', jiraController.getIssues);
router.get('/issues/search', jiraController.getIssues);
router.post('/issues/search', jiraController.getIssues);
router.get('/issues/:issueIdOrKey', jiraController.getIssueById);
router.post('/issues', jiraController.createIssue);
router.put('/issues/:issueIdOrKey', jiraController.updateIssue);
router.delete('/issues/:issueIdOrKey', jiraController.deleteIssue);

// Users / Profile
router.get('/myself', jiraController.getMyself);
router.get('/users/assignable', jiraController.getAssignableUsers);

module.exports = router;
