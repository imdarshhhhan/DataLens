import os
import shutil
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User


def wipe_expired_guests():
    db: Session = SessionLocal()

    try:
        expired = db.query(User).filter(
            User.is_guest  == True,
            User.expires_at < datetime.utcnow()
        ).all()

        count = len(expired)

        for user in expired:
            # Delete DuckDB files from disk
            user_dir = os.path.join("datasets", user.id)
            if os.path.exists(user_dir):
                shutil.rmtree(user_dir)

            # Delete user — cascades to files, queries, insights
            db.delete(user)

        db.commit()
        print(f"✅ Cleanup complete — wiped {count} expired guest accounts")

    except Exception as e:
        print(f"❌ Cleanup error: {str(e)}")

    finally:
        db.close()


if __name__ == "__main__":
    wipe_expired_guests()




def wipe_expired_guests():
    db: Session = SessionLocal()

    try:
        expired = db.query(User).filter(
            User.is_guest  == True,
            User.expires_at < datetime.utcnow()
        ).all()

        count = len(expired)

        for user in expired:
            # Delete DuckDB files from disk
            user_dir = os.path.join("datasets", user.id)
            if os.path.exists(user_dir):
                shutil.rmtree(user_dir)

            # Delete user — cascades to files, queries, insights
            db.delete(user)

        db.commit()
        print(f"✅ Cleanup complete — wiped {count} expired guest accounts")

    except Exception as e:
        print(f"❌ Cleanup error: {str(e)}")

    finally:
        db.close()


if __name__ == "__main__":
    wipe_expired_guests()