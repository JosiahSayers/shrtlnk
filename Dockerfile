FROM cypress/browsers:node14.17.0-chrome91-ff89

WORKDIR /app
COPY . /app

RUN npm install
RUN npx prisma generate
