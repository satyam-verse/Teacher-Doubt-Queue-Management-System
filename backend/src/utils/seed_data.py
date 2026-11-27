import os
import logging
from datetime import datetime, timezone
from flask import current_app
from backend.src.extensions import db
from backend.src.models.user import User, validate_password_strength
from backend.src.models.session import ClassroomSession
from backend.src.models.doubt import Doubt

logger = logging.getLogger(__name__)

def create_secure_admin(email: str, full_name: str, password: str) -> User:
    """
    Secure administrative account creation with password validation.
    Enforces security criteria and campus subscription tier.
    """
    is_valid, msg = validate_password_strength(password)
    if not is_valid:
        raise ValueError(f"Password does not meet security requirements: {msg}")

    email = email.strip().lower()
    admin = User.query.filter_by(email=email).first()
    if not admin:
        admin = User(
            email=email,
            full_name=full_name.strip(),
            role='admin',
            subscription_tier='campus',
            subscription_status='active'
        )
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        logger.info(f"Secure administrator created: {email}")
    else:
        admin.role = 'admin'
        admin.subscription_tier = 'campus'
        admin.set_password(password)
        db.session.commit()
        logger.info(f"Existing administrator account updated: {email}")
    return admin

def seed_development_database():
    """
    Safely seeds initial test accounts and sample doubts ONLY in local development environments.
    Strictly blocked in production environments to prevent predictable backdoor credentials.
    """
    # 1. Strict production guard
    flask_env = os.environ.get('FLASK_ENV', 'development').lower()
    app_env = current_app.config.get('ENV', 'development').lower() if current_app else 'development'
    if flask_env == 'production' or app_env == 'production':
        logger.warning("Database seeding strictly prohibited and skipped in production mode.")
        return

    # 2. Check explicit dev seeding enablement
    if os.environ.get('ENABLE_DEV_SEEDS', 'true').lower() not in ('true', '1'):
        logger.info("Database seeding skipped: ENABLE_DEV_SEEDS is not true.")
        return

    try:
        # Development credentials from environment variables with local test fallbacks
        admin_pass = os.environ.get('SEED_ADMIN_PASSWORD', 'Admin123!')
        teacher_pass = os.environ.get('SEED_TEACHER_PASSWORD', 'Teacher123!')
        student_pass = os.environ.get('SEED_STUDENT_PASSWORD', 'Student123!')

        # 1. Create or ensure Admin
        admin = User.query.filter_by(email='admin@doubtx.ai').first()
        if not admin:
            admin = User(
                email='admin@doubtx.ai',
                full_name='Dr. Elena Vance (Academic Dean)',
                role='admin',
                subscription_tier='campus'
            )
            admin.set_password(admin_pass)
            db.session.add(admin)

        # 2. Create or ensure Teacher
        teacher = User.query.filter_by(email='teacher@doubtx.ai').first()
        if not teacher:
            teacher = User(
                email='teacher@doubtx.ai',
                full_name='Prof. Satyam Kumar',
                role='teacher',
                subscription_tier='campus'
            )
            teacher.set_password(teacher_pass)
            db.session.add(teacher)

        # 3. Create or ensure Student
        student = User.query.filter_by(email='student@doubtx.ai').first()
        if not student:
            student = User(
                email='student@doubtx.ai',
                full_name='Alex Student',
                role='student',
                subscription_tier='free'
            )
            student.set_password(student_pass)
            db.session.add(student)

        db.session.commit()

        # 4. Create or ensure Default Classroom Session
        session = ClassroomSession.query.filter_by(session_code='DX-CS101').first()
        if not session:
            session = ClassroomSession(
                session_code='DX-CS101',
                title='CS101 - Algorithms & Data Structures',
                teacher_id=teacher.id,
                is_active=True
            )
            db.session.add(session)
            db.session.commit()
        db.session.commit()

        # 4. Create Sample Doubts
        d1 = Doubt(
            session_id=session.id,
            student_id=student.id,
            student_name=student.full_name,
            doubt='Why does my quicksort recurse infinitely when the input array is already sorted?',
            category='Algorithms / Python',
            priority='HIGH',
            status='QUEUED',
            ai_hint='Consider your pivot selection strategy. If you always pick the first or last element on a sorted array, the partition is unbalanced O(n^2). Try picking the middle element or random pivot.',
            ai_suggested_solution='1. Demonstrate worst-case recursion with leftmost pivot on sorted input.\n2. Recommend median-of-three or randomized pivot.\n3. Verify recursion base case low >= high.'
        )

        d2 = Doubt(
            session_id=session.id,
            student_id=None,
            student_name='Jordan Lee',
            doubt='How do I fix "Cannot update a component while rendering a different component" warning in React?',
            category='Frontend / React',
            priority='MEDIUM',
            status='IN_PROGRESS',
            resolved_by_id=teacher.id,
            ai_hint='This warning usually occurs when you call a state updater function directly inside the body of a component render or during an immediate parent-child dispatch. Wrap it inside useEffect or an event handler.',
            ai_suggested_solution='1. Identify setState invoked directly in component body.\n2. Move state update into useEffect or handleAction callback.\n3. Ensure pure render function without side-effects.'
        )

        d3 = Doubt(
            session_id=session.id,
            student_id=None,
            student_name='Priya Sharma',
            doubt='What is the difference between INNER JOIN and LEFT OUTER JOIN in MySQL?',
            category='Database / SQL',
            priority='LOW',
            status='RESOLVED',
            resolved_by_id=teacher.id,
            resolution_notes='Reviewed Venn diagram of SQL joins: INNER JOIN returns only records with matching keys in both tables, whereas LEFT JOIN preserves all left table records and fills NULL for missing right matches.',
            ai_hint='Think about what should happen to rows that do not have a match in the other table.',
            ai_suggested_solution='Explain Venn diagram intersection vs left-inclusive set.'
        )

        db.session.add_all([d1, d2, d3])
        db.session.commit()
        logger.info("Database successfully seeded with default test accounts.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.session.rollback()
