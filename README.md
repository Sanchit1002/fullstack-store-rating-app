# 🏪 Full Stack Store Rating App

A comprehensive full-stack web application designed to streamline store management and rating with intuitive interfaces and role-based access control for Admins and Store Owners.

## 📱 **Screenshots**

### **Sign Up and Login Page**
![Sign Up](https://github.com/user-attachments/assets/da416a85-2186-4acc-9122-40c4b02f7666)
![Sign In](https://github.com/user-attachments/assets/5b3a0e81-8b2c-4247-b065-61dca0812c1e)

### **Admin Dashboard**
![Admin Dashboard](https://github.com/user-attachments/assets/d10090f6-6ee4-452f-92e0-047536acfd47)

![Admin Dashboard (User Section)](https://github.com/user-attachments/assets/608225b6-4d0a-430b-82dd-5238e35760df)

![Admin Dashboard (Store Section)](https://github.com/user-attachments/assets/74f52289-5c6a-41f3-905d-b7b1c4503aa8)

### **Admin Manage Users**
![Admin Manage Users](https://github.com/user-attachments/assets/9ebdb322-80b4-4739-a75b-33ba6012e311)

### **Admin Manage Stores**
![Admin Manage Stores](https://github.com/user-attachments/assets/d33d582c-ab5c-47b1-9963-097130dc148d)

### **User Dashboard**
![User Dashboard](https://github.com/user-attachments/assets/b3047eef-1104-4035-a37a-2949ac8c599d)
*User Rating History – Users can view the ratings they've previously given to stores for better tracking and engagement.*

### **Store Owner Dashboard**
![Store Owner Dashboard](https://github.com/user-attachments/assets/d7862fcf-a67f-4732-b588-f105862b45aa)
*Store Owner Dashboard – Enables store owners to view ratings and feedback submitted for their stores, providing valuable insights into performance and customer satisfaction.*

---
## 🌟 Key Highlights

### 👥 User Types
- **Admin**: Full control over the platform  
- **General User**: Explore and rate various stores  
- **Store Manager**: Oversee their store profiles and access performance insights  

### 🔐 Security & Authentication
- Secure login using **JWT tokens**  
- Passwords encrypted using **bcrypt**  
- **Rate limiting** to prevent abuse and spamming  
- **Input validation** and sanitization for safe data handling  

### 🏪 Store Features
- **Search** and **filter** stores with ease  
- View **detailed store information**  
- Submit **ratings and reviews**  
- **Multi-store support** for store managers  

### 🖥️ User Interface & Experience
- **Modern**, **responsive** user interface  
- **Light/Dark mode** toggle  
- **Real-time search** with debounce functionality  
- **Toast notifications** for user feedback  
- **Loading indicators** and **error handling** for smooth UX  

## 🛠️ **Tech Stack**

| **Category** | **Technology**     | **Purpose**                    |
| ------------ | ------------------ | ------------------------------ |
| **Frontend** | React.js           | UI framework                   |
|              | React Router       | Client-side routing/navigation |
|              | Tailwind CSS       | Styling                        |
|              | React Hook Form    | Form handling                  |
|              | Lucide React       | Icons                          |

| **Backend**  | Node.js            | Runtime environment            |
|              | Express.js         | Web framework                  |
|              | PostgreSQL         | Relational database            |
|              | JWT                | Authentication (token-based)   |
|              | bcryptjs           | Password hashing               |
|              | express-validator  | Input validation               |


## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-rating-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Database Setup**
   ```bash
   # Login to MySQL
   mysql -u root -p
   
   # Create database
   CREATE DATABASE store_rating_system;
   
   # Run the database setup script
   node setup-database.js
   ```

4. **Start the Application**
   ```bash
   # Start backend server (Terminal 1)
   npm run server
   
   # Start frontend (Terminal 2)
   cd client
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔄 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### **Admin Routes**
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stores` - Get all stores
- `POST /api/admin/stores` - Create store
- `PUT /api/admin/stores/:id` - Update store
- `DELETE /api/admin/stores/:id` - Delete store

### **Store Routes**
- `GET /api/stores` - Get all stores (public)
- `GET /api/stores/my-store` - Get owner's stores
- `PUT /api/stores/my-store/:id` - Update store
- `POST /api/stores/:id/rate` - Rate a store

### **User Routes**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

## 🎯 **Key Features Implemented**

### **Admin Panel**
- ✅ User management (CRUD operations)
- ✅ Store management (CRUD operations)
- ✅ Advanced search and filtering
- ✅ Store rating display for store owners

### **Store Owner Dashboard**
- ✅ Multi-store management
- ✅ Real-time rating analytics
- ✅ Review management
- ✅ Store information editing

### **User Experience**
- ✅ Responsive design
- ✅ Light/Dark mode
- ✅ Debounced search
- ✅ Form validations
- ✅ Error handling

## 🔒 **Security Features**

- Password hashing with salt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers

## 🚀 **Local Development & Deployment**

### **Quick Start**
```bash
# Install dependencies
npm run install-all

# Setup database
npm run setup

# Start development server
npm run dev
```

### **Production Build**
```bash
# Build frontend for production
npm run build

# Start production server
npm run server
```

