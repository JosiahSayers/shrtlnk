FROM cypress/browsers:node18.12.0-chrome106-ff106

WORKDIR /app
COPY . /app

RUN npm install
RUN npx prisma generate
