const salaryModel = require("../Models/SalaryModel");

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

getSalariesByRoleId,

getSalaryById,

getSalariesByEmployeeId,

updateSalary,

deleteSalary

};