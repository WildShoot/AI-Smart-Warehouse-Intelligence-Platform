import { useEffect, useState } from "react";

import {
    UserCircle,
    Mail,
    Shield,
    Calendar,
    Lock
} from "lucide-react";

import "./Account.css";


function Account() {


    const [admin, setAdmin] = useState(null);


    const [oldPassword,setOldPassword] = useState("");
    const [newPassword,setNewPassword] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");


    const [message,setMessage] = useState("");
    const [error,setError] = useState("");



    const token = localStorage.getItem("token");



    useEffect(()=>{


        const loadProfile = async()=>{


            const response = await fetch(

                "http://127.0.0.1:5000/api/auth/profile",

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );


            const data = await response.json();


            if(response.ok){

                setAdmin(data.admin);

            }


        }



        loadProfile();


    },[]);





    const changePassword = async(e)=>{


        e.preventDefault();


        setMessage("");
        setError("");



        if(newPassword !== confirmPassword){

            setError("New passwords do not match");

            return;

        }



        const response = await fetch(

            "http://127.0.0.1:5000/api/auth/change-password",

            {

                method:"PUT",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:`Bearer ${token}`

                },


                body:JSON.stringify({

                    old_password:oldPassword,

                    new_password:newPassword

                })

            }

        );


        const data = await response.json();



        if(response.ok){

            setMessage(
                "Password updated successfully"
            );


            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

        }

        else{

            setError(data.message);

        }


    };




    return(


        <div className="account-page">


            <h1>
                Account Management
            </h1>


            <p className="account-subtitle">

                Manage your profile and security settings

            </p>




            <div className="account-grid">



                {/* PROFILE CARD */}


                <div className="account-card profile-card">


                    <h2>
                        Profile Information
                    </h2>


                    <p>
                        Your administrator details
                    </p>



                    <UserCircle
                        size={90}
                        className="profile-icon"
                    />



                    <h2>

                        {admin?.name}

                    </h2>



                    <span className="role-badge">

                        Administrator

                    </span>



                    <hr />



                    <div className="info-row">

                        <Mail/>

                        <span>
                            {admin?.email}
                        </span>

                    </div>



                    <div className="info-row">

                        <Shield/>

                        <span>
                            {admin?.role}
                        </span>

                    </div>



                    <div className="info-row">

                        <Calendar/>

                        <span>
                            September 2026
                        </span>

                    </div>


                </div>






                {/* PASSWORD CARD */}


                <div className="account-card">


                    <h2>
                        Change Password
                    </h2>


                    <p>
                        Update your account password
                    </p>



                    {
                        message &&
                        <div className="success">
                            {message}
                        </div>
                    }



                    {
                        error &&
                        <div className="error">
                            {error}
                        </div>
                    }



                    <form onSubmit={changePassword}>


                        <label>
                            Current Password
                        </label>


                        <div className="input-box">

                            <Lock/>

                            <input

                                type="password"

                                placeholder="Enter your current password"

                                value={oldPassword}

                                onChange={
                                    e=>setOldPassword(e.target.value)
                                }

                            />

                        </div>




                        <label>
                            New Password
                        </label>


                        <div className="input-box">

                            <Lock/>

                            <input

                                type="password"

                                placeholder="Enter your new password"

                                value={newPassword}

                                onChange={
                                    e=>setNewPassword(e.target.value)
                                }

                            />

                        </div>





                        <label>
                            Confirm New Password
                        </label>


                        <div className="input-box">

                            <Lock/>


                            <input

                                type="password"

                                placeholder="Confirm your new password"

                                value={confirmPassword}

                                onChange={
                                    e=>setConfirmPassword(e.target.value)
                                }

                            />


                        </div>




                        <button>

                            Update Password

                        </button>


                    </form>


                </div>



            </div>


        </div>


    )

}


export default Account;