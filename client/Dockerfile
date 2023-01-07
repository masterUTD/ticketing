FROM node:alpine

WORKDIR /app 

#copying the package.json into the WORKDIR
COPY package.json . 

# the dot indicates the WORKDIR /app

# just install production dependencies not developments dependencies
RUN npm install --omit=dev

# --only=prod  
# copy what is in  this directory  into the app directory WORKDIR /app ( one of the directories linux has)
COPY . . 

# command
CMD ["npm", "run", "dev"]