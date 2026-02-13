import React, { useState,useEffect } from "react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import FileViewer from "react-file-viewer";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import JSZip from 'jszip';
import AxiosApp from "../../common/AxiosApp";
import { url1 } from "../../App";
var auditID = ""
var auditPath = ""
function ViewMergeReport() {
  const Navigate = useNavigate();
  const state = useLocation();
  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [dummy, setDummy] = useState(0)
  const [sectionIDList,setsectionIDList] = useState([])
  const [salient, setSalient] = useState([]);
  auditID = state.state.sid;                                                                                      

  useEffect(()=>{
    loadPdf()  
  },[])
  const loadPdf = () =>{
    let f1 = {
      "audit_type_id":auditID
    }
    try {
      AxiosApp
        .post(url1 + "view_merged_report", f1, {
          responseType: "blob",
          contentType: "application/json",
        })
        .then((response) => {
          auditPath = URL.createObjectURL(response.data);
          setDummy(Math.random())   
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error("Error fetching document:", error);
    }

  }
  return (
    <div> <p style={{
          display:"none"
        }}>{dummy}</p>
      <div
        style={{
          height: "10vh",
          backgroundColor: "rgba(255, 255, 255, 1)",
          width: "100%",
          paddingLeft: "10px",
          paddingRight: "10px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <ArrowBackOutlinedIcon onClick={() => Navigate(-1)} />   
        <p
          style={{
            fontSize: "24PX",
            fontWeight: "600",
            color: "rgba(46, 75, 122, 1)",
          }}
        >
          Report Section
        </p>   
      </div>
      <div
        style={{
          height: "90vh",
          width: "100%",
          padding: "20px",
          backgroundColor: "#f1f5f8",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            height: "80vh",
            width: "100%",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(0, 0, 0, 0.1)",
              width: "93%",
              height: "75vh",
              borderRadius: "10px",
            }}
          >
            <iframe src={auditPath} width="100%" height="600px"></iframe>
            {/* <FileViewer
              fileType={"pdf"}
              filePath={auditPath}
              height="95%"
            /> */}
            {/* <img src={auditPath}/> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewMergeReport;
