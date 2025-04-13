# Giai đoạn build app React
FROM node:18-alpine as build

# Tạo thư mục và copy source vào
WORKDIR /app
COPY . .

# Cài dependencies và build project
RUN npm install && npm run build

# Giai đoạn chạy production bằng Nginx
FROM nginx:1.23-alpine

# Copy file cấu hình nginx nếu có (nếu không có thì dùng mặc định)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy file build từ giai đoạn build vào thư mục phục vụ của Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Mở cổng 80
EXPOSE 80

# Khởi chạy nginx
CMD ["nginx", "-g", "daemon off;"]
