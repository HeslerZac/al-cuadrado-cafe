# Base image
FROM node:20-alpine

# Install Chromium and dependencies for puppeteer
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start:prod"]
