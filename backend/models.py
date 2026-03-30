from sqlalchemy import Column, Integer, String, Enum, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
import enum
from database import Base
from datetime import datetime


class RoleEnum(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(Enum(RoleEnum))
    hashed_password = Column(String, nullable=False)


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    teacher = relationship("User")
    tests = relationship("Test", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    grade = Column(String, nullable=True)

    student = relationship("User")
    course = relationship("Course", back_populates="enrollments")


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    description = Column(String, nullable=True)
    questions = Column(JSON)  # List of {q, options, answer} dicts

    course = relationship("Course", back_populates="tests")
    attempts = relationship("TestAttempt", back_populates="test")


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    test_id = Column(Integer, ForeignKey("tests.id"))
    score = Column(Integer)  # percentage 0–100
    submitted_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User")
    test = relationship("Test", back_populates="attempts")
