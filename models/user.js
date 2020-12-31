const mongoose=require('mongoose')

const user_schema=mongoose.Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
},
{collections:"users"}
)

const model=mongoose.model('user',user_schema)

module.exports=model;