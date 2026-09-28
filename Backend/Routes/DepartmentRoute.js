const express=require("express");

const router=express.Router();

const departmentController =
require("../Controllers/DepartmentController");


router.get("/",departmentController.getDepartments);


module.exports=router;