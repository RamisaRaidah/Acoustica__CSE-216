import bcrypt

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

choice = input("Do you want to (h)ash or (v)erify a password? ").strip().lower()

if choice == "h":
    password = input("Enter the password to hash: ")
    print("Hashed password:", hash_password(password))

elif choice == "v":
    password = input("Enter the plaintext password: ")
    hashed = input("Enter the hash to check against: ")
    if verify_password(password, hashed):
        print("✓ Password matches.")
    else:
        print("✗ Password does not match.")

else:
    print("Invalid choice. Enter 'h' or 'v'.")