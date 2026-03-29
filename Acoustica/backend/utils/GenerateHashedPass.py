import bcrypt
def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

password=input("Enter the password you want to hash: ")
hashed_pass=hash_password(password)
print(hashed_pass)