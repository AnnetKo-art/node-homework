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

try {
        const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
    data: { name, email, hashedPassword },
    select: { name: true, email: true, id: true, createdAt: true} 
  });
// Create 3 welcome tasks using createMany
      const welcomeTaskData = [
        { title: "Complete your profile", userId: newUser.id, priority: "medium" },
        { title: "Add your first task", userId: newUser.id, priority: "high" },
        { title: "Explore the app", userId: newUser.id, priority: "low" }
      ];

    await tx.task.createMany({ data: welcomeTaskData });
    const welcomeTasks = await tx.task.findMany({
        where: {
          userId: newUser.id,
          title: { in: welcomeTaskData.map(t => t.title) }
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
          userId: true,
          priority: true
        }
      });

      return { user: newUser, welcomeTasks };
    });
    global.user_id = result.user.id;
    return res.status(201).json({
    user: result.user,
    welcomeTasks: result.welcomeTasks,
    transactionStatus: "success"
});
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(400).json({
                message:"This email is already registered."
            });
        }
        return next(err); 
    }

};

//LOGON 
exports.logon=async(req, res,next)=>{
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ 
            message: "Email and password are required" 
        });
    }
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

// SHOW (Optional Stretch Goal)
exports.show = async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      Task: {
        where: { isCompleted: false },
        select: { 
           id: true, 
           title: true, 
           priority: true, 
          createdAt: true 
         },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
};
