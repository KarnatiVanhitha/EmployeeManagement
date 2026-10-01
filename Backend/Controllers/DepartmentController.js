const departmentModel = require("../Models/DepartmentModel");
const roleModel = require("../Models/RoleModel");

const getDepartments = async(req,res)=>{
    try{
        const departments = await departmentModel.getDepartments();
        res.status(200).json(departments);
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const getDepartmentRoles = async (req, res) => {
    try {
        const [departments, roles] = await Promise.all([
            departmentModel.getDepartments(),
            roleModel.getRoles()
        ]);
        res.status(200).json({ departments, roles });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports={
    getDepartments,
    getDepartmentRoles
};