import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";


function Login() {


    const navigate = useNavigate();


    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");





    const handleLogin = async (e) => {


        e.preventDefault();


        setError("");



        try {


            const response = await fetch(

                "http://127.0.0.1:5000/api/auth/login",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },


                    body: JSON.stringify({

                        email: email,

                        password: password

                    })

                }

            );



            const data = await response.json();




            if (response.ok) {



                localStorage.setItem(

                    "token",

                    data.access_token

                );



                localStorage.setItem(

                    "admin",

                    JSON.stringify(data.admin)

                );



                navigate("/");


            }

            else {



                setError(

                    data.message || "Invalid login details"

                );


            }



        }

        catch (err) {


            setError(

                "Unable to connect with server"

            );


        }


    };






    return (


        <div className="login-page">


            <div className="login-card">



                <h1>

                    Smart Warehouse

                </h1>



                <p>

                    Administrator Login

                </p>





                {
                    error &&

                    <div className="error">

                        {error}

                    </div>

                }





                <form onSubmit={handleLogin}>


                    <input

                        type="email"

                        placeholder="Email"

                        value={email}

                        onChange={(e) => 
                            setEmail(e.target.value)
                        }

                        required

                    />




                    <input

                        type="password"

                        placeholder="Password"

                        value={password}

                        onChange={(e) =>
                            setPassword(e.target.value)
                        }

                        required

                    />





                    <button type="submit">

                        Login

                    </button>



                </form>






                <div className="register-link">


                    Don't have an account?


                    <span

                        onClick={() => navigate("/register")}

                    >

                        Create New Account

                    </span>



                </div>




            </div>


        </div>


    );


}



export default Login;