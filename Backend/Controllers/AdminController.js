const SuperAdminModel = require("../Models/SuperadminModel");
const adminModel = require("../Models/AdminModel");

const login = async (req, res) => {

    try {

        const { Email, Password } = req.body;

        const SuperAdmin = await SuperAdminModel.login(Email, Password);

        if (SuperAdmin) {

            return res.status(200).json({

                message: "Super Admin Login Successful",

                role: "SuperAdmin",

                user: SuperAdmin

            });

        }

        const admin = await adminModel.login(Email, Password);

        if (admin) {
            if (String(admin.AdminType || '').toLowerCase() === "school") {
                return res.status(403).json({
                    message: "School access is temporarily disabled"
                });
            }

            return res.status(200).json({

                message: "Admin Login Successful",

                role:admin.AdminType,

                user: admin

            });

        }

        return res.status(401).json({

            message: "Invalid Email or Password"

        });

    }

    catch (err) {

        return res.status(500).json({

            message: err.message

        });

    }

};

const addAdmin = async (req, res) => {

    try {

        const existingAdmin = await adminModel.getAdminByEmail(req.body.Email);

        if (existingAdmin) {

            return res.status(400).json({

                message: "Email already exists."

            });

        }

        await adminModel.addAdmin(req.body);

        return res.status(201).json({

            message: "Admin Added Successfully"

        });

    }

    catch (err) {

        return res.status(500).json({

            message: err.message

        });

    }

};

const getAdmins = async (req, res) => {

    try {

        const admins = await adminModel.getAdmins();

        return res.status(200).json(admins);

    }

    catch (err) {

        return res.status(500).json({

            message: err.message

        });

    }

};

const getAdminById = async (req, res) => {

    try {

        const admin = await adminModel.getAdminById(req.params.id);

        return res.status(200).json(admin);

    }

    catch (err) {

        return res.status(500).json({

            message: err.message

        });

    }

};

const updateAdmin = async (req, res) => {

    try {

        await adminModel.updateAdmin(req.params.id, req.body);

        return res.status(200).json({

            message: "Admin Updated Successfully"

        });

    }

    catch (err) {

        return res.status(500).json({

            message: err.message

        });

    }

};

const deleteAdmin = async (req, res) => {

    try {

        await adminModel.deleteAdmin(req.params.id);

        return res.status(200).json({

            message: "Admin Deleted Successfully"

        });

    }

    catch (err) {

        return res.status(500).json({

            message: err.message

        });

    }

};

const verifyEmail = async (req, res) => {

    try {

        const { Email } = req.body;

        // Check Super Admin
        const SuperAdmin = await SuperAdminModel.getByEmail(Email);

        if (SuperAdmin) {

            return res.status(200).json({

                message: "Email verified successfully.",

                userType: "SuperAdmin"

            });

        }

        // Check Admin
        const admin = await adminModel.getAdminByEmail(Email);

        if (admin) {

            return res.status(200).json({

                message: "Email verified successfully.",

                userType: "Admin"

            });

        }

        return res.status(404).json({

            message: "Email not found."

        });

    }

    catch (err) {

        return res.status(500).json({

            message: err.message

        });

    }

};
const resetPassword = async (req, res) => {

    try {

        const { Email, NewPassword } = req.body;

        // Check Super Admin
        const SuperAdmin = await SuperAdminModel.getByEmail(Email);

        if (SuperAdmin) {

            await SuperAdminModel.updatePassword(Email, NewPassword);

            return res.status(200).json({

                message: "Super Admin password reset successfully."

            });

        }

        // Check Admin
        const admin = await adminModel.getAdminByEmail(Email);

        if (admin) {

            await adminModel.updatePassword(Email, NewPassword);

            return res.status(200).json({

                message: "Admin password reset successfully."

            });

        }

        return res.status(404).json({

            message: "Email not found."

        });

    }

    catch (err) {

        return res.status(500).json({

            message: err.message

        });

    }

};


module.exports = {

    login,

    addAdmin,

    getAdmins,

    getAdminById,

    updateAdmin,

    deleteAdmin,

    verifyEmail,

    resetPassword

};