from flask import Blueprint, jsonify
import logging
import sys

from Test_Arana.services import test_arana

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

test_arana_bp = Blueprint("test_arana", __name__)

@test_arana_bp.get("/api/test_arana/health")
def health():
    return jsonify("test_arana")

