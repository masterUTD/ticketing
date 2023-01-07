import mongoose from 'mongoose';
import { app } from './app'

const start = async () => {

    if(!process.env.MI_JWT) {
        throw new Error('JWT iS NOT DEFINED')
    }

    if(!process.env.MONGO_URI) {
        throw new Error('MONGO URI IS NOT DEFINED')
    }

 try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to Mongodb')

} catch(err) {
    console.error(err)
}

app.listen(3000, () => {
    console.log('listening on port 3000!!!');
});
    
}


start()
