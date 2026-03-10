"""
EduMind Production Seed Script
Populates the database with sample data for production deployment
"""

import sqlite3
import hashlib
import random
import os

# Get database path - works for both local and production
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.environ.get('DATABASE_PATH', os.path.join(BASE_DIR, 'edumind.db'))

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def seed_data():
    """Populate database with sample data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("Seeding users...")
    
    # Create Admin
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, email, password_hash, full_name, role, is_verified)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', ('admin', 'admin@edumind.com', hash_password('admin123'), 'System Administrator', 'admin', 1))
    
    # Create Lecturers
    lecturers = [
        ('johnsmith', 'john.smith@edumind.com', 'lecturer123', 'John Smith', 'Lecturer'),
        ('sarahjohnson', 'sarah.johnson@edumind.com', 'lecturer123', 'Sarah Johnson', 'Lecturer'),
        ('michaelbrown', 'michael.brown@edumind.com', 'lecturer123', 'Michael Brown', 'Lecturer'),
        ('emilydavis', 'emily.davis@edumind.com', 'lecturer123', 'Emily Davis', 'Lecturer'),
        ('davidwilson', 'david.wilson@edumind.com', 'lecturer123', 'David Wilson', 'Lecturer'),
    ]
    
    lecturer_ids = []
    for username, email, password, full_name, role in lecturers:
        cursor.execute('''
            INSERT OR IGNORE INTO users (username, email, password_hash, full_name, role, is_verified)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (username, email, hash_password(password), full_name, 'lecturer', 1))
        lecturer_ids.append(cursor.lastrowid if cursor.lastrowid else cursor.lastrowid)
    
    # Get lecturer IDs
    cursor.execute("SELECT id FROM users WHERE role = 'lecturer'")
    lecturer_ids = [row['id'] for row in cursor.fetchall()]
    
    print(f"Created {len(lecturer_ids)} lecturers")
    
    # Create Students
    students = [
        ('student1', 'student1@edumind.com', 'student123', 'Alice Anderson'),
        ('student2', 'student2@edumind.com', 'student123', 'Bob Baker'),
        ('student3', 'student3@edumind.com', 'student123', 'Charlie Clark'),
        ('student4', 'student4@edumind.com', 'student123', 'Diana Davis'),
        ('student5', 'student5@edumind.com', 'student123', 'Edward Evans'),
        ('student6', 'student6@edumind.com', 'student123', 'Fiona Foster'),
        ('student7', 'student7@edumind.com', 'student123', 'George Garcia'),
        ('student8', 'student8@edumind.com', 'student123', 'Hannah Hill'),
        ('student9', 'student9@edumind.com', 'student123', 'Ian Irwin'),
        ('student10', 'student10@edumind.com', 'student123', 'Julia James'),
    ]
    
    student_ids = []
    for username, email, password, full_name in students:
        cursor.execute('''
            INSERT OR IGNORE INTO users (username, email, password_hash, full_name, role, is_verified)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (username, email, hash_password(password), full_name, 'student', 1))
    
    # Get student IDs
    cursor.execute("SELECT id FROM users WHERE role = 'student'")
    student_ids = [row['id'] for row in cursor.fetchall()]
    
    print(f"Created {len(student_ids)} students")
    
    # Create Courses
    print("Seeding courses...")
    courses = [
        ('Introduction to Computer Science', 'Learn the fundamentals of programming and computational thinking', 'Computer Science', 'CS101', lecturer_ids[0] if lecturer_ids else 1),
        ('Advanced Mathematics', 'Calculus, Linear Algebra, and Differential Equations', 'Mathematics', 'MATH201', lecturer_ids[1] if lecturer_ids else 1),
        ('Web Development Fundamentals', 'HTML, CSS, JavaScript, and modern web frameworks', 'Web Development', 'WD101', lecturer_ids[2] if lecturer_ids else 1),
        ('Data Science and Analytics', 'Data visualization, machine learning, and statistical analysis', 'Data Science', 'DS101', lecturer_ids[3] if lecturer_ids else 1),
        ('Artificial Intelligence', 'Neural networks, deep learning, and AI algorithms', 'Artificial Intelligence', 'AI101', lecturer_ids[4] if lecturer_ids else 1),
        ('Mobile App Development', 'iOS and Android app development with React Native', 'Mobile Development', 'MD101', lecturer_ids[0] if lecturer_ids else 1),
        ('Database Management', 'SQL, NoSQL, and database design principles', 'Database', 'DB101', lecturer_ids[1] if lecturer_ids else 1),
        ('Network Security', 'Cybersecurity fundamentals and ethical hacking', 'Security', 'SEC101', lecturer_ids[2] if lecturer_ids else 1),
        ('Cloud Computing', 'AWS, Azure, and cloud architecture', 'Cloud Computing', 'CC101', lecturer_ids[3] if lecturer_ids else 1),
        ('Software Engineering', 'Agile methodologies, testing, and DevOps', 'Software Engineering', 'SE101', lecturer_ids[4] if lecturer_ids else 1),
    ]
    
    course_ids = []
    for title, description, subject, code, teacher_id in courses:
        cursor.execute('''
            INSERT OR IGNORE INTO courses (title, description, subject, course_code, teacher_id, is_published)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (title, description, subject, code, teacher_id, 1))
        if cursor.lastrowid:
            course_ids.append(cursor.lastrowid)
    
    # Get course IDs
    cursor.execute("SELECT id FROM courses")
    course_ids = [row['id'] for row in cursor.fetchall()]
    
    print(f"Created {len(course_ids)} courses")
    
    # Create Modules
    print("Seeding modules...")
    for i, course_id in enumerate(course_ids):
        for j in range(3):
            cursor.execute('''
                INSERT OR IGNORE INTO modules (course_id, name, description, year, semester)
                VALUES (?, ?, ?, ?, ?)
            ''', (course_id, f'Module {j+1}', f'Learning module {j+1} for this course', 2024, (j % 2) + 1))
    
    # Get module IDs
    cursor.execute("SELECT id FROM modules")
    module_ids = [row['id'] for row in cursor.fetchall()]
    
    print(f"Created {len(module_ids)} modules")
    
    # Enroll students in courses
    print("Enrolling students in courses...")
    for student_id in student_ids[:5]:
        for course_id in course_ids[:3]:
            cursor.execute('''
                INSERT OR IGNORE INTO enrollments (student_id, course_id, status, enrolled_at)
                VALUES (?, ?, ?, datetime('now'))
            ''', (student_id, course_id, 'approved'))
    
    # Enroll students in modules
    for student_id in student_ids[:5]:
        for module_id in module_ids[:5]:
            cursor.execute('''
                INSERT OR IGNORE INTO module_enrollments (student_id, module_id, status)
                VALUES (?, ?, ?)
            ''', (student_id, module_id, 'approved'))
    
    print("Creating quizzes...")
    # Create Quizzes
    quiz_data = [
        ('Python Basics Quiz', 'Test your knowledge of Python fundamentals', module_ids[0] if module_ids else 1, 'easy'),
        ('Data Structures Quiz', 'Arrays, Lists, Trees, and Graphs', module_ids[1] if len(module_ids) > 1 else 1, 'medium'),
        ('Web Development Quiz', 'HTML, CSS, and JavaScript basics', module_ids[2] if len(module_ids) > 2 else 1, 'easy'),
        ('Algorithms Quiz', 'Sorting, searching, and algorithm complexity', module_ids[3] if len(module_ids) > 3 else 1, 'hard'),
        ('Database Quiz', 'SQL queries and database design', module_ids[4] if len(module_ids) > 4 else 1, 'medium'),
    ]
    
    for title, description, module_id, difficulty in quiz_data:
        cursor.execute('''
            INSERT OR IGNORE INTO quizzes (title, description, module_id, difficulty)
            VALUES (?, ?, ?, ?)
        ''', (title, description, module_id, difficulty))
    
    print("Creating assignments...")
    # Create Assignments
    assignment_data = [
        ('Python Programming Assignment', 'Build a simple calculator in Python', module_ids[0] if module_ids else 1),
        ('HTML Website Project', 'Create a responsive website with HTML/CSS', module_ids[2] if len(module_ids) > 2 else 1),
        ('Database Design Project', 'Design a database for a library system', module_ids[4] if len(module_ids) > 4 else 1),
    ]
    
    for title, description, module_id in assignment_data:
        cursor.execute('''
            INSERT OR IGNORE INTO assignments (title, description, module_id, due_date)
            VALUES (?, ?, ?, datetime('now', '+7 days'))
        ''', (title, description, module_id))
    
    conn.commit()
    conn.close()
    
    print("Database seeding completed successfully!")
    print("\n=== Login Credentials ===")
    print("Admin: admin / admin123")
    print("Lecturers: johnsmith / lecturer123, sarahjohnson / lecturer123, etc.")
    print("Students: student1 / student123, student2 / student123, etc.")

if __name__ == '__main__':
    seed_data()
