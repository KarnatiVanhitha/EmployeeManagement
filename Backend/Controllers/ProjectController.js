const projectModel = require("../Models/ProjectModel");

function isProjectManager(role) {
    if (!role) return true;
    if (typeof role === 'object') {
        role = role.RoleName || role.roleName || role.Role || role.role || '';
    }
    const cleanRole = String(role).trim().toLowerCase();
    return (
        cleanRole === 'project manager' ||
        cleanRole.includes('project manager') ||
        cleanRole === 'admin' ||
        cleanRole === 'manager' ||
        cleanRole === 'scrum master'
    );
}

async function addProject(req, res) {
    try {
        const userRole = req.body.userRole || req.body.role || req.body.Role || req.headers['x-user-role'] || req.headers['role'];
        
        if (userRole && !isProjectManager(userRole)) {
            return res.status(403).json({
                message: "Access Denied: Only Project Managers can create projects"
            });
        }
        
        const project = await projectModel.addProject(req.body);
        res.status(201).json({
            message: "Project Created Successfully",
            project
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getProjects(req, res) {
    try {
        const projects = await projectModel.getProjects();
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getProjectById(req, res) {
    try {
        const projectId = Number(req.params.id);
        const project = await projectModel.getProjectById(projectId);
        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getProjectsByManagerId(req, res) {
    try {
        const managerId = Number(req.params.id);
        const projects = await projectModel.getProjectsByManagerId(managerId);
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function updateProject(req, res) {
    try {
        const userRole = req.body.userRole || req.body.role || req.body.Role || req.headers['x-user-role'] || req.headers['role'];
        
        if (userRole && !isProjectManager(userRole)) {
            return res.status(403).json({
                message: "Access Denied: Only Project Managers can update projects"
            });
        }
        
        const projectId = Number(req.params.id);
        const project = await projectModel.updateProject(projectId, req.body);
        res.status(200).json({
            message: "Project Updated Successfully",
            project
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function assignManager(req, res) {
    try {
        const projectId = Number(req.params.id);
        const managerId = Number(req.body.ManagerID ?? req.body.managerId);
        
        if (!projectId || isNaN(projectId)) {
            return res.status(400).json({
                message: "Invalid Project ID"
            });
        }

        if (!managerId || isNaN(managerId)) {
            return res.status(400).json({
                message: "Valid ManagerID is required"
            });
        }

        const project = await projectModel.assignManager(projectId, managerId);
        res.status(200).json({
            message: "Manager Assigned Successfully",
            project
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function deleteProject(req, res) {
    try {
        const projectId = Number(req.params.id);
        await projectModel.deleteProject(projectId);
        res.status(200).json({
            message: "Project Deleted Successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getManagers(req, res) {
    try {
        const managers = await projectModel.getManagers();
        res.status(200).json(managers);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

module.exports = {
    addProject,
    getProjects,
    getProjectById,
    getProjectsByManagerId,
    updateProject,
    assignManager,
    deleteProject,
    getManagers
};
