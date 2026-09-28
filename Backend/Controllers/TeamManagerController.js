const managerModel = require("../Models/TeamManagerModels");

// Get All
exports.getManagers = async (req, res) => {

    try {

        const managers = await managerModel.getManagers();

        res.json(managers);

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}

// Get By Id
exports.getManagerById = async (req, res) => {

    try {

        const manager = await managerModel.getManagerById(req.params.id);

        if (!manager) {
            return res.status(404).json({
                message: "Manager not found"
            });
        }

        res.status(200).json(manager);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Add
exports.addManager = async (req, res) => {

    try {

        await managerModel.addManager(req.body);

        res.status(201).json({
            message: "Manager added successfully."
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Update
exports.updateManager = async (req, res) => {

    try {

        await managerModel.updateManager(req.params.id, req.body);

        res.status(200).json({
            message: "Manager updated successfully."
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Delete
exports.deleteManager = async (req, res) => {

    try {

        await managerModel.deleteManager(req.params.id);

        res.status(200).json({
            message: "Manager deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};