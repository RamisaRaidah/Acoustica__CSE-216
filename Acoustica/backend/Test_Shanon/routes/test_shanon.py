from flask import Blueprint, jsonify
import logging
import sys

from Test_Shanon.services import test_shanon

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

test_shanon_bp = Blueprint("test_shanon", __name__)

@test_shanon_bp.get("/api/test_shanon/health")
def health():
    return jsonify("test_shanon")

