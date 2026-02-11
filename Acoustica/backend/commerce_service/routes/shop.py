from flask import Blueprint, jsonify
import logging

from commerce_service.services import shop

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

shop_bp = Blueprint("shop", __name__) 

@shop_bp.get("/api/shop/health")
def health():
    return jsonify("shop")

@shop_bp.post("/api/shop")
def add_product_route():
    return jsonify("add_product")

@shop_bp.get("/api/shop")
def get_products_route():
    return jsonify("get_products")

@shop_bp.get("/api/shop/<product_id>")
def get_product_details_route(product_id):
    return jsonify(f"get_product_details {product_id}")

@shop_bp.put("/api/shop/<product_id>")
def edit_product_route(product_id):
    return jsonify(f"edit_product {product_id}")

@shop_bp.delete("/api/shop/<product_id>")
def remove_product_route(product_id):
    return jsonify(f"remove_product {product_id}")

@shop_bp.get("/api/shop/search")
def search_product_route():
    return jsonify("search_product")

@shop_bp.get("/api/shop/carts/<cart_id>")
def get_cart_details_route(cart_id):
    return jsonify(f"get_cart_details {cart_id}")

@shop_bp.post("/api/shop/carts/<cart_id>/items/<product_id>")
def add_product_to_cart_route(cart_id,product_id):
    return jsonify(f"add_product_to_cart {cart_id} {product_id}")

@shop_bp.delete("/api/shop/carts/<cart_id>/items/<product_id>")
def remove_product_from_cart_route(cart_id,product_id):
    return jsonify(f"remove_product_from_cart {cart_id} {product_id}")

@shop_bp.post("/api/shop/carts/<cart_id>/checkout")
def checkout_route(cart_id):
    return jsonify(f"checkout {cart_id}")

@shop_bp.get("/api/shop/orders/<cart_id>")
def get_order_details_route(cart_id):
    return jsonify(f"get_order_details {cart_id}")

@shop_bp.get("/api/shop/orders/me")
def get_order_history_route():
    return jsonify("get_order_history")

@shop_bp.get("/api/shop/orders")
def get_orders_route():
    return jsonify("get_orders")