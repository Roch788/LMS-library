const mongoose=require('mongoose');
const fineOneSettingSchema=new mongoose.Schema({
    amount:{
        type:Number,
        required:true,
    },
    interval:{
        type:String,
        default:"day",
    },
},{timestamps:true});

const FineOneSetting=mongoose.model('FineOneSetting',fineOneSettingSchema);
module.exports=FineOneSetting;