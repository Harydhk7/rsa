import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";

import { url1 } from "../../App";
var tempValue = ""

function CreateAudit() {
  //can be from create audit button
  //can be from useTemplate - landing page

  const { state } = useLocation();
  if (state && state.template) {
    //dont show the saveTemplate checkbox
  }

  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const navigate = useNavigate();

  const [saveTemplate, setSaveTemplate] = useState(true)
  const [sectionMap, setSectionMap] = useState([])
  const [roadType, setRoadType] = useState([])
  const [stageType, setStageType] = useState([])
  const [auditMethod, setAuditMethod] = useState([])

  const [checkedSec, setCheckedSec] = useState([])
  const [nameSel, setNameSel] = useState('')
  const [roadSel, setRoadSel] = useState('')
  const [stageSel, setStageSel] = useState('')
  const [auditSel, setAuditSel] = useState('')

  const [dummy, setDummy] = useState('')
  let nameSelTemplate = "";
  let auditSelTemplate = "";
  let roadSelTemplate = "";
  let stageSelTemplate = "";
  let checkedSecTemplate = [];
  const loadSections = (temp, dataArray) => {
    let ids = [];
    if (temp && temp == "template" && dataArray) {
      nameSelTemplate = dataArray[0];
      auditSelTemplate = dataArray[1];
      roadSelTemplate = dataArray[2];
      stageSelTemplate = dataArray[3];
      checkedSecTemplate = dataArray[4];
      ids = [dataArray[5],dataArray[6]]
    }
    AxiosApp.post(url1 + "dropdowns")
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          if (temp == "template") { setNameSel(nameSelTemplate); }
          if (l1["audit_method_types"]) {
            setAuditMethod(l1["audit_method_types"])
            if (temp == "template") { setAuditSel(auditSelTemplate); }
          }
          if (l1["road_types"]) {
            let m1 = l1["road_types"];
            let keys = Object.keys(m1)
            let values = Object.values(m1)
            let m2 = []
            for (let index = 0; index < keys.length; index++) {
              m2.push([keys[index], values[index]])
            }
            setRoadType(m2)
            if (temp == "template") {
              for (let index = 0; index < m2.length; index++) {
                const element = m2[index];
                if (element[1] == roadSelTemplate) {
                  setRoadSel(element[0])
                  break;
                }
              }
            }
          }
          if (l1["stage_types"]) {
            let m1 = l1["stage_types"];
            let keys = Object.keys(m1)
            let values = Object.values(m1)
            let m2 = []
            for (let index = 0; index < keys.length; index++) {
              m2.push([keys[index], values[index]])
            }
            setStageType(m2)
            if (temp == "template") {
              for (let index = 0; index < m2.length; index++) {
                const element = m2[index];
                if (element[1] == stageSelTemplate) {
                  setStageSel(element[0])
                  break;
                }
              }
            }
          }
          if(!temp == "template") 
              checkforShow();     
          else {
                let l2 = {
                  "road_type_id": ids[0],
                  "stage_id": ids[1],
                  "audit_method": auditSelTemplate
                }
                loadSectionAfterSelection(l2)
              }     
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
  const checkforShow = () => {
    setSectionMap([])
    setCheckedSec([])

    if (!(nameSel || auditSel || stageSel)) {
      setAlert("error")
      setAlertMsg("Select Road Type, Stage and Audit method to get the sections");
      setSectionMap([])
      setCheckedSec([])
      return;
    }
    let l2 = {
      "road_type_id": roadSel,
      "stage_id": stageSel,
      "audit_method": auditSel
    }
    loadSectionAfterSelection(l2)
  }
  const loadSectionAfterSelection = (l2) => {
    if((l2.audit_method == "" || l2.stage_id == "" || l2.road_type_id == ""))
    return;
    AxiosApp.post(url1 + "sections_filter", l2)
      .then((res) => {
        if (parseInt(res.data.statusCode) == 200) {
          let m1 = res.data.sections;
          let keys = Object.keys(m1)
          let values = Object.values(m1)
          let m2 = []
          let m3 = [];
          for (let index = 0; index < keys.length; index++) {
            m2.push([keys[index], values[index]])
            m3.push([keys[index], values[index], false])
          }
          setSectionMap(m2)
          setCheckedSec(m3)

          if (tempValue == "template") {
            let s1 = [];
            for (let index = 0; index < m3.length; index++) {
              const element = m3[index];
              if (Object.values(checkedSecTemplate).includes(element[1])) {
                s1.push(element)
              }
            }
            setCheckedSec(s1)
          }
        } else {
          setAlert("error");
          setAlertMsg(res.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const loadTemplateDetails = () => {
    if (state && state.template) {
      let l1 = { "template_id": state.tempID }
      AxiosApp.post(url1 + "template_get", l1)
        .then((response) => {
          setIsload(false);
          let l1 = response.data.details[0];
          if (response.data.statusCode == "200") {
            //fill the ui based on the l1   
            loadSections("template",
              [l1.stretch_name, l1.audit_method, l1.road_type, l1.stage, l1.sections,l1.road_type_id,l1.stage_id])
            tempValue = "template"
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
    } else {
      loadSections()
      tempValue = ""
    }
  }
  useEffect(() => {
    loadTemplateDetails();
  }, [])
  const selectAllSections = (e) => {
    let l1 = e.target.checked;
    let temp = checkedSec
    for (let index = 0; index < temp.length; index++) {
      temp[index][2] = l1;
    }
    setCheckedSec(temp)
    setDummy(Math.random())
  }
  const onSaveProceed = () => {
    if (!(nameSel != "" && roadSel != "" && stageSel != "" && auditSel != "")) {
      setAlert('error')
      setAlertMsg('All fields are mandatory')
      return;
    }
    //check the length of selected sections
    let count = 0;
    for (let index = 0; index < checkedSec.length; index++) {
      const element = checkedSec[index];
      if (element[2] === true) { count = count + 1; break; }
    }
    if (count == 0) {
      setAlert('error')
      setAlertMsg('Choose Sections')
      return;
    }

    //post and get the audit id
    //get all ids in the sections
    let t1 = [];
    for (let index = 0; index < checkedSec.length; index++) {
      const element = checkedSec[index];
      if (element[2] == true) {
        t1.push(element[0])
      }
    }
    if (!(t1.includes("A") && t1.includes("B"))) {
      setAlert('error')
      setAlertMsg('Choose Start and End Sections')
      return;
    }
    let l1 = {
      "stretch_name": nameSel,
      "road_type_id": roadSel,
      "stage_id": stageSel,
      "audit_method": auditSel,
      "section_ids": t1,
      "template": (state && state.template) ? false : saveTemplate,
      "created_on": new Date().toISOString().slice(0, 10).split('-').reverse().join('-'),
      "created_by": localStorage.getItem("rsa_user")
    }
    AxiosApp.post(url1 + "audit_type", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          //pass all the props 
          navigate("/Audit/createAudit/section",
            {
              state: {
                savedSec: checkedSec, nameSel: nameSel, roadSel: roadSel,
                stageSel: stageSel, auditSel: auditSel, auditID: response.data.details,
                saveTemplate: (state && state.template) ? false : saveTemplate
              }
            })
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
  const onChecked = (e, x) => {
    let v1 = e.target.checked;
    let s1 = checkedSec;
    //loop the array setCheckedSec
    //find the correct index and change the check state
    for (let index = 0; index < checkedSec.length; index++) {
      const element = checkedSec[index];
      if (element[0] == x[0]) {
        s1[index][2] = v1;
      }
    }
    setCheckedSec(s1)
    setDummy(Math.random())
  }
  return (
    <div>
      <div><p style={{
        display: "none"
      }}>{dummy}</p></div>
      <Header />
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
          //   minHeight: "100vh",
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
            padding: "25px",
          }}
        >
          <p
            style={{
              fontSize: "26px",
              fontWeight: "600",
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Create Audit Types
          </p>
          <p style={{ marginTop: "15px", color: "rgba(46, 75, 122, 1)" }}>
            Step 1
          </p>
          <br/>

          {/* {(state && state.template) && 
          <p> This is a from template </p>
          } */}

          <div style={{ marginTop: "15px" }}>
            <TextField
              fullWidth
              value={nameSel}
              onChange={(e) => setNameSel(e.target.value)}
              label="Name of Audit"
              required
              variant="outlined"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 0.5fr",
                marginTop: "15px",
                gap: "10px",
              }}
            >
              <FormControl>
                <InputLabel id="demo-simple-select-label">Road Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={roadSel}
                  onChange={(e) => setRoadSel(e.target.value)}
                  disabled = {(state && state.template)}
                >
                  {
                    roadType.map((x, index) =>
                      <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                    )
                  }
                </Select>
              </FormControl>{" "}
              <FormControl>
                <InputLabel id="demo-simple-select-label">Stage</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={stageSel}
                  onChange={(e) => setStageSel(e.target.value)}
                  disabled = {(state && state.template)}
                >
                  {
                    stageType.map((x, index) =>
                      <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                    )
                  }
                </Select>
              </FormControl>{" "}
              <FormControl>
                <InputLabel id="demo-simple-select-label">
                  Audit method
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={auditSel}
                  onChange={(e) => setAuditSel(e.target.value)}
                  disabled = {(state && state.template)}
                >
                  {
                    auditMethod.map((x, index) =>
                      <MenuItem key={x} value={x}>{x}</MenuItem>
                    )
                  }
                </Select>
              </FormControl>
              <Button variant="contained" disabled = {(state && state.template)} 
              onClick={() => checkforShow()}>
                Submit
              </Button>
            </div>
            {checkedSec.length > 0 && <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "15px",
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                }}
              >
                Select the sections
              </p>
              <FormControlLabel
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                }}
                control={<Checkbox
                  onChange={(e) => selectAllSections(e)} />}
                label="Select All"
              />
            </div>}
            <div
              style={{
                marginTop: "15px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "20px",
              }}
            >
              {checkedSec.map((itm) => (
                <div
                  style={{
                    border: "1.5px solid rgba(127, 163, 222, 1)",
                    padding: "5px 10px",
                    borderRadius: "10px",
                  }}
                  className="allSections"
                >
                  <FormControlLabel
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "rgba(46, 75, 122, 1)",
                    }}
                    control={<Checkbox
                      onChange={(e) => { onChecked(e, itm) }}
                      checked={itm[2]} />}
                    label={itm[1]}
                  />
                </div>
              ))}
            </div>
          </div>
           {checkedSec.length > 0 &&
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            {!(state && state.template) && <FormControlLabel
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "rgba(46, 75, 122, 1)",
              }}
              label="Save this as Template"
              id={"template"}
              control={
                <Checkbox
                  id="templateSel"
                  onChange={(e) => setSaveTemplate(e.target.checked)}
                  checked={saveTemplate} />
              }
            />}
            <Button
              // onClick={() => setTab(1)}
              style={{
                backgroundColor: "rgba(46, 75, 122, 1)",
                color: "white",
              }}
              onClick={onSaveProceed}
            >
              Save & Proceed
            </Button>
          </div>}
        </div>
      </div>
    </div>
  );
}

export default CreateAudit;
