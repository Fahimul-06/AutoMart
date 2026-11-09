import mongoose from 'mongoose';
const schema = new mongoose.Schema({name:{type:String,required:true,trim:true,maxlength:100},email:{type:String,required:true,lowercase:true,trim:true,unique:true},passwordHash:{type:String,required:true,select:false},phone:{type:String,trim:true,default:''},role:{type:String,enum:['customer','admin'],default:'customer'}},{timestamps:true});
export default mongoose.model('User',schema);
