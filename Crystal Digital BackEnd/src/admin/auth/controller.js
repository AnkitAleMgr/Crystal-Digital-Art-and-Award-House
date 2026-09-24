import { AdminModel } from "./model.js";

export const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email and password are required",
      });
    }

    // Check if email already exists
    const isEmail = await AdminModel.findOne({
      email: email.toLowerCase(),
    });

    if (isEmail) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    // Create admin
    const newUser = await AdminModel.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      status: true,
      message: "Admin registered successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = {};

      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });

      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors,
      });
    }

    // Duplicate MongoDB key error
    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    // Unexpected error
    console.error("Admin registration error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const adminLogin=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email && !password){
            return res.status(404).json({status:false,message:"emain and password are required"});
        }
        
        const isUser=await AdminModel.findOne({email:email});

        if(!isUser){
            return res.status(400).json({status:false,message:"Invalid credentials"});
        }


        const isPasswordMathed=await isUser.comparePassword(password);

        if(!isPasswordMathed){
            return res.status(400).json({status:false,message:"Invalid credentials"});
        }

        const token=await isUser.generateToken();

        res.status(201).json({status:true,token:token, user:isUser});

    } catch (error) {
        
    }
}