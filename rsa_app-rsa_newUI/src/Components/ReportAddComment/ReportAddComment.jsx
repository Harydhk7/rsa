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
function ReportAddComment() {
  const Navigate = useNavigate();
  const state = useLocation();
  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [dummy, setDummy] = useState(0)
  const [sectionIDList,setsectionIDList] = useState([])
  const [salient, setSalient] = useState([]);
  auditID = state.state.aid;                                                                                      

  useEffect(()=>{
    loadPdf()  
    loadSectionNameID();  
    populateSalientReport()
  },[])
  const populateSalientReport = () =>{
    let l1 =  
    { "audit_id":auditID } 
    AxiosApp.post(url1 + "report_plan_data",l1)
    .then((response) => {
      if (response.data.statusCode == "200") { 
        setSalient(response.data.details)          
      }
    })
    .catch((error) => {
      setIsload(false);
      setAlert("error");
      setAlertMsg(error);
    });
  }
  const loadSectionNameID = () =>{
    let local1 = {"audit_id":auditID}
    AxiosApp.post(url1 + "section_auditwise",local1)
      .then((response) => {
        let object = response.data.details;
        let x=[];
        let k1 = Object.keys(object);
        let v1 = Object.values(object);

        if (response.data.statusCode == "200") { 
          for (let index = 0; index < k1.length; index++) {
            if(!(v1[index].includes("Start") || v1[index].includes("End")))
              x.push([k1[index],v1[index]])
          }
          setsectionIDList(x) 
        } else {
          setAlert("error");
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      }); 
    }
  const loadPdf = () =>{
    let f1 = {
      "audit_id":auditID
    }
    try {
      AxiosApp
        .post(url1 + "view_ae_report_file", f1, {
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
  const handleAddComment = () =>{
    let l1 = document.getElementById("page").value;
    let l2 = document.getElementById("section").innerText;
    let l3 = document.getElementById("comment").value;
    if(auditID && l1 && l2 && l3){
      let f1 = {
        "audit_id":auditID,
        "page_no":l1,
        "section":l2,
        "comments":l3,
        'date':new Date().toISOString().slice(0, 10).split('-').reverse().join('-')
      }
      AxiosApp.post(url1 + "report_comment",f1)
      .then((response) => {
        setIsload(false);                     
        let l1 = response.data.details;
        if (response.data.statusCode == "200") {         
          setAlert("success");
          setAlertMsg(response.data.status);
        } else {
          setAlert("error");
          setAlertMsg(response.data.status);
        }})
        .catch((error) => {
          setIsload(false);
          setAlert("error");
          setAlertMsg(error);
        });
    } else {
      setAlert("error");
      setAlertMsg("Add all details to submit");
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
          Report Add Comments
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
              width: "73%",
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
          <div
            style={{
              border: "1px solid rgba(127, 163, 222, 0.1)",
              width: " 25%",
              height: "75vh",
              borderRadius: "10px",
              background: "#f3f6fc",
              padding: "20px",
            }}
          >
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "rgba(46, 75, 122, 1)",
              }}
            >
              Comment Form
            </p>

            <div
              style={{
                width: "100%",

                borderRadius: "10px",
                backgroundColor: "white",
                marginTop: "10px",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "14px",
                fontWeight: "500",
                color: "rgba(119, 114, 114, 1)",
              }}
            >
              <p>Stretch Id : {salient.audit_type_id}</p>
              <p>Stretch Name:{salient.stretch_name}</p>
              <p>Road Name :{salient.name_of_road}</p>
              <p>Road Number: {salient.road_number}</p>
            </div>
            <div
              style={{
                border: "1px solid rgba(127, 163, 222, 0.3)",
                borderRadius: "10px",
                // height: "10vh",
                marginTop: "20px",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "20px" }}>
                <TextField
                  fullWidth
                  id="page"
                  label="Page No"
                  variant="outlined"
                  style={{ width: "200px" }}
                />
                <FormControl style={{ width: "200px" }}>
                  <InputLabel>Section</InputLabel>
                  <Select variant="outlined" id="section">
                   {
                      sectionIDList.map((x)=>{
                        return(
                          <MenuItem key={x[0]} name={x[1]} value={x[0]}>{x[1]}</MenuItem>
                        )
                      })
                    }
                  </Select>
                </FormControl>
              </div>
              <TextField
                fullWidth
                multiline
                minRows={7}
                id="comment"
                label="Comment"
                variant="outlined"
                style={{ marginTop: "15px" }}
              />
              <div style={{ display: "flex", justifyContent: "end" }}>
                <Button
                  style={{
                    backgroundColor: "rgba(46, 75, 122, 1)",
                    color: "white",
                    marginTop: "15px",
                  }}
                  onClick={()=>{
                    handleAddComment()
                  }}
                  >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportAddComment;
