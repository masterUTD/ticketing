import nats, { Stan } from 'node-nats-streaming'

// this is a singleton implementation
class NatsWrapper {
    private _client?: Stan;

    get client() { // assigning a getter to this class
        if(!this._client) { // si todavia no se ha connectado nats // si no hemos llamado la funcion connect
            throw new Error('cannot access NATS client before connecting')
            // me tira un error si todavia no estoy conectado  a nats osea si this._client es undefined
        }

        return this._client
    }

    connect(clusterId: string, clientId: string, url: string)/* : Promise<void> */ {
        this._client = nats.connect(clusterId, clientId, { url }) // to this point  the getter client  must have already the value of the this._client that the getter client is returning
          
        return new Promise<void>( (resolve, reject) => {
        
            this.client.on('connect', () => { // this.client is the getter
                console.log('connected to NATS')
                resolve()
            })


            
            this.client.on('error', (err) => { // fail to connect
                reject(err)
            
            })
        })
        
    
    }


}

export const natsWrapper = new NatsWrapper()

