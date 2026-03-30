from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db

router = APIRouter()


# ── Admin dashboard ───────────────────────────────────────────────
@router.get("/dashboard/admin", response_model=dict)
def get_admin_dashboard(db: Session = Depends(get_db)):
    students_count = db.query(models.User).filter(models.User.role == "student").count()
    teachers_count = db.query(models.User).filter(models.User.role == "teacher").count()
    courses_count = db.query(models.Course).count()
    enrollments_count = db.query(models.Enrollment).count()

    recent_enrollments = db.query(models.Enrollment).order_by(models.Enrollment.id.desc()).limit(5).all()
    enrollment_data = []
    for e in recent_enrollments:
        enrollment_data.append({
            "id": e.id,
            "student_name": e.student.name,
            "course_title": e.course.title,
            "grade": e.grade,
        })

    return {
        "stats": {
            "students": students_count,
            "teachers": teachers_count,
            "courses": courses_count,
            "enrollments": enrollments_count,
        },
        "recent_activity": enrollment_data,
    }


# ── Student dashboard ──────────────────────────────────────────────
@router.get("/dashboard/student/{student_id}", response_model=dict)
def get_student_dashboard(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(
        models.User.id == student_id, models.User.role == "student"
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == student_id
    ).all()

    courses = []
    for e in enrollments:
        tests_data = []
        for t in e.course.tests:
            latest = (
                db.query(models.TestAttempt)
                .filter(
                    models.TestAttempt.student_id == student_id,
                    models.TestAttempt.test_id == t.id,
                )
                .order_by(models.TestAttempt.submitted_at.desc())
                .first()
            )
            tests_data.append({
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "question_count": len(t.questions),
                "attempted": latest is not None,
                "score": latest.score if latest else None,
            })
        courses.append({
            "enrollment_id": e.id,
            "course_id": e.course.id,
            "title": e.course.title,
            "description": e.course.description,
            "tests": tests_data,
        })

    return {
        "student": {"id": student.id, "name": student.name, "email": student.email},
        "enrolled_courses": courses,
    }


# ── Teacher dashboard ──────────────────────────────────────────────
@router.get("/dashboard/teacher/{teacher_id}", response_model=dict)
def get_teacher_dashboard(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(models.User).filter(
        models.User.id == teacher_id, models.User.role == "teacher"
    ).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    all_courses = db.query(models.Course).all()
    course_list = []
    total_students = 0

    for c in all_courses:
        enrolled = db.query(models.Enrollment).filter(models.Enrollment.course_id == c.id).all()
        total_students += len(enrolled)
        course_list.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "enrolled_students": len(enrolled),
        })

    return {
        "teacher": {"id": teacher.id, "name": teacher.name},
        "courses": course_list,
        "total_students": total_students,
    }


# ── Courses ────────────────────────────────────────────────────────
@router.get("/courses", response_model=list)
def list_courses(student_id: Optional[int] = None, db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    result = []

    enrolled_ids = set()
    if student_id:
        enrollments = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == student_id
        ).all()
        enrolled_ids = {e.course_id for e in enrollments}

    for c in courses:
        result.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "test_count": len(c.tests),
            "enrolled": c.id in enrolled_ids,
        })
    return result


@router.get("/courses/{course_id}", response_model=dict)
def get_course(course_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "teacher": {"id": c.teacher.id, "name": c.teacher.name, "email": c.teacher.email} if c.teacher else None,
    }


# ── Course roster (teacher view) ───────────────────────────────────
@router.get("/courses/{course_id}/roster", response_model=dict)
def get_course_roster(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id
    ).all()

    tests = course.tests
    students_data = []

    for e in enrollments:
        student = e.student
        test_scores = []
        for t in tests:
            attempt = (
                db.query(models.TestAttempt)
                .filter(
                    models.TestAttempt.student_id == student.id,
                    models.TestAttempt.test_id == t.id,
                )
                .order_by(models.TestAttempt.submitted_at.desc())
                .first()
            )
            test_scores.append({
                "test_id": t.id,
                "test_title": t.title,
                "score": attempt.score if attempt else None,
                "attempted": attempt is not None,
            })
        students_data.append({
            "student_id": student.id,
            "name": student.name,
            "email": student.email,
            "test_scores": test_scores,
        })

    return {
        "course": {"id": course.id, "title": course.title, "description": course.description},
        "tests": [{"id": t.id, "title": t.title} for t in tests],
        "students": students_data,
    }


# ── Enrollment ─────────────────────────────────────────────────────
@router.post("/enroll", response_model=dict)
def enroll_student(req: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == req.student_id,
        models.Enrollment.course_id == req.course_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    enrollment = models.Enrollment(
        student_id=req.student_id,
        course_id=req.course_id,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return {"message": "Enrolled successfully", "enrollment_id": enrollment.id}


@router.delete("/enroll/{enrollment_id}", response_model=dict)
def drop_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    e = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(e)
    db.commit()
    return {"message": "Course dropped successfully"}


# ── Tests ──────────────────────────────────────────────────────────
@router.get("/courses/{course_id}/tests", response_model=list)
def get_course_tests(course_id: int, db: Session = Depends(get_db)):
    tests = db.query(models.Test).filter(models.Test.course_id == course_id).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "question_count": len(t.questions),
            "course_id": t.course_id,
        }
        for t in tests
    ]


@router.get("/tests/{test_id}", response_model=dict)
def get_test(test_id: int, db: Session = Depends(get_db)):
    t = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Test not found")
    # Return questions without the answer field
    questions = [
        {"q": q["q"], "options": q["options"]}
        for q in t.questions
    ]
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "course_id": t.course_id,
        "questions": questions,
    }


@router.post("/tests/{test_id}/submit", response_model=dict)
def submit_test(test_id: int, req: schemas.SubmitAnswers, db: Session = Depends(get_db)):
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    questions = test.questions
    correct = sum(
        1 for i, q in enumerate(questions)
        if i < len(req.answers) and req.answers[i] == q["answer"]
    )
    total = len(questions)
    percentage = round((correct / total) * 100) if total > 0 else 0

    attempt = models.TestAttempt(
        student_id=req.student_id,
        test_id=test_id,
        score=percentage,
    )
    db.add(attempt)
    db.commit()

    return {
        "score": correct,
        "total": total,
        "percentage": percentage,
        "message": f"You scored {correct}/{total} ({percentage}%)",
    }
