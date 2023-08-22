FROM node:16

WORKDIR /app/
COPY ./src /app/src
COPY ./public /app/public
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./tsconfig.json /app/tsconfig.json
COPY ./.env.production /app/.env.production
COPY ./config-overrides.js /app/config-overrides.js
COPY ./jest.config.js /app/jest.config.js

RUN sed -i 's/http:\/\/excuse.ro:9672/https:\/\/dapps-certification.scdev.aws.iohkdev.io/g' package.json
RUN sed -i 's/http:\/\/localhost:3000/http:\/\/localhost:80/g'  package.json

RUN npm install --global serve
RUN npm install
RUN rm -rf ./.env

RUN npm run build

#remove all but build folder
RUN find . -maxdepth 1 ! -name 'build' ! -name '.' ! -name '..' -exec rm -rf {} +

COPY ./docker-files/start_web.sh .
RUN chmod +x ./start_web.sh

ENTRYPOINT [ "./start_web.sh" ]
