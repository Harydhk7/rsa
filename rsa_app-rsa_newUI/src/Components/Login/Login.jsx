import React, { useEffect, useState } from "react";
import { FaRegCopyright } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useForm } from "react-hook-form";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import logo from "../../Assets/logo.png";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { Backdrop, CircularProgress } from "@mui/material";
import { url1 } from "../../App"
import AxiosApp from "../../common/AxiosApp";

function Login() {
  const mapLabels = new Map()
  mapLabels.set("auditor", "Auditor")
  mapLabels.set("lead auditor", "PIU")
  mapLabels.set("ae", "AE/IE")
  mapLabels.set("owner", "RO")
  mapLabels.set("coers", "COERS")
  mapLabels.set("fielduser", "Field User")

  localStorage.clear()
  const [showtc, showTC] = React.useState(false);
  function setHideTC() { showTC(false) }
  function setShowTC() { showTC(true) }

  const [show, setShow] = React.useState(false);
  const [alertOpen, setAlert] = useState(false);
  const [alMsg, setalMsg] = useState("");
  const handleClick = () => setShow(!show);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();

  const [loadern, setLoadern] = useState(false);
  const style2 = {
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    height: '45%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  function closeDialog2() {
    setHideTC();
  }
  const onSubmit = async (data) => {
    setLoadern(true);
    console.log(data);
    let body = {
      enter_id: data.userid,
      password: data.password,
    };
    let headers = {
      "Accept":"*/*"
      // "Content-Type": "application/json",
      // "Allow": "OPTIONS, HEAD, POST, GET",
      // "Access-Control-Allow-Origin": "*",
      // "Access-Control-Allow-Headers": "access-control-allow-methods, access-control-allow-origin, content-type",
      // "Access-Control-Allow-Methods": "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
    }
    console.log(data);
    let role = ""

    AxiosApp.post(url1 + "login", body,
      //{headers:headers}
    )
      .then((response) => {
        setLoadern(false);
        if (response.data.statusCode == "200") {
          console.log(response);
          role = response.data?.role.toLowerCase();
          //role = "fielduser";
          localStorage.setItem("rsa_type", role)
          localStorage.setItem("rsa_type_label",role)
          // localStorage.setItem("rsa_type_label", mapLabels.get(role.toLocaleLowerCase()))
          let l1 = response.data.user_id;

          if (role != 'auditor') {
            localStorage.setItem("rsa_user", l1) //"coersuser1")
          } else {
            localStorage.setItem("rsa_user1", l1) //"Raju9867")
          }
          localStorage.setItem("rsaLogged", l1)
          //navigate('/Ae_dashboard')
          
          
          if (role == 'auditor') {
            navigate('/Auditor_dashboard')
          } else if(role=="ae") {
            navigate('/Ae_dashboard')
          } else if(role=="field user") {
            navigate('/fe_audit')
          }else {
            navigate('/Dashboard')
          }
        } else {
          setAlert(true);
          setalMsg(response.data?.status)
        }
      })
      .catch((error) => {
        setLoadern(false);
        setAlert(true);
        setalMsg("Technical issues, could not login, pls contact administrator");
      });

  };
  let filter =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  //   console.log(errors, errors);
  const [forget, setForgetModal] = useState(false);
  const [forgetText, setForgetText] = useState("");

  const onSubmitForget = async () => {
    const body = {
      user_id: forgetText,
    };
    try {
      const response = await AxiosApp.post(url1 + "forgot_password", body);
      if (response.data.statusCode == 200) {
        console.log(response, "forrr");
        // setOpensuccess(true);
        alert("Please Check your Registered Email ID for Password");
        // alert("Please Check your Registered Email ID for Password");
        setForgetModal(false);
        // navigate("/");
      } else {
        // setOpen(true);
        // setstatusmsg(response.data.message);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#E6F3FF",
        width: "100%",
        height: "98vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      className="login_pms"
    >
      <div
        style={{
          background:
            "radial-gradient(116.77% 114.7% at 103.63% 101.11%, #0B5787 0%, #031521 100%)",
          width: "90%",
          height: "90vh",
          borderRadius: "20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          padding: "30px",
        }}
        className="login_pms_parent"
      >
        <div className="pms_login_left">
          <div
            style={{
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              backgroundColor: "white",
              position: "relative",
              top: "-34px",
            }}
            className="logo_pms"
          >
            <img
              style={{ height: "300px", width: "300px" }}
              src={logo}
              alt="logo"
            />
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: "800",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            className="pms_title"
          >
            <p>RSSA</p>
            <h6>version 1.0.0.35</h6>
          </div>
        </div>
        <div className="login_pms_container">
          <p style={{ fontSize: "24px", fontWeight: "700", color: "#071018" }}>
            Login
            <br />
          </p>
          <p style={{ fontSize: "16px", color: "#2F2F31" }}>
            Please login to use the Application
          </p>
          <div style={{ marginTop: "15px" }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    marginLeft: "0px",
                  }}
                >
                  UserId
                </p>
                <input
                  style={{
                    borderRadius: "10px",
                    height: "30px",
                    border: "3px solid rgba(216, 220, 228, 1)",
                    padding: "10px",
                  }}
                  placeholder="Enter User Id"
                  size="lg"
                  {...register("userid", {
                    required: "User ID is required",
                    minLength: {
                      value: 4,
                      message: "Minimum length should be 4",
                    },
                    pattern: {
                      //value: filter,
                      message: "Invalid User ID",
                    },
                  })}
                />
                <p className="error_message">
                  {errors.userid && errors.userid.message}
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    marginLeft: "0px",
                  }}
                >
                  Password
                </p>
                {/* <InputGroup size="lg"> */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <input
                    style={{
                      borderRadius: "10px",
                      height: "30px",
                      border: "3px solid rgba(216, 220, 228, 1)",
                      padding: "10px",
                    }}
                    pr="4.5rem"
                    type={show ? "text" : "password"}
                    placeholder="Enter password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 4,
                        message: "Minimum length should be 4",
                      },
                    })}
                  />
                  {/* <InputRightElement width="4.5rem"> */}
                  <Button
                    style={{
                      position: "absolute",
                      right: "10px",
                    }}
                    h="1.75rem"
                    size="sm"
                    onClick={handleClick}
                  >
                    {show ? "Hide" : "Show"}
                  </Button>
                </div>
                {/* </InputRightElement> */}
                {/* </InputGroup> */}
                <p className="error_message">
                  {errors.password && errors.password.message}
                </p>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  {/* <Checkbox 
                                    placeholder='checkbox' {...register("checkbox", {
                                        required: "Please check this box if you want to proceed.",
                                    
                                    })} {...label} >

                                    </Checkbox> */}
                  <input
                    type="checkbox"
                    placeholder="checkbox"
                    {...register("checkbox", {
                      required: "Please Accept the terms and conditions.",
                    })}
                    style={{ margin: "5px" }}
                  />
                  <p
                    onClick={setShowTC}
                    style={{ color: "rgba(48, 107, 255, 1)" }}>
                    {"    "}
                    I agree to the Terms and Condition
                  </p>
                </div>
                <p className="error_message">
                  {errors.checkbox && errors.checkbox.message}
                </p>
              </div>
              <Button
                disabled={loadern}
                style={{
                  marginTop: "20PX",
                  width: "100%",
                  background:
                    "radial-gradient(116.77% 114.7% at 103.63% 101.11%, #0B5787 0%, #031521 100%)",
                }}
                variant="contained"
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
              // onClick={() => navigate("/Trauma_Registry_Fields")}
              >
                {!loadern ? (
                  "Login"
                ) : (
                  <CircularProgress
                    style={{ width: "20px", height: "20px", color: "white" }}
                  />
                )}
              </Button>
              <p
                style={{
                  textAlign: "end",
                  marginTop: "20px",
                  color: "rgba(48, 107, 255, 1)",
                  cursor: "pointer",
                }}
                onClick={() => setForgetModal(true)}
              >
                Forgot password
              </p>
              <br />
            </form>
            {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <p
                                style={{
                                    color: 'rgba(48, 107, 255, 1)',
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    marginTop: "12px",
                                    // float: "right",
                                    cursor: "pointer",
                                }}
                                onClick={() => navigate("/signup")}
                            >
                                Sign Up
                            </p>
                            <p
                                style={{
                                    color: 'rgba(48, 107, 255, 1)',
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    marginTop: "12px",
                                    // float: "right",
                                }}
                            >
                                Forgot Password?
                            </p>
                        </div> */}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "0px",
              color: "#095399",
              fontSize: "13px",
              display: "flex",
              paddingBottom: '10px',
              width: "85%",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* <p style={{ color: 'rgba(48, 107, 255, 1)' }}>version 1.0.0.35</p>
                        <a href="https://rbg.iitm.ac.in" target="_blank"  
                        style={{ color: 'rgba(48, 107, 255, 1)' }}>
                          Designed & Developed by RBG Labs , IIT Madras</a> */}


            <p style={{ display: "flex", alignItems: "center", color: 'rgba(48, 107, 255, 1)' }}>
              <FaRegCopyright style={{ color: 'rgba(48, 107, 255, 1)' }} />
              {new Date().getFullYear()} RBG Labs
            </p>
          </div>
        </div>
      </div>
      {alertOpen && (
        <Modal
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          open={alertOpen}
        >
          <div
            style={{
              background: "white",
              width: "auto",
              padding: "30px",
              borderRadius: "10px",
            }}
          >
            <p>{alMsg}</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
              }}
            >
              <button
                onClick={() => setAlert(false)}
                style={{
                  padding: "5px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  width: "63px",
                  color: "white",
                  background:
                    "linear-gradient(86.78deg, #3D63DD 0.6%, #181F38 109.96%)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
      {forget && (
        <Box
          style={{
            width: "300px",
            height: "200px",
            backgroundColor: "white",
            position: "absolute",
            top: "39%",
            zIndex: "1000",
            boxShadow:
              "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            borderRadius: "10px",
            padding: "10px",
          }}
        >
          <p style={{ fontSize: "17px", fontWeight: 700, textAlign: "center" }}>
            Forgot Password
          </p>
          <p
            style={{
              position: "absolute",
              top: "10px",
              right: "9px",
              cursor: "pointer",
            }}
            onClick={() => setForgetModal(false)}
          >
            X
          </p>
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "10px",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="UserId"
              label="User ID"
              autoFocus
              value={forgetText}
              onChange={(e) => setForgetText(e.target.value)}
            // helperText={errors.email ? errors.email.message : ''}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              // color="primary"
              style={{
                borderRadius: "10px",
                fontSize: "16px",
              }}
              onClick={onSubmitForget}
            >
              Submit
            </Button>
          </Box>
        </Box>
      )}
      {showtc && <Modal
        size="sm"
        open={setShowTC}
        onClose={setHideTC}
        disableEscapeKeyDown={true}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style2}>
          <Typography id="create-case-modal-modal-title" variant="h6" component="h2" style={{ color: 'black' }}>
            <b>Privacy Policy and Terms of use </b>
          </Typography>
          {/* <div style={{fontFamily:'sans-serif',color:'black',fontSize:'14px',height:'80%'}}>
            <div style={{overflow:'scroll',height:'100%',listStylePosition:'inside'}}>
          <p style={{color:'black', fontFamily:'sans-serif', justifyContent:'left',textAlign:'left'}}>
          By downloading and using this app, you agree to comply with the terms and conditions outlined below by Centre of Excellence for Road Safety, RBG Labs, IIT Madras who will be referred as Data Fiduciary hereafter. 
          </p>
          <ol type="1" style={{textAlign:'left',fontFamily:'sans-serif'}}>
            <li>Privacy Policy 
              <ol type="a">
                <li>App may require some details like email id, phone numbers, hospital infrastructure information, human resources information and other information related to trauma care as required for doing analytics. Information provided by you will not be shared with the third party without permission of competent authority. </li>
                <li>Users are responsible for ensuring the accuracy and completeness of the data provided through the app. The app developer is not liable for any inaccuracies, errors, or omissions in the data provided by the user. So please provide all the information on the application with utmost accuracy and truthfulness so that the purpose of the application should be served. </li>
                <li>As data fiduciary, we are committed to protecting your data and will implement appropriate security measures to safeguard user information from unauthorized access, alteration, or disclosure. </li>
              </ol>
            </li>
            <br/>
            <li>
            Application Access and Permissions-The application may require access to your camera, location services and files to enable its features or functionalities. By granting access, you allow this application to utilise these services as part of intended functionality.  
            </li>
            <br/>
            <li>
            Rights of Data Fiduciary- The data fiduciary reserves the right to utilize collected data for providing analytics, enhancing app functionality, and improving user experience. Any data usage will adhere to applicable data protection laws and regulations. 
            </li>
            <br/>
            <li>
            Cookies-The app may use cookies or other tracking technologies to improve user experience and app performance. By using the app, you consent to the use of cookies and tracking technologies. 
            </li>
            <br/>
            <li>
            App usage- Users are prohibited from using the app for any illegal, unauthorized, or unethical purposes. Any misuse of the app or violation of these terms and conditions may result in termination of user access. The app developer reserves the right to update, modify, or discontinue the app at any time without prior notice. Users will be notified of any significant changes to the app or its terms and conditions. 
            </li>
            <br/>
            <li>
            Changes in Privacy Policy-These terms and conditions are subject to change without notice. Users are encouraged to review the terms periodically for any updates or modifications.
            </li>
            <br/>
          </ol>
          <p>By continuing to use the app, you acknowledge that you have read and agree to these terms and conditions. If you have any questions or concerns about these terms, please contact the app developer for clarification. </p>
          <br/>
          <br/>
          </div>
          </div> */}
          <Button variant="contained" onClick={closeDialog2}> Close </Button>
        </Box>
      </Modal>
      }
    </div>
  );
}

export default Login;
