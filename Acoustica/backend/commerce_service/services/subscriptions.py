from datetime import date,timedelta
from psycopg2.extras import RealDictCursor
from db import execute_sql,get_db_connection,release_connection
import logging
import sys
from flask import request

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def get_plans():
    sql="""
            SELECT plan_id, plan_type,plan_cost,plan_validity, max_members 
            FROM plan
        """
    plans=execute_sql(sql, fetch_all=True)

    if plans is None:
        return {"error":"Failed to fetch subscription plans"},500
    
    return list(plans),200

def subscribe(user_id):
    data=request.get_json()
    plan_id=data.get("plan_id")
    payment_method=data.get("payment_method")
    auto_renewal=data.get("auto_renewal","off")

    if plan_id is None:
        logging.info("Plan id was not provided")
        return {"error":"plan_id is needed"},400

    connection=get_db_connection()
    if connection is None:
        return {"error":"DB connection failed"},500

    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    SELECT subscription_id 
                    FROM plan_subscription
                    WHERE owner_id = %s AND is_active = true
                    FOR UPDATE
                    """,
                    (user_id,)
                )
                active_sub = cursor.fetchone()
                if active_sub:
                    return {
                        "error": "This user is already subscribed. Please cancel your existing subscription first"
                    }, 409


                cursor.execute(
                    """
                    SELECT plan_id, plan_type, plan_cost, plan_validity, max_members
                    FROM plan
                    WHERE plan_id = %s
                    """,
                    (plan_id,)
                )
                plan = cursor.fetchone()
                if not plan:
                    logging.info("Plan id was invalid")
                    return {"error": "Invalid plan id"}, 404

                start_date = date.today()
                end_date = start_date + timedelta(days=plan["plan_validity"])

                cursor.execute(
                    """
                    INSERT INTO transaction_history (user_id, transaction_type, amount, payment_method, status)
                    VALUES (%s, 'subscription', %s, %s, 'completed')
                    RETURNING transaction_id
                    """,
                    (user_id, plan["plan_cost"], payment_method)
                )
                transaction = cursor.fetchone()
                transaction_id = transaction["transaction_id"]

                cursor.execute(
                    """
                    INSERT INTO plan_subscription (plan_id, owner_id, start_date, end_date, transaction_id, auto_renewal_mode,is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, true)
                    RETURNING subscription_id
                    """,
                    (plan_id, user_id, start_date, end_date, transaction_id, auto_renewal)
                )
                subscription = cursor.fetchone()
                subscription_id = subscription["subscription_id"]

                cursor.execute(
                    """
                    UPDATE listener SET listener_type = 'premium'
                    WHERE listener_id = %s
                    """,
                    (user_id,)
                )

        return {
            "message": "Subscription successful",
            "subscription_id": subscription_id,
            "plan_type": plan["plan_type"],
            "start_date": str(start_date),
            "end_date": str(end_date),
            "amount": float(plan["plan_cost"])
        }, 201
    except Exception as e:
        logging.error(f"Subscription failed: {e}")
        return {"error": "Subscription failed"}, 500

    finally:
        release_connection(connection)

def get_subscription_details(user_id):
    s_id="""
            SELECT subscription_id
            FROM plan_subscription
            WHERE owner_id=%s AND end_date>=CURRENT_DATE AND is_active=true
        """
    subscription = execute_sql(s_id, (user_id,), fetch_one=True)
    
    if not subscription:
        return {"error": "No active subscription found"}, 404

    subscription_id = subscription["subscription_id"]
    
    sql = """
        SELECT 
            ps.subscription_id,
            ps.start_date,
            ps.end_date,
            ps.auto_renewal_mode,
            p.plan_type,
            p.plan_cost,
            t.status,
            t.date_time as subscribed_at
        FROM plan_subscription ps
        JOIN plan p ON ps.plan_id = p.plan_id
        JOIN transaction_history t ON ps.transaction_id = t.transaction_id
        WHERE ps.subscription_id = %s AND ps.owner_id = %s
    """
    result = execute_sql(sql, (subscription_id, user_id), fetch_one=True)
    if not result:
        return {"error": "Subscription not found"}, 404
    return dict(result), 200

def delete_subscription(subscription_id, user_id):
    connection=get_db_connection()

    if connection is None:
        return {"error":"Database Connection failed"},500
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                                SELECT subscription_id 
                               FROM plan_subscription 
                               WHERE subscription_id=%s
                               AND owner_id=%s
                               """,(subscription_id, user_id))
                if not cursor.fetchone():
                    return {"error":"Subscription not found"},404
                
                cursor.execute("""
                                UPDATE plan_subscription 
                                SET end_date= CURRENT_DATE,
                                is_active=false
                                WHERE subscription_id=%s
                                AND end_date >= CURRENT_DATE
                                """,(subscription_id,))
                
                cursor.execute(
                    """
                    UPDATE listener 
                    SET listener_type = 'free' 
                    WHERE listener_id = %s
                    """,(user_id,)
                )

        return {"message": "Subscription cancelled"}, 200

    except Exception as e:
        logging.error(f"Cancellation failed: {e}")
        return {"error": "Cancellation failed"}, 500

    finally:
        release_connection(connection)


def set_auto_renewal(subscription_id, user_id):
    data = request.get_json()
    mode = data.get("auto_renewal")

    if mode not in ["on", "off"]:
        return {"error": "auto_renewal must be 'on' or 'off'"}, 400

    result = execute_sql(
        """
        UPDATE plan_subscription SET auto_renewal_mode = %s
        WHERE subscription_id = %s AND owner_id = %s
        RETURNING subscription_id
        """,
        (mode, subscription_id, user_id), fetch_one=True
    )
    if not result:
        return {"error": "Subscription not found"}, 404

    return {"message": f"Auto renewal set to {mode}"}, 200

### Helper functions ###