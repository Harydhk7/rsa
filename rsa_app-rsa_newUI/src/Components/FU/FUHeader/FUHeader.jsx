import React,{useState} from "react";
import profileicon from "../../../Assets/profile.png";
import bellicovn from "../../../Assets/bellicon.png";
import { useLocation, useNavigate } from "react-router-dom";
// import "./Haeder.css";
import {Button} from "@mui/material";
import { useMediaQuery,Popover } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { IoIosClipboard } from "react-icons/io";
import { url1 } from "../../../App";
import AxiosApp from "../../../common/AxiosApp";
import logo from "../../../Assets/logo.png"
import iit from "../../../Assets/iitlogo.png";
import coers from "../../../Assets/coers.png";
import { useEffect } from "react";
import JSZip from "jszip";
import checkList from "../../../Assets/cl.png"

var profBlob = ""
var profURL = ""
function FUHeader() {
  const [dummy, setDummy] = useState(0);
  const tabletView = useMediaQuery("(max-width:768px)");
  const location = useLocation();
  //console.log(location?.pathname);
  const navigate = useNavigate();
  const OnLogout = (x,y)=>{
    AxiosApp.post(url1 + "logout",{"user_id":x ,"role":y})
    .then((response) => {
      if (response.data.statusCode == "200") { 
        console.log(response);        
      } 
      navigate("/")
    })
    .catch((error) => {      
      navigate("/")
    }); 
    navigate("/")
    localStorage.setItem("rsa_user","")
    localStorage.setItem("rsa_user1","")
    localStorage.setItem("rsa_type","")
  }
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorEl1, setAnchorEl1] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClose1 = () => {
    setAnchorEl1(null);
  };

  const handleProfile = (e) => {
    setAnchorEl(e.target);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  
  const handleCheckList = (e) => {
    setAnchorEl1(e.target);
  };

  const open1 = Boolean(anchorEl1);
  const id1 = open1 ? "simple-popover1" : undefined;

  const loadProfileImage = (e)=>{
    let l1 = {
      "user_id":localStorage.getItem("rsaLogged")
    }
    AxiosApp.post(url1 + "reg_img", l1,
      {
        responseType: 'arraybuffer',
        contentType: 'application/zip'
      })
      .then(data => {
        JSZip.loadAsync(data.data)
          .then(zip => {
            // Filter the files to only include image files
            const imageFiles = Object.keys(zip.files)
              .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));

            // Read each image file
            let count = 0;

            imageFiles.forEach((filename, index) => {
              console.log("filename s" + filename);
              let fname = filename.split("/")[0]
              let file = filename.split("/")[1]

              zip.file(filename)
                .async('blob')
                .then(blob => {
                  profURL =  URL.createObjectURL(blob);
                  profBlob = blob;
                  setDummy(Math.random())
                });
            })
          })
          .catch(e => { console.log(e); })
      })
      .catch(error => {  console.error(error) });
  }
  useEffect(()=>{
    loadProfileImage();
  },[])
  return (
    <>
     <div style={{display:"none"}}>{dummy}</div>
    {!tabletView && <div style={{ display: "flex",flexDirection:"column",justifyContent: "space-between", 
    backgroundColor: "white", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "7vh",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
        <img
              style={{ height: "50px", width: "50px" }}
              src={iit}
              alt="iitlogo"
            />
        </div>
        {(
          location.pathname == "/Auditor_survey_one" ||
          location.pathname == "/Auditor_survey_two" ||
          location.pathname == "/Auditor_survey_three" ||
          location.pathname == "/Auditor_survey_overall"
        ) && (
          <div
            style={{
              padding: "10px",
              display: "flex",
              justifyContent:"center",
              gap: "15px",color: "rgb(46, 75, 122)",
              fontSize: "40px",
              fontWeight: "800",
            }}
          >
          <h6>Road Safety Survey & Audit</h6>
          <Button onClick={handleCheckList}        
          >CheckList</Button>
          </div>
        )}


        {(
          <div
            style={{
              border: "1px solid rgba(127, 163, 222, 0.3)",
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              gap: "15px",
            }}
          >
            <div
              style={{
                backgroundColor:
                  location?.pathname?.includes("/fe_audit") &&
                  "rgba(46, 75, 122, 1)",
                padding: "7px",
                borderRadius: "10px",
                color: "white",
                cursor: "pointer",
                fontWeight: 500,
                color: !location?.pathname?.includes("/fe_audit")
                  ? "rgba(46, 75, 122, 1)"
                  : "white",
              }}
              onClick={() => navigate("/fe_audit")}
            >
              {!tabletView ? "Audits List" : <IoIosClipboard size={24} />}
            </div>
          </div>
        )}








        <div style={{ display: "flex", gap: "5px" }}>
          {/* <img src={bellicovn} onClick={() => window.alert("Yet to implement Notification")} style={{ width: "29px" }} /> */}
          
          <img src={coers} style={{ height: "50px", width: "50px" }} />
          
        <img
              style={{ height: "50px", width: "50px" }}
              src={logo}
              alt="logo"
            />
            <img aria-describedby={id} src={profURL != "" ? profURL :profileicon} onClick={handleProfile}
            style={{ width: "50px", height: "50px", borderRadius:"50%", background: "rgb(46, 75, 122)" }} />
        </div>
      </div>
    </div>}
    {tabletView && <div style={{ display: "flex",flexDirection:"column",justifyContent: "space-between", backgroundColor: "white", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "7vh",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        {(
          location.pathname == "/Auditor_survey_one" ||
          location.pathname == "/Auditor_survey_two" ||
          location.pathname == "/Auditor_survey_three" ||
          location.pathname == "/Auditor_survey_overall"
        ) && (
          <div
            style={{
              padding: "10px",
              display: "flex",
              justifyContent:"center",
              gap: "15px",color: "rgb(46, 75, 122)",
              fontSize: "30px",
              fontWeight: "800",
            }}
          >
          <h6>Road Safety Survey & Audit</h6>
          <Button onClick={handleCheckList}
          >CheckList</Button>
          </div>
        )}
        {!(
          location.pathname == "/Auditor_survey_one" ||
          location.pathname == "/Auditor_survey_two" ||
          location.pathname == "/Auditor_survey_three" ||
          location.pathname == "/Auditor_survey_overall"
        ) && (
          <div
            style={{
              border: "1px solid rgba(127, 163, 222, 0.3)",
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              gap: "15px",
            }}
          >
            <div
              style={{
                backgroundColor:
                  location?.pathname?.includes("/fe_audit") &&
                  "rgba(46, 75, 122, 1)",
                padding: "7px",
                borderRadius: "10px",
                color: "white",
                cursor: "pointer",
                fontWeight: 500,
                color: !location?.pathname?.includes("/fe_audit")
                  ? "rgba(46, 75, 122, 1)"
                  : "white",
              }}
              onClick={() => navigate("/fe_audit")}
            >
              {!tabletView ? "Audits List" : <IoIosClipboard size={24} />}
            </div>
          </div>
        )}





        <div style={{ display: "flex", gap: "5px" }}>
          {/* <img src={bellicovn} onClick={() => window.alert("Yet to implement Notification")} style={{ width: "29px" }} /> */}
          <img src={coers} style={{ height: "50px", width: "50px" }} />          
        <img
              style={{ height: "50px", width: "50px" }}
              src={logo}
              alt="logo"
            />
          <img aria-describedby={id} src={profURL != "" ? profURL :profileicon} onClick={handleProfile}
            style={{ width: "50px", height: "50px", borderRadius:"50%", background: "rgb(46, 75, 122)" }} />
        </div>
      </div>
    </div>}
    <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <div style={{display:"flex",justifyContent:"center",padding:"15px",flexDirection:"column",alignItems:"center"}}>
          <p>User id :<b>{localStorage.getItem("rsaLogged")}</b></p>
          <p>Designation :<b>{localStorage.getItem("rsa_type_label")}</b></p>
          <br />
          <Button variant="contained" onClick={() => {
            OnLogout(localStorage.getItem("rsaLogged"), localStorage.getItem("rsa_type"))
          }}
          >Logout</Button>
          <br />
        </div>
      </Popover>
      <Popover
        id={id1}
        open={open1}
        anchorEl={anchorEl1}
        onClose={handleClose1}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <div style={{ width: "800px", height: "800px", overflow:"scroll"}} className="zoomCheckList">
         <img  src={checkList}></img>
        </div>
      </Popover>
    </>
  );
}

export default FUHeader;
