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

    if payment_method not in ["bank", "card", "online"]:
        logging.error("Invalid payment method")
        return {"error":"Invalid payment method"},400
    
    if auto_renewal not in ["on", "off"]:
        return {"error": "auto_renewal must be 'on' or 'off'"}, 400

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
            WHERE owner_id=%s 
            AND end_date>=CURRENT_DATE 
            AND is_active=true
        """
    
    family_s_id="""
                    SELECT s.subscription_id,f.parent_account_id
                    FROM family_member fm
                    JOIN family f ON f.family_id=fm.family_id
                    JOIN plan_subscription s ON s.subscription_id=f.subscription_id 
                    WHERE fm.member_id=%s 
                    AND s.end_date>=CURRENT_DATE 
                    AND s.is_active=true
                """
    subscription = execute_sql(s_id, (user_id,), fetch_one=True)
    
    if not subscription:
        subscription = execute_sql(family_s_id, (user_id,), fetch_one=True)
        if subscription: 
            user_id=subscription["parent_account_id"]
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
                               AND end_date >= CURRENT_DATE
                               """,(subscription_id, user_id))
                if not cursor.fetchone():
                    return {"error":"Subscription not found"},404
                
                cursor.execute("""
                                UPDATE plan_subscription 
                                SET end_date= CURRENT_DATE,
                                is_active=false
                                WHERE subscription_id=%s
                                AND owner_id=%s
                                AND end_date >= CURRENT_DATE
                                """,(subscription_id,user_id,))
                
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

def leave_family(user_id):
    connection=get_db_connection()

    if connection is None:
        return {"error":"Database Connection failed"},500
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                        SELECT f.family_id, f.parent_account_id
                        FROM family_member fm
                        JOIN family f ON f.family_id=fm.family_id
                        JOIN plan_subscription s ON s.subscription_id=f.subscription_id 
                        WHERE fm.member_id=%s 
                        AND s.end_date>=CURRENT_DATE 
                        AND s.is_active=true
                    """,(user_id,)
                )
                family=cursor.fetchone()

                if not family:
                    return {"error":"No family found"},404
                
                
                f_id=family["family_id"]
                owner_id=family["parent_account_id"]

                if owner_id==user_id:
                    return {"error":"Family owner cannot leave the family without deleting subscription for all"},403

                cursor.execute(
                    """
                        DELETE FROM family_member
                        WHERE family_id=%s
                        AND member_id=%s
                    """,(f_id,user_id)
                )

                cursor.execute(
                    """
                    UPDATE listener 
                    SET listener_type = 'free' 
                    WHERE listener_id = %s
                    """,(user_id,)
                )

        return {"message": "Successfully left family"}, 200
    except Exception as e:
            logging.error(f"Mission family abandonment failed {e}")
            return {"error":"Leaving family failed"},500
    finally:
        release_connection(connection)


def my_family(user_id):
    sql="""
            SELECT f.family_id
            FROM family_member fm
            JOIN family f ON f.family_id=fm.family_id
            JOIN plan_subscription s ON s.subscription_id=f.subscription_id 
            WHERE fm.member_id=%s 
            AND s.end_date>=CURRENT_DATE 
            AND s.is_active=true
        """
    
    family=execute_sql(sql,(user_id,),fetch_one=True)
    if not family:
        return {"error": "No family found"},404
    f_id=family["family_id"]

    sql2="""
            SELECT family_id, member_id
            FROM family_member
            WHERE family_id=%s
        """
    result=execute_sql(sql2,(f_id,),fetch_all=True)
    return [dict(r) for r in result], 200

def add_members(user_id,user2_id):
    connection=get_db_connection()

    if connection is None:
        return {"error":"DB connection failed"},500
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                                SELECT f.family_id, COUNT(fm.member_id) AS members,s.plan_id
                                FROM family_member fm
                                JOIN family f ON f.family_id=fm.family_id
                                JOIN plan_subscription s ON s.subscription_id=f.subscription_id 
                                WHERE f.parent_account_id=%s 
                                AND s.end_date>=CURRENT_DATE 
                                AND s.is_active=true
                                GROUP BY f.family_id, s.plan_id
                            """,(user_id,))
                
    
                family=cursor.fetchone()
                if not family:
                    return {"error": "No family found"},404
                f_id=family["family_id"]
                cnt=family["members"]
                p_id=family["plan_id"]

                cursor.execute("""
                                    SELECT max_members
                                    FROM plan
                                    WHERE plan_id=%s
                                """,(p_id,))
                plan=cursor.fetchone()
                mx=plan["max_members"]
                if cnt>=mx:
                    return {"error":"You have already added the maxmimum possible members"},409
                cursor.execute("""
                            SELECT subscription_id
                            FROM plan_subscription
                            WHERE owner_id=%s 
                            AND end_date>=CURRENT_DATE 
                            AND is_active=true  
                            """,(user2_id,))
                
                if cursor.fetchone():
                    return {"error":"This user already has a subscription"},409

                cursor.execute("""
                                    SELECT s.subscription_id
                                    FROM family_member fm
                                    JOIN family f ON f.family_id=fm.family_id
                                    JOIN plan_subscription s ON s.subscription_id=f.subscription_id 
                                    WHERE fm.member_id=%s 
                                    AND s.end_date>=CURRENT_DATE 
                                    AND s.is_active=true

                                """,(user2_id,))
                if cursor.fetchone():
                    return {"error":"This user is already part of a family"},409

                cursor.execute("""
                                INSERT INTO family_member (family_id,member_id)
                                VALUES( %s, %s)
                                """,(f_id,user2_id))
        return {"message": "Member added successfully"}, 200
    except Exception as e:
            logging.error(f"Member was not added {e}")
            return {"error":"New member addition failed"},500
    finally:
        release_connection(connection)

### Helper functions ###