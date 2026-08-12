const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const prisma = require("../db/prisma");


async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}
//REGISTER
exports.register=async(req,res,next)=>{
    if (!req.body) req.body = {};
    const { error, value } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
  return res.status(400).json({
    message: "Validation failed",
    details: error.details,
  });
}   
value.hashedPassword = await hashPassword(value.password);
delete value.password; // delete the raw password
const { name, email, hashedPassword } = value;
let user = null;
try {
        user = await prisma.user.create({
    data: { name, email, hashedPassword },
    select: { name: true, email: true, id: true} // specify the column values to return
  });
    } catch (err) {
        if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
            return res.status(400).json({
                message:"This email is already registered."
            });
        }
        return next(err); 
    }
global.user_id = user.id;
    return res.status(201).json({
   name: user.name,
   email: user.email
});
};

//LOGON 
exports.logon=async(req, res,next)=>{
    //const email = req.body.email;
    const email=req.body.email.toLowerCase();
    const password = req.body.password;
    const user = await prisma.user.findUnique({ 
        where: { email }
    });

    if (!user) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
    }
    
    const goodCredentials = await comparePassword(password,user.hashedPassword);

    if (!goodCredentials) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
    }
    global.user_id = user.id;
        return res.status(200).json({
            name: user.name,
            email: user.email
        });    
}

exports.logoff=(req,res)=>{
global.user_id=null;
return res.status(200).json({ 
        message: "Logged off successfully" 
    });

};

