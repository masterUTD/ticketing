import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'


const scryptAsync = promisify(scrypt)

export class Password {
    static async toHash(password: string) {
        const salt = randomBytes(8).toString('hex')
        const buffer = (await  scryptAsync(password, salt, 64)) as Buffer // so typescript can know the type of the const buffer
        
        return `${buffer.toString('hex')}.${salt}` // returning the hashed password and after the dot  the salt

    }

    static async compare(storedPassword: string, suppliedPassword: string) {
        const [ hashedPassword, salt] = storedPassword.split('.') // return an array with the hashedpassword and the salt
        const buffer = (await  scryptAsync(suppliedPassword, salt, 64)) as Buffer 

        return buffer.toString('hex') === hashedPassword
    }

}


