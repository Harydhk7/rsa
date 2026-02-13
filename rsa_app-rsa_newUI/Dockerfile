FROM node:18-alpine as build

ARG REACT_APP_API_URL=http://localhost:5000/
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
