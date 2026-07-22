
function register(req,res){
    const user = {name:req.body.name,
        email:req.body.email,
        password:req.body.password,
    };
   global.users.push(user);
   global.user_id = user;
    return res.status(201).json({
   name: user.name,
   email: user.email
});
};

function logon(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = global.users.find((user) => {
        return user.email === email && user.password === password;
    });

    if (user) {
        global.user_id = user;

        return res.status(200).json({
            name: user.name,
            email: user.email
        });
    } else {
        //This line was before assignment reviewer check
        //return res.status(401).send();
        //After recommendations from AI Assignment Reviewer:
        return res.status(401).json({ 
            error: "Invalid email or password" 
        });
    }
}

function logoff(req,res) 
{
global.user_id=null;
//Before fixing with AI Assignment Reviewer
//return res.sendStatus(200);
//After fixing with AI Reviewer:
return res.status(200).json({ 
        message: "Logged off successfully" 
    });

};

module.exports={register,
logon,
logoff,};