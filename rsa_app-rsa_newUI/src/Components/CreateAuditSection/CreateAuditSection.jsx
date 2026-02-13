import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import checkedvector from "../../Assets/Vector.png";
import TurnedInRoundedIcon from "@mui/icons-material/TurnedInRounded";
import TurnedInNotOutlinedIcon from "@mui/icons-material/TurnedInNotOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";

import { url1 } from "../../App";

function CreateAuditSection(props) {
  const { state } = useLocation(); //from previous sections
  const navigate = useNavigate();

  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [dummy, setDummy] = useState('');

  const [saveTemplate, setSaveTemplate] = useState(state.saveTemplate)
  const [sectionList, setSectionList] = useState([])
  const [sectionNames, setSectionNames] = useState([])
  const [qids, setQids] = useState([])

  const singleCheckClick = (e, sec, question) => {
    let l1 = e.target.checked;
    let temp = sectionList;
    temp[sec][0][question].questionDisplay = l1;
    setSectionList(temp)
    setDummy(Math.random())
  }
  const singleMandateClick = (e, sec, question) => {
    let l1 = "Mandatory";
    let temp = sectionList;
    temp[sec][0][question].field_type = l1;
    setSectionList(temp)
    setDummy(Math.random())
  }
  const singleOptionalClick = (e, sec, question) => {
    let l1 = "Optional";
    let temp = sectionList;
    temp[sec][0][question].field_type = l1;
    setSectionList(temp)
    setDummy(Math.random())
  }
  const sectionOnChecks = (e, sec) => {
    let l1 = (e.target.checked) ? true : false;
    let temp = sectionList;
    let temp1 = temp[sec][0];
    temp1.sectionDisplay = l1;
    for (var question in temp1) {
      if (question != "sectionDisplay")
        temp1[question].questionDisplay = l1
    }
    setSectionList(temp)
    setDummy(Math.random())
  }
  const sectionOnCheck = (e, sec) => {
    let l1 = (e.target.checked) ? "Mandatory" : "Optional";
    //go to correct section
    let temp = sectionList;
    let temp1 = temp[sec][0];
    for (var element in temp1) {
      temp1[element].field_type = l1;
    };
    setSectionList(temp)
    setDummy(Math.random())
  }

  const allMandate = (e, sec) => {
    let l1 = "Mandatory";
    //go to correct section
    let temp = sectionList;
    let temp1 = temp[sec][0];
    for (var element in temp1) {
      if (temp1[element].field_type)
        temp1[element].field_type = l1;
    };
    setSectionList(temp)
    setDummy(Math.random())
  }

  const allOptional = (e, sec) => {
    let l1 = "Optional";
    //go to correct section
    let temp = sectionList;
    let temp1 = temp[sec][0];
    for (var element in temp1) {
      if (temp1[element].field_type)
        temp1[element].field_type = l1;
    };
    setSectionList(temp)
    setDummy(Math.random())
  }



  useEffect(() => {
    //fetch the sections 
    let l1 = {
      "audit_type_id": state.auditID,
      "template": state.saveTemplate,
      "road_type_id": state.roadSel,
      "stage_id": state.stageSel
    }
    AxiosApp.post(url1 + "section_questions", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          let list1 = response.data.details;
          //loop thru the questions and have show/hide for the questions
          for (var section in list1) {
            for (var question in list1[section][0]) {
              list1[section][0][question].questionDisplay = true;
              list1[section][0].sectionDisplay = true;
            }
          }
          setSectionList(list1)
          setSectionNames(Object.keys(response.data.details))
          setQids(Object.values(response.data.q_id))
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
  }, [])

  const onSave = (e) => {
    //format the json to send
    /**
     * { 
    "audit_type_id":"fivehundredkm2348", 
    "sections":["H"], 
    "questions":{ 
                "Road Sign": { 
                    "H.11":"Optional", 
                    "H.12":"Optional", 
                    "H.13":"Optional" 
                    } 
                } } 
     */
    //get all ids in the sections
    let t1 = new Map();
    for (let index = 0; index < state.savedSec.length; index++) {
      const element = state.savedSec[index];
      if (element[2] == true) {
        t1.set(element[1], element[0])
      }
    }

    let quesObj = {}
    let sectemp = [];
    for (var sec in sectionList) {
      if (sectionList[sec][0].sectionDisplay == true) {
        quesObj[sec] = {};
        sectemp.push(t1.get(sec))
        let qList = {};
        for (var q in sectionList[sec][0]) {
          if (sectionList[sec][0][q].questionDisplay == true) {
            qList[q] = sectionList[sec][0][q].field_type;
          }
        }
        quesObj[sec] = qList;
      }
    }
    if (!(sectemp.includes("A") && sectemp.includes("B"))) {
      setAlert('error')
      setAlertMsg('Choose Start and End Sections')
      return;
    }
    //checking atleast one question in start and end sections

    const checkingStartEndQ = (s1, x) => {
      let count = 0;
      for (const key in s1) {
        count = count + 1;
        break;
      }
      if (count == 0) {
        setAlert('error')
        setAlertMsg('Choose atleast One Question in ' + x + 'Section')
        return false;
      }
      let mandateList = Object.values(s1)
      if (!mandateList.includes("Mandatory")) {
        setAlert('error')
        setAlertMsg('Choose atleast One Mandate Question in ' + x + ' Section')
        return false;
      }
      return true
    }

    if (!(checkingStartEndQ(quesObj["Start Audit Details"], "Start") &&
      checkingStartEndQ(quesObj["End Audit Details"], "End"))) {
      return;
    }
    let allData = {
      "audit_type_id": state.auditID,
      "sections": sectemp,
      "questions": quesObj,
      "template": saveTemplate,
      "road_type_id": state.roadSel,
      "stage_id": state.stageSel
    }

    AxiosApp.post(url1 + "storing_questions", allData)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          console.log(response.data)
          navigate("/Audit")
        } else {
          setAlert("error");
          setAlertMsg(response.data.message);
       //   navigate("/Audit")
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  return (
    <div>
      <Header />
      <p style={{
        display: "none"
      }}>{dummy}</p>
      <CustomLoader show={isload} />
      {alert != "" && (
        // <CustomAlerts msg={alertMsg} severity={alert}/>
        <CustomAlerts onClose={() => setAlert("")}>
          <p
            style={{
              fontSize: "17px",
              fontWeight: "700",
              marginTop: "17px",
            }}
          >
            {alertMsg}
          </p>
        </CustomAlerts>
      )}
      <div
        style={{
          backgroundColor: "#f1f5f8",
          minHeight: "100vh",
          padding: "20px",
        }}
      // className="rsa_usermanagement"
      >
        <div
          style={{
            backgroundColor: "#f8fafc",
            minHeight: "90vh",
            width: "100%",
            border: "1px solid rgba(127, 163, 222, 0.3)",
            borderRadius: "10px",
            padding: "15px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "400",
                color: "rgba(46, 75, 122, 1)",
              }}
            >
              Create of Audit Type
            </p>
            {/* Not for this version
            <div
              style={{
                border: "1px solid rgba(127, 163, 222, 0.3)",
                padding: "5px 10px",
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                borderRadius: "10px",
                color: "rgb(46, 75, 122)",
                fontSize: "16PX",
                fontWeight: "400",
                alignItems: "center",
                backgroundColor: "white",
              }}
            >
              
              Add Special Audit <AddBoxOutlinedIcon />
            </div> */}
          </div>
          {sectionNames.map((sec) => (
            <div style={{ marginTop: "15px" }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <FormControlLabel
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "rgba(46, 75, 122, 1)",
                    }}
                    control={<Checkbox
                      checked={sectionList[sec][0].sectionDisplay}
                      onChange={(e) => sectionOnChecks(e, sec)} />}
                    label={sec}
                  />
                </AccordionSummary>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginRight: "20px",
                  }}
                >
                  <Button
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      padding: "5px 10px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "5px",
                      borderRadius: "10px",
                      color: "rgb(46, 75, 122)",
                      fontSize: "16PX",
                      fontWeight: "400",
                      alignItems: "center",
                      backgroundColor: "white",
                      textTransform: 'none'
                    }}
                    onClick={(e) => { allMandate(e, sec) }}
                  >
                    All Mandatory <TurnedInRoundedIcon />
                  </Button>
                  <Button
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      padding: "5px 10px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "5px",
                      borderRadius: "10px",
                      color: "rgb(46, 75, 122)",
                      fontSize: "16PX",
                      fontWeight: "400",
                      alignItems: "center",
                      backgroundColor: "white",
                      textTransform: 'none'
                    }}
                    onClick={(e) => { allOptional(e, sec) }}
                  >
                    All Optional <TurnedInNotOutlinedIcon />
                  </Button>
                  {/* Not for this version 
                  <div
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      padding: "5px 10px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "5px",
                      borderRadius: "10px",
                      color: "rgb(46, 75, 122)",
                      fontSize: "16PX",
                      fontWeight: "400",
                      alignItems: "center",
                      backgroundColor: "white",
                    }}
                  >
                    
                    Edit
                    <EditNoteOutlinedIcon /> 
                  </div>*/
                  }
                </div>
                <AccordionDetails>
                  {sectionList[sec].map((itm) => (
                    <div
                      style={{
                        marginLeft: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "left",
                        border: " 1px solid rgba(127, 163, 222, 0.3)",
                        padding: "10px 15px",
                        borderRadius: "10px",
                        backgroundColor: "white",
                        marginBottom: "10px",
                      }}
                    >
                      {Object.keys(itm).map((key, i) => {
                        if (key != "sectionDisplay")
                          return (
                            /*{qids.map((i) =>(*/
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between"
                              }}
                            >
                              <FormControlLabel
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "rgba(46, 75, 122, 1)",
                                }}
                                label={itm[key].question}
                                id={"label" + itm[key]}
                                control={
                                  <Checkbox
                                    id={itm[key]}
                                    onChange={(e) => singleCheckClick(e, sec, key)}
                                    checked={itm[key].questionDisplay} />
                                }
                              />
                              {itm[key].field_type == "Mandatory" &&
                                <TurnedInRoundedIcon onClick={(e) => singleOptionalClick(e, sec, key)} style={{ color: "rgb(46, 75, 122)" }} />}
                              {itm[key].field_type != "Mandatory" &&
                                <TurnedInNotOutlinedIcon onClick={(e) => singleMandateClick(e, sec, key)} style={{ color: "rgb(46, 75, 122)" }} />}
                            </div>
                          )
                      }
                      )}
                    </div>
                  ))}
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >



            <Button
              // onClick={() => setTab(1)}
              style={{
                backgroundColor: "rgba(46, 75, 122, 1)",
                color: "white",
              }}
              onClick={(e) => onSave(e)}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAuditSection;
