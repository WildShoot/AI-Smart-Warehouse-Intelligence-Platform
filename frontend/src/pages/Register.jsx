import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";


function Register(){


    const navigate = useNavigate();


    const [name,setName]=useState("");

    const [email,setEmail]=useState("");

    const [password,setPassword]=useState("");


    const [message,setMessage]=useState("");



    const register = async(e)=>{


        e.preventDefault();



        const response = await fetch(

            "http://127.0.0.1:5000/api/auth/register",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },


                body:JSON.stringify({

                    name,

                    email,

                    password

                })

            }

        );



        const data = await response.json();



        if(response.ok){


            setMessage(
                "Account created successfully"
            );


            setTimeout(()=>{

                navigate("/login");

            },1500);


        }

        else{

            setMessage(data.message);

        }


    };




    return(


        <div className="login-page">


            <div className="login-card">


                <h1>
                    Create Account
                </h1>


                <p>
                    Register Administrator
                </p>




                <form onSubmit={register}>


                    <input

                        placeholder="Full Name"

                        value={name}

                        onChange={
                            e=>setName(e.target.value)
                        }

                    />



                    <input

                        placeholder="Email"

                        type="email"

                        value={email}

                        onChange={
                            e=>setEmail(e.target.value)
                        }

                    />



                    <input

                        placeholder="Password"

                        type="password"

                        value={password}

                        onChange={
                            e=>setPassword(e.target.value)
                        }

                    />




                    <button>

                        Create Account

                    </button>


                </form>




                <p>

                    {message}

                </p>



                <div className="register-link">


                    Already have account?


                    <span

                        onClick={()=>navigate("/login")}

                    >

                        Login

                    </span>


                </div>



            </div>


        </div>


    )

}


export default Register;