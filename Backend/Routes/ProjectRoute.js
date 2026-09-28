const express = require("express");

const router = express.Router();

const projectController = require("../Controllers/ProjectController");

router.get("/managers", projectController.getManagers);

router.get("/", projectController.getProjects);

router.get("/:id", projectController.getProjectById);

router.get("/manager/:id", projectController.getProjectsByManagerId);

router.post("/", projectController.addProject);

router.put("/:id", projectController.updateProject);
router.put("/:id/manager", projectController.assignManager);

router.delete("/:id", projectController.deleteProject);

module.exports = router;