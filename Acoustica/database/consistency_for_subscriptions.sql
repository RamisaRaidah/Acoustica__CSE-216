--To ensure that we only get one active subsccription for one user at a time
CREATE UNIQUE INDEX unique_active_subscription
ON plan_subscription(owner_id)
WHERE is_active = TRUE;