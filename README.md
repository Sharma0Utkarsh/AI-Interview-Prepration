AI Prep Interview

📸 Profile Photo Upload with Express & React

This project demonstrates how to implement a profile photo upload feature using Express.js for the backend and React for the frontend. It covers user registration, login, and profile management, including the ability to upload and display profile images.

🚀 Features

-User Registration: Users can create an account by providing their name, email, password, and profile photo.
-User Login: Registered users can log in to access their profile.
-Profile Management: Users can view and update their profile, including uploading a new profile photo.
-Image Upload: Utilizes Multer for handling image uploads on the server.


🛠️ Technologies Used

-Backend: Express.js, Multer, bcryptjs, JWT
-Frontend: React, React Router DOM
-Database: MongoDB (via Mongoose)
-Authentication: JWT-based token authentication

📁 Project Structure
/client
  /src
    /components
      ProfileInfoCard.js
      ProfileForm.js
    App.js
    index.js
/server
  /controllers
    authController.js
  /models
    User.js
  /routes
    authRoutes.js
  /middleware
    upload.js
  app.js
  config.js
  .env
  package.json
README.md

🧪 Installation & Setup
Backend (Server)

1. Clone the repository:

git clone https://github.com/yourusername/profile-photo-upload.git
cd profile-photo-upload/server


2. Install dependencies:

npm install

3. Set up environment variables:
Create a .env file in the root of the /server directory.
Add the following variables:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

4. Start the server:
npm start

5. Frontend (Client)
Navigate to the client directory:
cd ../client

6. Install dependencies:
npm install

7. Start the development server:
npm start
The frontend will be accessible at http://localhost:3000, and the backend API at http://localhost:5000.

🔧 Usage

-Register a new user: Use the registration form to create a new account with a profile photo.
-Login: After registration, log in using your credentials to access your profile.
-Profile Management: View and update your profile information, including uploading a new profile photo.

🧑‍🤝‍🧑 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (git checkout -b feature-name).
3. Commit your changes (git commit -am 'Add new feature').
4. Push to the branch (git push origin feature-name).
5. Create a new Pull Request.


📄 License

Copyright (c) 2025 Utkarsh Sharma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


📺 Video Tutorial

https://drive.google.com/file/d/1yL8tWeTLHImHxuH7e27TgtRshz2XohIs/view?usp=sharing