from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def add_product():
    return ("add_product")

def get_products():
    return ("get_products")

def get_product_details(product_id):
    return (f"get_product_details {product_id}")

def edit_product(product_id):
    return (f"edit_product {product_id}")

def remove_product(product_id):
    return (f"remove_product {product_id}")

def search_product():
    return ("search_product")

def get_cart_details(cart_id):
    return (f"get_cart_details {cart_id}")

def add_product_to_cart(cart_id,product_id):
    return (f"add_product_to_cart {cart_id} {product_id}")

def remove_product_from_cart(cart_id,product_id):
    return (f"remove_product_from_cart {cart_id} {product_id}")

def checkout(cart_id):
    return (f"checkout {cart_id}")

def get_order_details(cart_id):
    return (f"get_order_details {cart_id}")

def get_order_history():
    return ("get_order_history")

def get_orders():
    return ("get_orders")