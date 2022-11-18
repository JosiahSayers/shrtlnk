FROM cypress/browsers:node16.17.0-chrome106

WORKDIR /app
COPY . /app

RUN npm install
RUN npx prisma generate
