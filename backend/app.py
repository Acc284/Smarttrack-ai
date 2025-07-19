from flask import Flask, request, jsonify, Response, session
from flask_cors import CORS
import face_recognition
import cv2
import shutil
import numpy as np
import os
import base64
import mysql.connector
from flask_session import Session
from datetime import datetime, date, timedelta
import csv
from io import StringIO
from pytz import timezone
from werkzeug.utils import secure_filename
import traceback

app = Flask(__name__)
app.secret_key = 'nav'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.permanent_session_lifetime = timedelta(hours=2)
Session(app)

CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# ---------- Database Connection ----------
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="naveen#15",
        database="smartrack"
    )

db = get_db_connection()

def ensure_db_connection():
    global db
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
    except:
        db = get_db_connection()

def get_cursor():
    global db
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
    except Exception as e:
        print("[WARN] Ping failed, reconnecting:", e)
        db = get_db_connection()
    return db.cursor()

# ---------- Face Recognition ----------
KNOWN_FACES_DIR = "known_faces"
known_face_encodings = []
known_face_names = []

def load_known_faces():
    global known_face_encodings, known_face_names
    known_face_encodings = []
    known_face_names = []
    print("[INFO] Reloading known faces...")
    for student_name in os.listdir(KNOWN_FACES_DIR):
        student_dir = os.path.join(KNOWN_FACES_DIR, student_name)
        if os.path.isdir(student_dir):
            for image_file in os.listdir(student_dir):
                image_path = os.path.join(student_dir, image_file)
                image = face_recognition.load_image_file(image_path)
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    known_face_encodings.append(encodings[0])
                    known_face_names.append(student_name)
                    print(f"[OK] Loaded encoding for {student_name}")
    print(f"[INFO] Total encodings loaded: {len(known_face_encodings)}")

load_known_faces()

# ------------------------ Routes ------------------------

@app.route('/register_student', methods=['POST'])
def register_student():
    try:
        data = request.get_json()
        name = data.get('name')
        image = data.get('image')

        if not name or not image:
            return jsonify({'status': 'error', 'message': 'Name and image required'}), 400

        cursor = get_cursor()
        cursor.execute("INSERT INTO students (name) VALUES (%s)", (name,))
        db.commit()
        cursor.close()

        folder_path = os.path.join(KNOWN_FACES_DIR, secure_filename(name))
        os.makedirs(folder_path, exist_ok=True)
        header, encoded = image.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        image_path = os.path.join(folder_path, f"{timestamp}.jpg")
        with open(image_path, "wb") as f:
            f.write(image_bytes)

        load_known_faces()
        return jsonify({'status': 'success', 'message': f'{name} registered successfully'})
    except Exception as e:
        print("❌ Register Error:", e)
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': 'Server error'}), 500

@app.route('/students', methods=['GET'])
def get_students():
    try:
        ensure_db_connection()
        cursor = get_cursor()
        cursor.execute("SELECT id, name FROM students")
        students = cursor.fetchall()
        cursor.close()
        return jsonify([{'id': s[0], 'name': s[1]} for s in students])
    except Exception as e:
        print("❌ /students failed:", e)
        return jsonify([]), 500


@app.route('/student/<int:id>', methods=['DELETE'])
def delete_student(id):
    if 'admin_logged_in' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        cursor = get_cursor()
        cursor.execute("SELECT name FROM students WHERE id = %s", (id,))
        result = cursor.fetchone()
        if result:
            student_name = result[0]
            face_dir = os.path.join(KNOWN_FACES_DIR, student_name)
            if os.path.exists(face_dir):
                shutil.rmtree(face_dir)

        cursor.execute("DELETE FROM attendance WHERE student_id = %s", (id,))
        cursor.execute("DELETE FROM students WHERE id = %s", (id,))
        db.commit()
        cursor.close()
        return jsonify({'success': True, 'message': 'Student deleted'}), 200
    except Exception as e:
        print("❌ Delete Error:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    try:
        data = request.get_json()
        image_data = data.get('image')

        if not image_data:
            return jsonify({'status': 'error', 'message': 'No image data received'}), 400

        header, encoded = image_data.split(",", 1)
        np_arr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        if not face_encodings:
            return jsonify({'status': 'error', 'message': 'No face detected'}), 400

        for location, encoding in zip(face_locations, face_encodings):
            top, right, bottom, left = location
            face_height = bottom - top
            face_width = right - left
            face_area = face_height * face_width

            if face_area < 15000:
                print(f"[WARN] Face too small: {face_area}px")
                return jsonify({'status': 'error', 'message': 'Please come closer to the camera'}), 400

            distances = face_recognition.face_distance(known_face_encodings, encoding)
            if not distances.any():
                return jsonify({'status': 'error', 'message': 'No known faces in database'}), 400

            min_distance = min(distances)
            index = np.argmin(distances)
            name = known_face_names[index]
            print(f"[MATCH] Distance: {min_distance:.4f} for {name}")

            if min_distance < 0.5:
                cursor = get_cursor()
                cursor.execute("SELECT id FROM students WHERE LOWER(name) = %s", (name.lower(),))
                student = cursor.fetchone()
                if not student:
                    cursor.close()
                    return jsonify({'status': 'error', 'message': 'Student not found in records'}), 404
                student_id = student[0]

                cursor.execute("SELECT * FROM attendance WHERE student_id = %s AND DATE(time) = CURDATE()", (student_id,))
                if cursor.fetchone():
                    cursor.close()
                    return jsonify({'status': 'error', 'message': 'Attendance already marked'}), 409

                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cursor.execute("INSERT INTO attendance (student_id, time) VALUES (%s, %s)", (student_id, now))
                db.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': f'Attendance marked for {name}', 'name': name}), 200
            else:
                print(f"[WARN] Low confidence match for {name}: {min_distance:.4f}")
                return jsonify({'status': 'error', 'message': 'Face match confidence too low'}), 400

        return jsonify({'status': 'error', 'message': 'No matching face found'}), 400
    except Exception as e:
        print("❌ Attendance Error:", e)
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': 'Server error'}), 500


@app.route('/attendance/today', methods=['GET'])
def get_attendance_today():
    print("[DEBUG] /attendance/today called")
    try:
        cursor = get_cursor()
        cursor.execute("""
            SELECT students.id, students.name, attendance.time
            FROM attendance
            JOIN students ON attendance.student_id = students.id
            WHERE DATE(attendance.time) = CURDATE()
            ORDER BY attendance.time ASC
        """)
        rows = cursor.fetchall()
        cursor.close()
        return jsonify([{
            'id': r[0], 'name': r[1], 'time': r[2].strftime("%Y-%m-%d %H:%M:%S")
        } for r in rows])
    except Exception as e:
        print("❌ Today Error:", e)
        traceback.print_exc()
        return jsonify({'error': 'Server error'}), 500

@app.route('/attendance/absentees', methods=['GET'])
def get_absentees_today():
    print("[DEBUG] /attendance/absentees called")
    try:
        cursor = get_cursor()
        cursor.execute("SELECT id, name FROM students")
        all_students = cursor.fetchall()
        cursor.execute("SELECT DISTINCT student_id FROM attendance WHERE DATE(time) = CURDATE()")
        attended_ids = {row[0] for row in cursor.fetchall()}
        cursor.close()
        return jsonify([{'id': s[0], 'name': s[1]} for s in all_students if s[0] not in attended_ids])
    except Exception as e:
        print("❌ Absentees Error:", e)
        traceback.print_exc()
        return jsonify({'error': 'Server error'}), 500

@app.route('/attendance/today_csv', methods=['GET'])
def download_today_attendance_csv():
    try:
        cursor = get_cursor()
        cursor.execute("""
            SELECT students.id, students.name, attendance.time
            FROM attendance
            JOIN students ON attendance.student_id = students.id
            WHERE DATE(attendance.time) = CURDATE()
        """)
        rows = cursor.fetchall()
        cursor.close()

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Student ID', 'Name', 'Time'])
        for row in rows:
            writer.writerow(row)

        return Response(output.getvalue(), mimetype='text/csv',
                        headers={"Content-Disposition": "attachment; filename=attendance_today.csv"})
    except Exception as e:
        print("❌ CSV Export Error:", e)
        return jsonify({'error': 'CSV export error'}), 500

@app.route('/student/<int:id>', methods=['GET'])
def get_student_profile(id):
    if 'admin_logged_in' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        cursor = get_cursor()
        cursor.execute("SELECT id, name FROM students WHERE id = %s", (id,))
        student = cursor.fetchone()
        if not student:
            cursor.close()
            return jsonify({'error': 'Student not found'}), 404
        cursor.execute("SELECT time FROM attendance WHERE student_id = %s ORDER BY time DESC", (id,))
        attendance = cursor.fetchall()
        cursor.close()
        return jsonify({
            'id': student[0],
            'name': student[1],
            'attendance': [t[0].strftime('%Y-%m-%d %H:%M:%S') for t in attendance]
        }), 200
    except Exception as e:
        print("❌ Profile Error:", e)
        traceback.print_exc()
        return jsonify({'error': 'Server error'}), 500

@app.route('/admin/summary', methods=['GET'])
def admin_summary():
    print("[DEBUG] /admin/summary called")
    try:
        ensure_db_connection()
        today = date.today().strftime('%Y-%m-%d')
        cursor = get_cursor()
        print("[DEBUG] Cursor acquired")

        try:
            cursor.execute("SELECT COUNT(*) FROM students")
            total_result = cursor.fetchone()
            total = total_result[0] if total_result else 0
            print("[DEBUG] Total students:", total)

            cursor.execute("SELECT COUNT(DISTINCT student_id) FROM attendance WHERE DATE(time) = %s", (today,))
            attended_result = cursor.fetchone()
            attended = attended_result[0] if attended_result else 0
            print("[DEBUG] Attended today:", attended)

        except mysql.connector.Error as err:
            print("[WARN] Query failed, retrying with fresh connection:", err)
            ensure_db_connection()
            cursor = get_cursor()
            cursor.execute("SELECT COUNT(*) FROM students")
            total_result = cursor.fetchone()
            total = total_result[0] if total_result else 0

            cursor.execute("SELECT COUNT(DISTINCT student_id) FROM attendance WHERE DATE(time) = %s", (today,))
            attended_result = cursor.fetchone()
            attended = attended_result[0] if attended_result else 0

        absent = total - attended
        cursor.close()
        print("[DEBUG] Summary ready:", {"total": total, "attended": attended, "absent": absent})
        return jsonify({'total_students': total, 'attended_today': attended, 'absent_today': absent})

    except Exception as e:
        print("[❌ ERROR] Summary route crashed:", e)
        traceback.print_exc()
        return jsonify({'total_students': 0, 'attended_today': 0, 'absent_today': 0}), 500


@app.route('/students-status')
def get_students_status():
    from datetime import date
    import mysql.connector

    try:
        # Open a fresh connection per request
        connection = mysql.connector.connect(
            host='localhost',
            user='root',       # 🔁 Replace this
            password='naveen#15',  # 🔁 Replace this
            database='smartrack'            # ✅ This is correct if you're using 'smartrack'
        )
        cursor = connection.cursor()

        today = date.today().isoformat()

        # Fetch all students
        cursor.execute("SELECT id, name FROM students")
        students = cursor.fetchall()

        # Fetch today's attendance
        cursor.execute("SELECT student_id FROM attendance WHERE DATE(time) = %s", (today,))
        present_ids = {row[0] for row in cursor.fetchall()}

        # Build status list
        result = []
        for student in students:
            status = "Present" if student[0] in present_ids else "Absent"
            result.append({
                "id": student[0],
                "name": student[1],
                "status": status
            })

        return jsonify(result)

    except Exception as e:
        print("❌ Error in /students-status:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        try:
            cursor.close()
            connection.close()
        except:
            pass


# ------------------------ Auth ------------------------

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if data.get('username') == 'admin' and data.get('password') == 'admin123':
        session.permanent = True
        session['admin_logged_in'] = True
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out'}), 200

@app.route('/check-auth', methods=['GET'])
def check_auth():
    return jsonify({'authenticated': session.get('admin_logged_in') is True})

@app.route('/reload_faces', methods=['GET'])
def reload_faces():
    load_known_faces()
    return jsonify({'status': 'success'})

# ------------------------ Run ------------------------

if __name__ == '__main__':
    print("[START] Flask server starting on http://localhost:5000 ...")
    app.run(debug=True, port=5000, use_reloader=False)

