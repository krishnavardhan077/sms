from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
import models, schemas
from database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ── Stats ──────────────────────────────────────────────────────────
@router.get("/stats", response_model=dict)
def admin_stats(db: Session = Depends(get_db)):
    return {
        "students": db.query(models.User).filter(models.User.role == "student").count(),
        "teachers": db.query(models.User).filter(models.User.role == "teacher").count(),
        "courses": db.query(models.Course).count(),
        "enrollments": db.query(models.Enrollment).count(),
        "test_attempts": db.query(models.TestAttempt).count(),
    }


# ── List users ────────────────────────────────────────────────────
@router.get("/users", response_model=list)
def list_users(role: str = None, db: Session = Depends(get_db)):
    q = db.query(models.User)
    if role:
        q = q.filter(models.User.role == role)
    users = q.order_by(models.User.id).all()
    result = []
    for u in users:
        # Count enrollments or courses depending on role
        if u.role == "student":
            extra = db.query(models.Enrollment).filter(models.Enrollment.student_id == u.id).count()
            extra_label = "enrollments"
        elif u.role == "teacher":
            extra = db.query(models.Course).filter(models.Course.teacher_id == u.id).count()
            extra_label = "courses_assigned"
        else:
            extra = 0
            extra_label = "none"
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            extra_label: extra,
        })
    return result


# ── Get single user's detail ───────────────────────────────────────
@router.get("/users/{user_id}", response_model=dict)
def get_user_detail(user_id: int, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    detail = {
        "id": u.id, "name": u.name, "email": u.email, "role": u.role,
    }
    if u.role == "student":
        enrollments = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == u.id
        ).all()
        detail["enrollments"] = [
            {
                "enrollment_id": e.id,
                "course_title": e.course.title,
                "tests_attempted": db.query(models.TestAttempt).filter(
                    models.TestAttempt.student_id == u.id,
                    models.TestAttempt.test_id.in_([t.id for t in e.course.tests])
                ).count(),
            }
            for e in enrollments
        ]
    return detail


# ── Create user ────────────────────────────────────────────────────
@router.post("/users", response_model=dict)
def create_user(req: schemas.AdminUserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=req.name,
        email=req.email,
        role=req.role,
        hashed_password=_hash(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created", "id": user.id, "role": user.role}


# ── Update user ────────────────────────────────────────────────────
@router.put("/users/{user_id}", response_model=dict)
def update_user(user_id: int, req: schemas.AdminUserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.name is not None:
        user.name = req.name
    if req.email is not None:
        existing = db.query(models.User).filter(
            models.User.email == req.email, models.User.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = req.email
    if req.role is not None:
        user.role = req.role
    db.commit()
    return {"message": "User updated", "id": user.id}


# ── Delete user ────────────────────────────────────────────────────
@router.delete("/users/{user_id}", response_model=dict)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Also clean up enrollments and test attempts
    db.query(models.TestAttempt).filter(models.TestAttempt.student_id == user_id).delete()
    db.query(models.Enrollment).filter(models.Enrollment.student_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
