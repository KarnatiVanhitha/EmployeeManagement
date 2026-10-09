const employeeModel = require("../Models/EmployeeModel");
const managerModel = require("../Models/TeamManagerModels");
const roleModel = require("../Models/RoleModel");
const salaryModel = require("../Models/SalaryModel");
const { createAuthToken } = require("../utils/authTokens");

function isDesideaEmail(email) {
    return /^[^\s@]+@desidea\.com$/i.test(String(email || '').trim());
}

async function getEmployees(req, res) {
    try {
        const employees = await employeeModel.getEmployees();
        res.json(employees);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getPromotions(req, res) {
    try {
        const promotions = await employeeModel.getPromotions();
        res.json(promotions);
    } catch (err) {
        console.error("Error fetching employee promotions:", err);
        res.status(500).json({
            message: err.message
        });
    }
}

async function addEmployee(req, res) {
    try {
        if (!isDesideaEmail(req.body.Email)) {
            return res.status(400).json({
                message: "Employee email must use the @desidea.com domain"
            });
        }

        // Insert employee
        const employee = await employeeModel.addEmployee(req.body);

        // Get Role
        const role = await roleModel.getRoleById(req.body.RoleID);
        console.log(req.body);

        // Manager Check — only actual manager roles trigger the Add Team Manager popup
        let isManager = 0;

        if (role) {
            const roleName = String(role.RoleName || '').toLowerCase().trim();
            const isTeamLead = roleName.includes('team lead') || roleName.includes('lead') || roleName === 'teamlead';

            if (!isTeamLead && (roleName.includes('manager') || roleName === 'admin' || roleName === 'product owner')) {
                isManager = 1;
            }
        }

        // Auto-create initial salary record for the new employee
        try {
            const basicSalary = parseFloat(req.body.Salary) || 0;
            const experience = parseFloat(req.body.Experience) || 0;

            // Determine hike percentage based on experience (years)
            let hikePercentage = 0;
            if (experience < 1) hikePercentage = 2;
            else if (experience < 3) hikePercentage = 5;
            else if (experience < 5) hikePercentage = 10;
            else if (experience < 10) hikePercentage = 15;
            else hikePercentage = 20;

            const hikeAmount = +(basicSalary * (hikePercentage / 100)).toFixed(2);

            // Bonus proportional to experience, capped at 20% of basic salary
            const bonusPercentage = Math.min(experience * 0.01, 0.20);
            const bonus = +(basicSalary * bonusPercentage).toFixed(2);

            const salaryRecord = {
                EmployeeID: employee.EmployeeID,
                BasicSalary: basicSalary,
                Allowances: 0.00,
                Bonus: bonus,
                Deductions: 0.00,
                ExperienceYears: experience,
                HikePercentage: hikePercentage,
                HikeAmount: hikeAmount,
                SalaryMonth: new Date(),
                PaymentDate: null,
                PaymentStatus: "Pending"
            };

            const createdSalary = await salaryModel.addSalary(salaryRecord);
            // attach created salary to response
            employee.initialSalary = createdSalary;
        } catch (errSalary) {
            console.error("Failed to create salary record:", errSalary.message || errSalary);
        }

        res.status(201).json({

            message: "Employee Added Successfully",

            employee: employee,

            isManager: isManager

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

async function registerEmployeeAccount(req, res) {
    try {
        const { FullName, Email: submittedEmail, Password } = req.body || {};
        const Email = String(submittedEmail || '').trim();

        if (typeof FullName !== 'string' || !FullName.trim()) {
            return res.status(400).json({ message: "Full name is required" });
        }
        if (!isDesideaEmail(Email)) {
            return res.status(400).json({
                message: "Employee email must use the @desidea.com domain"
            });
        }
        if (typeof Password !== 'string' || Password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const existingEmployee = await employeeModel.getEmployeeByEmail(Email);
        if (existingEmployee) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        const employee = await employeeModel.registerEmployeeAccount({
            FullName: FullName.trim(),
            Email,
            Password
        });

        return res.status(201).json({
            message: "Employee account created successfully",
            employee
        });
    } catch (err) {
        console.error("Employee signup failed:", err);
        if (err.number === 2601 || err.number === 2627) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }
        return res.status(500).json({
            message: "Unable to create your account. Please try again or contact support."
        });
    }
}

async function getEmployeeById(req, res) {

    try {

        const employee = await employeeModel.getEmployeeById(req.params.id);

        res.json(employee);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}
// GET ONLY MANAGERS WITH THEIR DEPARTMENTS
async function getManagers(req, res) {
    try {

        const managers = await employeeModel.getManagers();

        res.status(200).json(managers);

    } catch (err) {

        console.error(
            "Error fetching managers:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
}

// DELETE
async function deleteEmployee(req, res) {
    try {

        const id = req.params.id;

        await employeeModel.deleteEmployee(id);

        res.json({
            message: "Employee Deleted Successfully"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}
async function updateEmployee(req, res) {

    try {
        if (!isDesideaEmail(req.body.Email)) {
            return res.status(400).json({
                message: "Employee email must use the @desidea.com domain"
            });
        }

        const id = req.params.id;

        await employeeModel.updateEmployee(id, req.body);

        res.json({
            message: "Employee Updated Successfully"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}
async function login(req, res) {
    try {
        const { Email, Password } = req.body;

        if (!isDesideaEmail(Email)) {
            return res.status(401).json({
                message: "Only @desidea.com employee accounts can sign in"
            });
        }

        const employee = await employeeModel.login(Email, Password);

        if (!employee) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        return res.status(200).json({
            message: "Login Successful",
            role: employee.RoleName,
            user: employee,
            token: createAuthToken({
                email: employee.Email || Email,
                role: employee.RoleName,
                name: employee.FullName
            })
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
}
const verifyEmail = async (req, res) => {

    try {

        const { Email } = req.body;

        const employee = await employeeModel.getEmployeeByEmail(Email);

        if (!employee) {

            return res.status(404).json({

                message: "Email not found."

            });

        }

        res.status(200).json({

            message: "Email verified successfully."

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

const resetPassword = async (req, res) => {

    try {

        const { Email, NewPassword } = req.body;

        const employee = await employeeModel.getEmployeeByEmail(Email);

        if (!employee) {

            return res.status(404).json({
                message: "Email not found."
            });

        }

       await employeeModel.updatePassword(Email, NewPassword);

        return res.status(200).json({
            message: "Password reset successfully."
        });

    }
    catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

}
module.exports = {
    getEmployees,
    getPromotions,
    addEmployee,
    registerEmployeeAccount,
    deleteEmployee,
    getEmployeeById,
    updateEmployee,
    login,
    verifyEmail,
    resetPassword,
    getManagers
};