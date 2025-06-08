const errorHandle =(err,req,res,next)=>{
    const status = err.status || 500;
    const msg = err.message || "Backend Error";

    return res.status(status).json({ message:msg });
};
module.exports = errorHandle;