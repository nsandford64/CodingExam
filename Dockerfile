# ======================
# STAGE 0
# In this stage we build the React client
# ======================
FROM node:16 as build-stage

WORKDIR /client 

COPY client/package*.json /client/

RUN npm install 

COPY client/ /client/

RUN npm run build 

# =====================
# STAGE 1 
# In this stage we build the express api server
#======================
FROM node:16 

COPY --from=build-stage /client/build/ /client/build/

WORKDIR /server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY server/package*.json /server/

RUN npm install 
# If production
# RUN npm ci --only=production 

# Bundle app source 
COPY server/ /server/

# Expose port and launch server 
EXPOSE 9000
CMD ["npm", "start"]