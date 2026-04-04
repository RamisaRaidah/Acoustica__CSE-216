CREATE OR REPLACE PROCEDURE subscribe_user(
    p_user_id        INT,
    p_plan_id        INT,
    p_auto_renewal   VARCHAR(3),
    p_payment_method VARCHAR(10),
    p_amount         NUMERIC,
    OUT p_subscription_id  INT,
    OUT p_plan_type        VARCHAR,
    OUT p_start_date       DATE,
    OUT p_end_date         DATE,
    OUT p_plan_cost        NUMERIC,
    OUT p_error            TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_plan           RECORD;
    v_transaction_id INT;
BEGIN
    IF EXISTS (
        SELECT 1 FROM plan_subscription
        WHERE owner_id = p_user_id AND is_active = true
        FOR UPDATE
    ) THEN
        p_error := 'This user is already subscribed. Please cancel your existing subscription first';
        RETURN;
    END IF;

    SELECT plan_id, plan_type, plan_cost, plan_validity, max_members
    INTO v_plan
    FROM plan
    WHERE plan_id = p_plan_id;

    IF NOT FOUND THEN
        p_error := 'Invalid plan id';
        RETURN;
    END IF;

    IF p_amount != v_plan.plan_cost THEN
        p_error := 'Insufficient amount for this plan';
        RETURN;
    END IF;

    p_start_date := CURRENT_DATE;
    p_end_date   := CURRENT_DATE + v_plan.plan_validity;

    INSERT INTO transaction_history (user_id, transaction_type, amount, payment_method, status)
    VALUES (p_user_id, 'subscription', p_amount, p_payment_method::payment_method_enum, 'completed')
    RETURNING transaction_id INTO v_transaction_id;

    INSERT INTO plan_subscription (plan_id, owner_id, start_date, end_date, transaction_id, auto_renewal_mode, is_active)
    VALUES (p_plan_id, p_user_id, p_start_date, p_end_date, v_transaction_id, p_auto_renewal::auto_renew_enum, true)
    RETURNING subscription_id INTO p_subscription_id;

    UPDATE listener SET listener_type = 'premium'
    WHERE listener_id = p_user_id;

    p_plan_type := v_plan.plan_type;
    p_plan_cost := v_plan.plan_cost;
    p_error     := NULL;
END;
$$;