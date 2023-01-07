import mongoose from 'mongoose'
import { Password } from '../services/password'
// an interface that descibes the peoperties that are required to create a User object

interface UserAttrs {
    email: string;
    password: string;
}

// an interface that describes the properties that a User model has

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;

}

// an interface that describes the properties that a User document has

interface UserDoc extends mongoose.Document {
    email: string;
    password: string;

}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }

}, { 
    toJSON: {
        transform(doc, ret) { 
            ret.id = ret._id
            delete ret._id
            delete ret.password
            delete ret.__v

        }

    }

});

// run this middleware
userSchema.pre('save', async function(done) { // we use done, cause mongoose does not really have great support out of the box for async await syntax  
    // just if we have modified the password , works also in the first try , i mean when i am saving the user for the first time
   // if we just modified the email this if doesn't hash the password that is already hashed
    if(this.isModified('password')) { // to check if we've modified the password
        const hashed = await Password.toHash(this.get('password'))  // the password that we just set on the user document   
        this.set('password', hashed)
    }

    done() // cause we've now done all the asynchronous work we need to do

});

userSchema.statics.build = (attrs: UserAttrs) => { // adding an extra property function to my schema
    return new User(attrs);

}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema); // UserDoc, UserModel are like type arguments to the model function
// UserModel is the type of mongoose.model is going to return


export { User };