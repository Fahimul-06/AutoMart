import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  vehicle: {type:mongoose.Schema.Types.ObjectId,ref:'Vehicle',required:true,index:true},
  customer: {type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  amount: {type:Number,required:true,min:1},
  attempt: {type:Number,required:true,min:1,max:3},
  financeType: {type:String,enum:['cash','loan'],required:true},
  downPaymentPercent: {type:Number,min:10,max:90,default:30},
  tenureYears: {type:Number,min:1,max:6,default:3},
  status: {type:String,enum:['pending','selected','expired','declined'],default:'pending'},
  selectedAt: {type:Date},
  paymentDeadline: {type:Date},
  booking: {type:mongoose.Schema.Types.ObjectId,ref:'Booking'}
},{timestamps:true});
schema.index({vehicle:1,customer:1,attempt:1},{unique:true});
schema.index({vehicle:1,status:1,createdAt:-1});
schema.index({customer:1,createdAt:-1});
export default mongoose.model('Offer',schema);
