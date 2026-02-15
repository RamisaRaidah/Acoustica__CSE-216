from flask import Blueprint, jsonify
import logging

from Test_Arana.services import test_arana

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

test_arana_bp = Blueprint("test_arana", __name__)

@test_arana_bp.get("/api/test_arana/health")
def health():
    return jsonify("test_arana")

