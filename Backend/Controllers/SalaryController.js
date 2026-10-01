const salaryModel = require("../Models/SalaryModel");
const employeeModel = require("../Models/EmployeeModel");
const roleModel = require("../Models/RoleModel");

async function addSalary(req, res) {

    try {

        const salary = await salaryModel.addSalary(req.body);

        res.status(201).json({

            message: "Salary Added Successfully",
            salary: salary

        });

    }

    catch(err){

        res.status(500).json({

            message: err.message

        });

    }

}

async function getSalaries(req,res){

    try{

        const salaries = await salaryModel.getSalaries();

        res.json(salaries);

    }

    catch(err){

        res.status(500).json({

            message: err.message

        });

    }

}

async function getSalaryData(req, res) {
    try {
        const [employeeRecords, roles, allSalaries] = await Promise.all([
            employeeModel.getEmployees(),
            roleModel.getRoles(),
            salaryModel.getSalaries()
        ]);

        const employees = employeeRecords.map((employee) => ({
            EmployeeID: employee.EmployeeID,
            FullName: employee.FullName,
            RoleID: employee.RoleID,
            RoleName: employee.RoleName,
            DepartmentName: employee.DepartmentName,
            Experience: employee.Experience,
            Salary: employee.Salary
        }));
        const employeeId = Number(req.query.employeeId);
        const email = String(req.query.email || "").trim().toLowerCase();
        let salaries = allSalaries;

        if (Number.isInteger(employeeId) && employeeId > 0) {
            salaries = allSalaries.filter((salary) => Number(salary.EmployeeID) === employeeId);
        } else if (email) {
            salaries = allSalaries.filter((salary) => String(salary.email || "").toLowerCase() === email);
        }

        res.status(200).json({ employees, roles, salaries });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getSalariesByRoleId(req, res) {

    try {

        const salaries = await salaryModel.getSalariesByRoleId(req.params.roleId);

        res.json(salaries);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

async function getSalaryById(req,res){

    try{

        const salary = await salaryModel.getSalaryById(req.params.id);

        res.json(salary);

    }

    catch(err){

        res.status(500).json({

            message: err.message

        });

    }

}

async function getSalariesByEmployeeId(req, res) {

    try {

        const salaries = await salaryModel.getSalariesByEmployeeId(req.params.id);

        res.json(salaries);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

async function updateSalary(req,res){

    try{

        await salaryModel.updateSalary(req.params.id,req.body);

        res.json({

            message:"Salary Updated Successfully"

        });

    }

    catch(err){

        res.status(500).json({

            message: err.message

        });

    }

}

async function deleteSalary(req,res){

    try{

        await salaryModel.deleteSalary(req.params.id);

        res.json({

            message:"Salary Deleted Successfully"

        });

    }

    catch(err){

        res.status(500).json({

            message: err.message

        });

    }

}

module.exports={

addSalary,

getSalaries,

getSalaryData,

getSalariesByRoleId,

getSalaryById,

getSalariesByEmployeeId,

updateSalary,

deleteSalary

};