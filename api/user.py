from flask import *
import api.mysql_connector as connector
from dotenv import load_dotenv
import os
import jwt
from flask_bcrypt import Bcrypt
load_dotenv() 
bcrypt = Bcrypt()
JWT_KEY =os.getenv("JWT_KEY")
jwt_key = JWT_KEY

user = Blueprint(
  "user", 
  __name__, 
  static_folder="static", 
  template_folder="templates")

cnxpool = connector.connect()

# ----------------- Register ---------------------

@user.route("/api/user", methods=["POST"])
def register():
  try:
    connection = cnxpool.get_connection()
    cursor = connection.cursor()

    data = request.get_json()
    input_name = data["name"]
    input_email = data["email"]
    input_password = data["password"]

    sql = """
      SELECT user.email 
      FROM user 
      WHERE email = %s;
      """
    values = (input_email,)
    cursor.execute(sql, values)
    emailData = cursor.fetchone()

    if not input_name or not input_email or not input_password:
      return {
        "error": True,
        "message": "empty input"
      }, 400
    elif not emailData:
      hashed_password = bcrypt.generate_password_hash(input_password)
      sql = """
        INSERT INTO user(name, email, password) 
        VALUES (%s, %s, %s)
        """
      values = (input_name, input_email, hashed_password)
      cursor.execute(sql, values)
      connection.commit()
      return {
        "ok": True
      }, 200
    else:
      return {
        "error": True,
        "message": "email already exists"
      }, 400
  except:
    return {
      "error": True,
      "message": "error"
    }, 500
  finally:
    cursor.close()
    connection.close()


# ---------- Check if user is logged in -------------

@user.route("/api/user/auth", methods=["GET"])
def logged_in_user_info():
  try:
    cookieExist = request.cookies
    if cookieExist:
      encoded_jwt= request.cookies.get("token")
      decoded_jwt = jwt.decode(encoded_jwt, jwt_key, algorithms="HS256")
      return decoded_jwt, 200
    else:
      return {"data": None}
  except jwt.exceptions.InvalidTokenError:
    return {"data": None}


# ---------------- Login ---------------------

@user.route("/api/user/auth", methods=["PUT"])
def login():
  try:
    connection = cnxpool.get_connection()
    cursor = connection.cursor()

    data = request.get_json()
    input_email = data["email"]
    input_password = data["password"]

    sql = """
      SELECT * 
      FROM user 
      WHERE email= %s
      """
    values = (input_email,)
    cursor.execute(sql, values)
    userData = cursor.fetchone()

    if not input_email or not input_email:
      return {
        "error": True,
        "message": "empty input"
      }, 400
    
    if userData:
      if bcrypt.check_password_hash(userData[3], input_password):
        payload = {
        "id": userData[0],
        "name": userData[1],
        "email": userData[2]
        }
        encoded_jwt = jwt.encode(payload, jwt_key, algorithm="HS256")
        response = make_response({"ok": True})
        response.set_cookie(key="token", value=encoded_jwt, max_age=24*60*60*7)
        return response, 200
      else:
        return {
        "error": True,
        "message": "email or password is incorrect"
      }, 400
    else:
        return {
        "error": True,
        "message": "email or password is incorrect"
      }, 400
  except:
    return {
      "error": True,
      "message": "error"
    }
  finally:
    cursor.close()
    connection.close()
  

# ------------------- Logout -------------------

@user.route("/api/user/auth", methods=["DELETE"])
def logout():
  response = make_response({"ok": True})
  response.delete_cookie("token")
  return response, 200