from flask import Blueprint, render_template, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

shop = Blueprint("shop", __name__) 

@shop.route("/shop")
def shop_home():
    return jsonify("shop")

@shop.post("/api/shop")
def add_product():
    return jsonify("add_product")

@shop.get("/api/shop")
def get_products():
    return jsonify("get_products")

@shop.get("/api/shop/<product_id>")
def get_product_details(product_id):
    return jsonify(f"get_product_details {product_id}")

@shop.put("/api/shop/<product_id>")
def edit_product(product_id):
    return jsonify(f"edit_product {product_id}")

@shop.delete("/api/shop/<product_id>")
def remove_product(product_id):
    return jsonify(f"remove_product {product_id}")

@shop.get("/api/shop/carts/<cart_id>")
def view_cart(cart_id):
    return jsonify(f"view_cart {cart_id}")

@shop.post("/api/shop/carts/<cart_id>/items/<product_id>")
def add_product_to_cart(cart_id,product_id):
    return jsonify(f"add_product_to_cart {cart_id} {product_id}")

@shop.delete("/api/shop/carts/<cart_id>/items/<product_id>")
def remove_product_from_cart(cart_id,product_id):
    return jsonify(f"remove_product_from_cart {cart_id} {product_id}")

@shop.post("/api/shop/carts/<cart_id>/checkout")
def checkout(cart_id):
    return jsonify(f"checkout {cart_id}")

@shop.get("/api/shop/search")
def search_product():
    return jsonify("search_product")

@shop.get("/api/shop/orders/me")
def get_order_history():
    return jsonify("get_order_history")

@shop.get("/api/shop/orders/<cart_id>")
def get_order_details(cart_id):
    return jsonify(f"get_order_details {cart_id}")

@shop.get("/api/shop/orders")
def get_orders():
    return jsonify("get_orders")