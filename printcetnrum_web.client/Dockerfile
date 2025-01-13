# Step 1: Use Node.js for building the Angular app
FROM node:18.19 AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --force

# Copy Angular project files
COPY . .
RUN npm install --force
RUN npm run build
## Build Angular app for production
#RUN npm run build --prod
#
## Step 2: Use Nginx to serve the Angular app
#FROM nginx:1.21
#
## Copy the build output to Nginx's HTML directory
#COPY --from=build /app/dist/printcetnrum_web.client /usr/share/nginx/html
#
## Expose port 80
#EXPOSE 80
#
## Start Nginx
#CMD ["nginx", "-g", "daemon off;"]
