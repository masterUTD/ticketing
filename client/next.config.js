module.exports= {
    webpackDevMiddleware: config => { // this file loads up whenever our nextjs project starts up ,, to make sure next reflects the changes we make to our code
        config.watchOptions.poll = 300;
        return config;
    
    }

}