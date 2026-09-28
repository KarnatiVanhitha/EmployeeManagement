const roleModel = require("../Models/RoleModel");

async function getRoles(req, res) {
    try {
        const roles = await roleModel.getRoles();
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getRolesByDepartment(req, res) {
    try {
        const departmentId = parseInt(req.params.id, 10);
        const roles = await roleModel.getRolesByDepartment(departmentId);
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

module.exports = {
    getRoles,
    getRolesByDepartment
};