from flask import Blueprint, jsonify
import logging
import sys

from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

storage_bp = Blueprint("storage", __name__)

@storage_bp.get("/api/storage/health")
def health():
    return jsonify("storage")
