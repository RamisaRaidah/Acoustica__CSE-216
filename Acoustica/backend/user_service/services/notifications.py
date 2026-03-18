from db import execute_sql
import logging

def create_notification(user_id, text):
    execute_sql(
        """
        INSERT INTO notification (user_id, text)
        VALUES (%s, %s)
        """,
        (user_id, text)
    )

def get_notifications(user_id):
    result = execute_sql(
        """
        SELECT notification_id, text, date_time, is_read
        FROM notification
        WHERE user_id = %s
        ORDER BY date_time DESC
        LIMIT 20
        """,
        (user_id,), fetch_all=True
    )
    if not result:
        return []
    notifications = []
    for r in result:
        n = dict(r)
        n["date_time"] = n["date_time"].isoformat() if n["date_time"] else None
        notifications.append(n)
    return notifications

def mark_all_read(user_id):
    execute_sql(
        """
        UPDATE notification
        SET is_read = true
        WHERE user_id = %s AND is_read = false
        """,
        (user_id,)
    )

def get_unread_count(user_id):
    result = execute_sql(
        """
        SELECT COUNT(*) as count
        FROM notification
        WHERE user_id = %s AND is_read = false
        """,
        (user_id,), fetch_one=True
    )
    return result["count"] if result else 0