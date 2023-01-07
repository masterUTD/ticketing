import axios from 'axios'

// this function decide if it is executed on the server or on the browser

const buildClient = ({ req }) => {  // destructuring the first parameter of getInitialProps that has one property called req  // it has other many properties 
    if(typeof window === 'undefined') { // we are on the server 
        
        return axios.create({
              // name of the ingress-nginx service , name of the ingress-nginx namespace
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local', // requesting to the ingress-nginx 
            headers: req.headers // req.headers incluye el host: ticketing.dev // to tell ingress-nginx this will be the domain or host of the request
        
        });
    
    } else {
        return axios.create({ // we are on the browser
            baseURL: '/' 
            // the browser set the same domain and send any cookie related to this domain in the request  by default (https://ticketing.dev/api/users/currentuser)
        
        })
        
    
    }

};


export default buildClient;