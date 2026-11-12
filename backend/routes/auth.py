from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from bson.objectid import ObjectId

from database.mongodb import db


auth_bp = Blueprint("auth", __name__)


# =================================================
# ADMIN REGISTRATION
# =================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()


    if not data:

        return jsonify({

            "status": "error",

            "message": "No data provided"

        }), 400



    required_fields = [

        "name",
        "email",
        "password"

    ]


    for field in required_fields:

        if field not in data or not data[field]:

            return jsonify({

                "status": "error",

                "message": f"{field} is required"

            }), 400



    # Check existing admin

    existing_admin = db.admins.find_one({

        "email": data["email"]

    })


    if existing_admin:

        return jsonify({

            "status": "error",

            "message": "Admin with this email already exists"

        }), 409



    # Hash password

    hashed_password = generate_password_hash(

        data["password"]

    )



    admin = {

        "name": data["name"],

        "email": data["email"],

        "password": hashed_password,

        "role": "admin"

    }



    result = db.admins.insert_one(admin)



    return jsonify({

        "status": "success",

        "message": "Administrator registered successfully",

        "admin_id": str(result.inserted_id)

    }), 201





# =================================================
# ADMIN LOGIN
# =================================================

@auth_bp.route("/login", methods=["POST"])
def login():


    data = request.get_json()



    if not data:


        return jsonify({

            "status": "error",

            "message": "No login data provided"

        }), 400




    email = data.get("email")

    password = data.get("password")



    if not email or not password:


        return jsonify({

            "status": "error",

            "message": "Email and password are required"

        }), 400




    # Find admin

    admin = db.admins.find_one({

        "email": email

    })



    if not admin:


        return jsonify({

            "status": "error",

            "message": "Invalid email or password"

        }), 401




    # Check password

    password_correct = check_password_hash(

        admin["password"],

        password

    )



    if not password_correct:


        return jsonify({

            "status": "error",

            "message": "Invalid email or password"

        }), 401




    # Generate JWT Token

    access_token = create_access_token(

        identity=str(admin["_id"]),

        additional_claims={

            "role": admin["role"],

            "email": admin["email"]

        }

    )



    return jsonify({

        "status": "success",

        "message": "Login successful",

        "access_token": access_token,


        "admin": {


            "name": admin["name"],

            "email": admin["email"],

            "role": admin["role"]

        }


    }), 200





# =================================================
# GET ADMIN PROFILE
# =================================================

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():


    try:


        admin_id = get_jwt_identity()



        admin = db.admins.find_one({

            "_id": ObjectId(admin_id)

        })



        if not admin:


            return jsonify({

                "status": "error",

                "message": "Admin not found"

            }), 404




        return jsonify({

            "status": "success",

            "admin": {


                "name": admin["name"],

                "email": admin["email"],

                "role": admin.get(

                    "role",

                    "admin"

                )

            }


        }), 200



    except Exception as e:


        return jsonify({

            "status": "error",

            "message": str(e)

        }), 500





# =================================================
# CHANGE PASSWORD
# =================================================

@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():


    try:


        admin_id = get_jwt_identity()



        data = request.get_json()



        old_password = data.get(

            "old_password"

        )


        new_password = data.get(

            "new_password"

        )




        if not old_password or not new_password:


            return jsonify({

                "status": "error",

                "message":
                "Old password and new password are required"

            }), 400





        admin = db.admins.find_one({

            "_id": ObjectId(admin_id)

        })




        if not admin:


            return jsonify({

                "status": "error",

                "message": "Admin not found"

            }), 404





        # Verify old password


        if not check_password_hash(

            admin["password"],

            old_password

        ):


            return jsonify({

                "status": "error",

                "message": "Old password is incorrect"

            }), 401





        # Hash new password


        new_hashed_password = generate_password_hash(

            new_password

        )




        db.admins.update_one(

            {

                "_id": ObjectId(admin_id)

            },


            {

                "$set": {

                    "password": new_hashed_password

                }

            }

        )




        return jsonify({

            "status": "success",

            "message": "Password updated successfully"

        }), 200




    except Exception as e:


        return jsonify({

            "status": "error",

            "message": str(e)

        }), 500