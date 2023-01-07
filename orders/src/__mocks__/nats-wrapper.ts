export const natsWrapper = { // this function is available for each one of our test  so we must clear all the mocks of this function ( setup.ts) , to no execute data from this test to get involved with other test that runs this function
    client: {
        publish:jest.fn().mockImplementation(( subject: string, data: string, callback: () => void) => { // fn ( function )
            callback()
        
        })
    }

}

// este archivo fake  tiene que tener el mismo nombre ( del archivo que le quiera hacer mock ) nats-Wrapper 