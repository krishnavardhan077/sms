from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class RoleEnum(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


# ── User ──────────────────────────────────────────────────────────
class UserBase(BaseModel):
    name: str
    email: str
    role: RoleEnum


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int

    class Config:
        from_attributes = True


# ── Auth ──────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: RoleEnum


class LoginRequest(BaseModel):
    email: str
    password: str
    role: RoleEnum


class LoginResponse(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum


# ── Course ────────────────────────────────────────────────────────
class CourseBase(BaseModel):
    title: str
    description: str


class CourseCreate(CourseBase):
    teacher_id: Optional[int] = None


class Course(CourseBase):
    id: int
    teacher_id: Optional[int] = None
    teacher: Optional[User] = None

    class Config:
        from_attributes = True


class CourseWithMeta(CourseBase):
    id: int
    test_count: int
    enrolled: bool

    class Config:
        from_attributes = True


# ── Enrollment ────────────────────────────────────────────────────
class EnrollmentCreate(BaseModel):
    student_id: int
    course_id: int


class Enrollment(BaseModel):
    id: int
    student_id: int
    course_id: int
    grade: Optional[str] = None
    student: User
    course: Course

    class Config:
        from_attributes = True


# ── Test ──────────────────────────────────────────────────────────
class TestQuestion(BaseModel):
    q: str
    options: List[str]
    answer: int


class TestSummary(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    question_count: int
    course_id: int

    class Config:
        from_attributes = True


class TestDetail(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    course_id: int
    questions: List[TestQuestion]

    class Config:
        from_attributes = True


# ── TestAttempt ───────────────────────────────────────────────────
class SubmitAnswers(BaseModel):
    student_id: int
    answers: List[int]  # selected option indices


class AttemptResult(BaseModel):
    test_id: int
    score: int           # correct answers count
    total: int           # total questions
    percentage: int      # 0-100


# ── Admin ─────────────────────────────────────────────────────────
class AdminUserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: RoleEnum


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[RoleEnum] = None
