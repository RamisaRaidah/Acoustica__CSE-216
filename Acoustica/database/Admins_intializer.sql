BEGIN;
WITH new_user as(
    INSERT INTO users
        (user_type,first_name,last_name,email,"password",
        bio,country_id,language_id,phone_number,gender,
        date_of_birth,theme,onboarding_done)
    VALUES ('admin',
            'Shadman',
            'Sami',
            'shadmansami.admin@gmail.com',
            '$2b$12$30l/Yw8TC0qHAqLjHIrdu./.rn2kV.6XiSQ5naPRw0efErzAYQC5i',
            'Admin Shadman Sami',
            14,
            10,
            '0100000',
            'Male',
            '2003-06-18',
            'dark',
            true
            )
            RETURNING user_id    
        )

INSERT INTO admin (admin_id, role)
SELECT user_id, 'super_admin'
FROM new_user;

COMMIT;


BEGIN;
WITH new_user as(
    INSERT INTO users
        (user_type,first_name,last_name,email,"password",
        bio,country_id,language_id,phone_number,gender,
        date_of_birth,theme,onboarding_done)
    VALUES ('admin',
            'Ramisa',
            'Raidah Arana',
            'ramisaraidah.admin@gmail.com',
            '$2b$12$iePpT9Ub11EcgFSO/OIfCuc9wlUa9bSZQQjjdH.Gl5jyhgStLLxFO',
            'Admin Ramisa Raidah',
            14,
            10,
            '0100000',
            'Female',
            '2003-10-05',
            'dark',
            true
            )
            RETURNING user_id    
        )

INSERT INTO admin (admin_id, role)
SELECT user_id, 'super_admin'
FROM new_user;

COMMIT;