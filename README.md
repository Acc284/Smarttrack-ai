# 🎓 SmartTrack: AI-Powered Student Attendance Portal

SmartTrack is a full-stack web application that **automates student attendance using facial recognition**. It eliminates manual roll calls and provides **real-time tracking, insightful analytics**, and centralized student management with a sleek UI.

---

## 🚀 Tech Stack

| Layer        | Technologies Used                            |
|--------------|-----------------------------------------------|
| 🖥️ Frontend  | React.js, Material UI                         |
| ⚙️ Backend   | Python (Flask), OpenCV, `face_recognition` API |
| 🗄️ Database  | MySQL                                         |

---

## ✨ Key Features

- 🎯 **Facial Recognition Attendance**
- 🧠 AI-powered detection using `OpenCV` + `face_recognition`
- 📝 Student registration with real-time webcam capture
- 📊 Daily attendance dashboard (present/absent summary)
- 📁 Downloadable CSV report for attendance
- 🔐 Admin login with session-based access control
- 📱 Fully responsive UI using Material UI

---

## 🛠️ Installation & Setup

### ✅ Backend Setup (Flask + AI)

```bash
git clone https://github.com/your-username/smarttrack.git
cd smarttrack/backend
pip install -r requirements.txt
````

🔧 **Configure MySQL in `app.py`:**

```python
mysql.connector.connect(
    host="localhost",
    user="root",
    password="your-password",
    database="smartrack"
)
```

### ✅ Frontend Setup (React + MUI)

```bash
cd ../frontend
npm install
npm start
```

---

## 📁 Folder Structure

```
smarttrack/
│
├── backend/               # Flask backend + AI logic + MySQL
│   ├── app.py
│   ├── known_faces/
│   └── ...
│
├── frontend/              # React + Material UI
│   ├── src/
│   ├── public/
│   └── ...
│
└── README.md
```

---

## 📦 Acknowledgements

* [face\_recognition](https://github.com/ageitgey/face_recognition)
* [OpenCV](https://opencv.org/)
* [Material UI](https://mui.com/)
* [Flask](https://flask.palletsprojects.com/)

---

## 👤 Author

**Naveen Kumar**

* 🔗 [GitHub](https://github.com/Acc284)
* 🔗 [LinkedIn](https://www.linkedin.com/in/naveen-kumar-b49a39283)

