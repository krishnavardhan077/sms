from database import SessionLocal
import models

def seed_db():
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            # Create Admin
            admin = models.User(name="Alice Admin", email="admin@example.com", role="admin")
            db.add(admin)
            
            # Create Teachers
            teacher1 = models.User(name="Bob Teacher", email="bob@example.com", role="teacher")
            teacher2 = models.User(name="Carol Teacher", email="carol@example.com", role="teacher")
            db.add_all([teacher1, teacher2])
            db.commit()
            db.refresh(teacher1)
            db.refresh(teacher2)
            
            # Create Students
            student1 = models.User(name="Dave Student", email="dave@example.com", role="student")
            student2 = models.User(name="Eve Student", email="eve@example.com", role="student")
            db.add_all([student1, student2])
            db.commit()
            db.refresh(student1)
            db.refresh(student2)

            # Create Courses
            course1 = models.Course(title="Introduction to React", description="Learn React basics", teacher_id=teacher1.id)
            course2 = models.Course(title="Advanced Python", description="FastAPI and SQLAlchemy", teacher_id=teacher2.id)
            db.add_all([course1, course2])
            db.commit()
            db.refresh(course1)
            db.refresh(course2)

            # Create Enrollments
            enroll1 = models.Enrollment(student_id=student1.id, course_id=course1.id, grade="A")
            enroll2 = models.Enrollment(student_id=student1.id, course_id=course2.id, grade="B+")
            enroll3 = models.Enrollment(student_id=student2.id, course_id=course1.id, grade="A-")
            db.add_all([enroll1, enroll2, enroll3])
            db.commit()
            
            print("Database seeded successfully!")
        else:
            print("Database already contains data, skipping seed.")
    finally:
        db.close()

if __name__ == "__main__":
    from main import app # This triggers metadata.create_all
    seed_db()
