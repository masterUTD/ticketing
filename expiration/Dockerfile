FROM node:alpine

WORKDIR /app 

COPY package.json .

# just install production dependencies not developments dependencies
RUN npm install --omit=dev

# --only=prod  
# copy what is in  this directory  into the app directory WORKDIR ( one of the directories linux has)
COPY . . 

# command
CMD ["npm", "start"]