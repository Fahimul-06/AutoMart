import mongoose from 'mongoose';
const schema=new mongoose.Schema({_id:{type:String,default:'global'},annualInterestRate:{type:Number,min:0,max:50,default:10},bookingAmount:{type:Number,min:0,default:10000},currency:{type:String,default:'BDT'},paymentInstructions:{type:String,default:'Pay to the merchant account provided by the dealership and submit the transaction ID. We confirm payments manually.'},paymentMethods:{type:[String],default:['bKash','Nagad','Bank transfer']}},{timestamps:true});
export default mongoose.model('Settings',schema);
