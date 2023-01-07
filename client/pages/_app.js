import 'bootstrap/dist/css/bootstrap.css';
import './style.css'
import buildClient from '../api/build-client'
import Header from '../components/header'

const AppComponent =  ({Component, pageProps, currentUser}) => {  // _app is a custom Component that handles or render all our pages , // we cannot use _app if we do not want to
    return (

        <div>
            <Header currentUser = {currentUser}/>
            <div className = "container">
                <Component currentUser = { currentUser } {...pageProps} />

            </div>

        </div>

        
        )
   

};


AppComponent.getInitialProps = async (appContext) => {

    const client = buildClient(appContext.ctx)

    const { data } = await  client.get('/api/users/currentuser'); //  'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser' // to proceed  with the corresponding path of the host ticketing.dev in the ingress-srv.yaml file
    // le concatena la url: /api/users/currentuser  al baseURL

    let pageProps = {}

    if(appContext.Component.getInitialProps) { // manually invoking the initialProps of the child components ( just execute if the childs components  have the itialProps defined) 
    
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
    
    }


    console.log(data)

    return {
        pageProps, //pageProps es el resultado de llamado de getInitialProps de los componentes ( si es que tienen definido el getInitialProps)
        ...data // = { currentUser:  null or { id: jdjjdjjdjd, email: jhdhhdhd@gmail.com }  } get passed a prop to the component
    } 
    
    
    // currentuser property comes from the response of the auth-srv 

    // ejecutando dos getInitialProps 
}

export default AppComponent;


// response.data returns a currentUser property which get passed to the component

// this function will be executed on the server , nextjs call this function while building our application

