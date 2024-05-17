import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    imagePath: {
        type: String, 
        required: true
    }
});

const User = mongoose.model('User', userSchema);

export default User;
