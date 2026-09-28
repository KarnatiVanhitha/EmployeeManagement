const departmentModel = require("../Models/DepartmentModel");


const getDepartments = async(req,res)=>{

    try{

        const departments =
        await departmentModel.getDepartments();


        res.status(200).json(departments);


    }
    catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};


module.exports={
    getDepartments
};