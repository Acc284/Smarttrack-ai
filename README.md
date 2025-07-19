SmartTrack: AI-Powered Student Attendance Portal

SmartTrack is a full-stack web application that automates student attendance using facial recognition technology. It eliminates the need for manual roll calls and offers real-time tracking, analytics, and student management in a centralized portal.


Tech Stack:

| Layer        | Tech Used                              |
|--------------|----------------------------------------|
| Frontend     | React.js, Material UI                  |
| Backend      | Python (Flask), OpenCV, face_recognition API |
| Database     | MySQL                                  |
| Deployment   | Vercel (Frontend) + Heroku (Backend)   |


Key Features:

-  *Facial Recognition Attendance*
-  AI-powered detection using OpenCV + `face_recognition`
-  Student registration with face capture
-  Daily attendance dashboard (present/absent summary)
-  Download attendance as CSV
-  Admin login and access control
-  Responsive UI built with Material UI


Installation:

   # Backend Setup (Flask):
         git clone https://github.com/your-username/smarttrack.git
         cd smarttrack/backend
         *pip install -r requirements.txt*
    
   # Create a MySQL database called smartrack.
   # Update the DB config in app.py if needed,   
                mysql.connector.connect(
                host="localhost",
                user="root",
                password="your-password",
                database="smartrack"
                )
   # Frontend Setup (React):
            cd ../frontend
            npm install
            npm start

   # Folder Structure:
            
     smarttrack/
     │
     ├── backend/              # Flask + AI + MySQL
     │   ├── app.py
     │   ├── known_faces/
     │   └── ...
     │
     ├── frontend/             # React + MUI
     │   ├── src/
     │   ├── public/
     │   └── ...
     │
     └── README.md












  # Acknowledgements
    face_recognition :  https://github.com/ageitgey/face_recognition/tree/master/face_recognition
    OpenCV
    Material UI
    Flask



  # Author
  *Naveen Kumar*
  
    https://github.com/Acc284
    https://www.linkedin.com/in/naveen-kumar-b49a39283
    



























     
