import { MongoMemoryServer } from 'mongodb-memory-server'; // run multiples instances fo db of mongo in memory between differenet services at the same time
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'


declare global { // to tell typescript that there's a global property(function) called signin
    var signin: () => string[]; // retorna un array de strings
}

jest.mock('../nats-wrapper.ts') // en vez de usar este directorio ( file ) me va a usar el de __mocks__ , all the different test inside of our entire project are going to use the mock version  , el archivo del mock tiene que tener el mismo nombre que el archivo original

let mongo: any

beforeAll(async () => {
    jest.clearAllMocks() // clearing all the mocks

    process.env.MI_JWT = 'secret'; // process.env.MI_JWT solo existe en mi pod of kubernetes cluster , asi que la estoy redefiniendo para mis tests

     mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri)

});


beforeEach(async () => {
    jest.clearAllMocks() // clearing all the mocks
    
    const collections = await mongoose.connection.db.collections();

    for(let collection of collections ) {
        await collection.deleteMany({})
    }

});


afterAll( async () =>  {
    await mongo.stop()
    await mongoose.connection.close();

})

global.signin =  () => { // this global function will be available in all my test files //  cause we declare it in the test setup files
    // build a JWT payload.  { email, id }
        const payload = {
            id: new mongoose.Types.ObjectId().toHexString(), // genera un diferente id cada vez que iniciamos session
            email: "master@gmail.com"
        
        }

    // create de jwt
        const TOKEN = jwt.sign(payload, process.env.MI_JWT!)


    // build session object. { jwt: MY_JWT}
        const session = { jwt: TOKEN };

    // turn that session into JSON
        const sessionJSON = JSON.stringify(session)
    
    //take JSON and encode it as base64
        const base64 = Buffer.from(sessionJSON).toString('base64')

    // return a string that's the cookie with the encoded data

    return [`session=${base64}`] // the expectation of supertest is to include all of the different cookies inside an array,, // just to make supertest happy 
}