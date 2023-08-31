

#
# Builder
#

ARG PROJECT_DIR=/web

FROM node:12.11-stretch
ARG PROJECT_DIR
WORKDIR $PROJECT_DIR

ADD web/package-lock.json $PROJECT_DIR/package-lock.json
ADD web/package.json $PROJECT_DIR/package.json
ADD web/package-lock.json $PROJECT_DIR/package-lock.json

RUN npm config set registry http://registry.npmjs.org

# RUN npm cache verify
RUN npm install 


# ENV NODE_ENV=production


ADD /web/contracts $PROJECT_DIR/contracts
ADD /web/migrations $PROJECT_DIR/migrations
ADD /web/public $PROJECT_DIR/public
ADD /web/src $PROJECT_DIR/src
ADD /web/test $PROJECT_DIR/test
ADD /web/tsconfig.json $PROJECT_DIR/tsconfig.json
ADD /web/.env.development $PROJECT_DIR/.env.development


RUN npm run build-dev 
