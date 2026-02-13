import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Accordion from "@mui/material/Accordion";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select, Radio,
  TextField, FormLabel, RadioGroup,
  FormGroup,
} from "@mui/material";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import checkedvector from "../../Assets/Vector.png";
import TurnedInRoundedIcon from "@mui/icons-material/TurnedInRounded";
import TurnedInNotOutlinedIcon from "@mui/icons-material/TurnedInNotOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useLocation, useNavigate } from "react-router-dom";
import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";

import { url1 } from "../../App";
function AuditAssignment() {

  const { state } = useLocation()
  const navigate = useNavigate();
  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  //need to get in props
  const [strID, setStrID] = useState(state.auditID);
  const [auditName, setAuditName] = useState(state.auditName);
  const [auditPlanID, setAuditPlanID] = useState(state.auditPlanID)
  const [typeAuditSel, setTypeAuditSel] = useState('Chainage')

  //from dropdowns and
  const [aeList, setAEList] = useState([]);
  const [auditorsList, setAuditorsList] = useState([]);
  const [fieldList, setfieldList] = useState([])
  const [typeAudit, setTypeAudit] = useState([]);
  const [sectionList, setSectionList] = useState([])
  const [sectionNames, setSectionNames] = useState([])

  const [auditorSelected, setAuditorSelected] = useState([]);
  const [aeSelected, setAESelected] = useState([]);
  const [feSelected, setfeSelected] = useState('');
  const [checkfe, setcheckfe] = useState()
  const [firstValue, setFirstValue] = useState([])
  const [secondValue, setSecondValue] = useState([])

  //here typed
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [savedStretchLength, setsavedStretchLength] = useState('');

  const loadAuditorsName = () => {
    let l1 = {
      "userid": localStorage.getItem("rsa_user")
    }
    AxiosApp.post(url1 + "auditor_dd", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          let l2 = response.data.details;
          let l3 = [];
          for (let index = 0; index < l2.length; index++) {
            const key = l2[index];
            l3.push([key['userid'], key['name']])
          }
          setAuditorsList(l3)
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
  const loadFEList = () => {
    let l1 = {
      "userid": localStorage.getItem("rsa_user")
    }
    AxiosApp.post(url1 + "field_user_dd", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          let l2 = response.data.details;
          let l3 = [];
          for (let index = 0; index < l2.length; index++) {
            const key = l2[index];
            l3.push([key['userid'], key['name']])
          }
          setfieldList(l3)
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
  const loadAEList = () => {
    let l1 = {
      "userid": localStorage.getItem("rsa_user")
    }
    AxiosApp.post(url1 + "ae_dropdown", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          let l2 = response.data.details;
          let l3 = [];
          for (let index = 0; index < l2.length; index++) {
            const key = l2[index];
            l3.push([key['userid'], key['name']])
          }
          setAEList(l3)
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

  const loadTypeAudit = () => {
    AxiosApp.post(url1 + "dropdowns")
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          if (l1['data_type'] != '') {
            let t1 = l1['data_type']
            setTypeAudit(t1)
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

  const getAuditorName = (id) => {
    for (let index = 0; index < auditorsList.length; index++) {
      const element = auditorsList[index];
      if (element[0] == id) {
        return element[1]
      }
    }
    return;
  }
  const loadSections = () => {
    let l1 = { "audit_type_id": strID, "template": false }
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
  const loadStretchLength = () => {
    let l1 = {
      audit_type_id: strID
    }
    AxiosApp.post(url1 + "get_stretch_length", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          setsavedStretchLength(response.data.total_stretch_length)
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
  useEffect(() => {
    //take all from props
    loadTypeAudit();
    loadAuditorsName();
    loadAEList()
    loadStretchLength();
    loadFEList()
  }, [])

  const OnChangeAuditor = (e) => {
    if (typeAuditSel != "Chainage") {
      if (e.target.value.length > 2) {
        setAlert("error");
        setAlertMsg("Only two auditors can be selected if type of audit is " + typeAuditSel);
        return;
      }
    }
    setAuditorSelected(e.target.value)
  }

  const onsubmit = () => {
    let auditStretch = {};
    let l1 = {}
    if (typeAuditSel == "Chainage") {
      for (let index = 0; index < auditorSelected.length; index++) {
        let first1 = document.getElementById(auditorSelected[index] + "first").value;
        let second1 = document.getElementById(auditorSelected[index] + "second").value;
        let regex = /^\d+\+\d+$/;
        if (!(regex.test(first1) && regex.test(second1))) {
          setAlert("error");
          setAlertMsg("Please enter correct format for the start and end chainage, eg:0+200");
          return;
        }
        first1 = first1.replace("+", ".")
        second1 = second1.replace("+", ".")
        let dis = parseInt(second1.split(".")[0]) - parseInt(first1.split(".")[0])
        //let dis = parseInt(second1) - parseInt(first1)
        if (dis < 0) {
          setAlert("error");
          setAlertMsg("Please enter correct values, end chainage should be greater than start chainage");
          return;
        }
        l1[auditorSelected[index]] =
        {
          "start_point": first1,
          "end_point": second1,
          "stretch_length": (dis)
        }
      }
    } else {
      //length is always <= 2
      let firstOne = ''; let secondOne = '';
      let l11 = document.getElementById("0travel").querySelectorAll("input");
      let first1 = l11[0].checked; //lhs
      let second1 = l11[1].checked; //rhs
      firstOne = first1 ? "lhs" : "rhs";
      l11 = document.getElementById("1travel").querySelectorAll("input");
      first1 = l11[0].checked; //lhs
      second1 = l11[1].checked; //rhs
      secondOne = first1 ? "lhs" : "rhs";
      if (firstOne == secondOne) {
        setAlert("error");
        setAlertMsg("LHS and RHS has to assigned to different auditors");
        return;
      }
      l1[auditorSelected[0]] =
      {
        "travel_direction": firstOne,
        "stretch_length": savedStretchLength
      }
      l1[auditorSelected[1]] =
      {
        "travel_direction": secondOne,
        "stretch_length": savedStretchLength
      }

    }
    auditStretch = l1;
    let d1 = document.querySelector("#startDate").querySelector("input").value;
    let d2 = document.querySelector("#endDate").querySelector("input").value;
    if (d1 && d2) {
      let f1 = d1.split("-")
      let dd1 = new Date(parseInt(f1[2]), parseInt(f1[1]), parseInt(f1[0])).getTime()

      let f2 = d2.split("-")
      let dd2 = new Date(parseInt(f2[2]), parseInt(f2[1]), parseInt(f2[0])).getTime()

      if (dd1 > dd2) {
        setAlert("error")
        setAlertMsg("Submission Date should be after Start Date")
        return;
      }
    } else {
      setAlert("error")
      setAlertMsg("Submission Date and Start Date are mandatory")
      return;
    }

    if (auditorSelected.length == 0) {
      setAlert("error")
      setAlertMsg("Choose auditors")
      return;
    }
    if (aeSelected.length == 0) {
      setAlert("error")
      setAlertMsg("Choose AE for this Audit")
      return;
    }
    if(checkfe && (feSelected == "")){
      setAlert("error")
      setAlertMsg("Choose Field User for this Audit or uncheck the checkbox")
      return;
    }
    let allData = {
      "audit_type_id": strID,
      "audit_plan_id": auditPlanID,
      "stretch_name": auditName,
      "add_auditors": auditorSelected,
      "start_by_date": d1,
      "submit_by_date": d2,
      "type_of_audit": typeAuditSel,
      "auditor_stretch": auditStretch,
      "created_by": localStorage.getItem("rsa_user"),
      "ae_userid": aeSelected,
      "field_user": feSelected,
      "created_on": new Date().toISOString().slice(0, 10).split('-').reverse().join('-')
    }
    AxiosApp.post(url1 + "audit_assignment", allData)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response.data)
          navigate("/Audit")
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
  return (
    <div>
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
            padding: "15px",
          }}
        >
          <p
            style={{
              fontSize: "26px",
              fontWeight: "600",
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Audit Assignment
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            <TextField
              fullWidth
              label="Stretch Id"
              required disabled
              value={strID}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Name of Audit"
              required disabled
              value={auditName}
              variant="outlined"
            />
            <FormControl id="startDate">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker disablePast label="Start Date" views={['year', 'day']}
                  format="DD-MM-YYYY" />
              </LocalizationProvider>
            </FormControl>
            <FormControl id="endDate">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker disablePast label="Submission Date" views={['year', 'day']}
                  format="DD-MM-YYYY"
                />
              </LocalizationProvider>
            </FormControl>
            <FormControl>
              <InputLabel id="demo-simple-select-label">Type of Audit</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={typeAuditSel}
                onChange={(e) => setTypeAuditSel(e.target.value)}
              >
                {
                  typeAudit.map((x, index) =>
                    <MenuItem key={x} value={x}>{x}</MenuItem>
                  )
                }
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="demo-simple-select-label">AE for the Audit</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={aeSelected}
                onChange={(e) => setAESelected(e.target.value)}
              >
                {
                  aeList.map((x, index) =>
                    <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                  )
                }
              </Select>
            </FormControl>
            {" "}
            <FormControl>
              <InputLabel id="demo-simple-select-label">Add Auditor</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={auditorSelected}
                multiple
                onChange={(e) => { OnChangeAuditor(e) }}
              >
                {
                  auditorsList.map((x, index) =>
                    <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                  )
                }
              </Select>
            </FormControl>
            {"The Chainage for this audit is   " + state.chain}
          </div>
          <br />
          {auditorSelected.map(i =>
            <div>
              {typeAuditSel == "Chainage" &&
                <div style={{
                  paddingBottom: "15px",
                  display: "flex",
                  gap: "10px"
                }}><span>{getAuditorName(i)}</span>
                  <TextField
                    id={i + "first"}
                    label="Chainage start"
                    placeholder="0+000"
                    required
                    variant="outlined"
                  />
                  <TextField
                    id={i + "second"}
                    placeholder="0+000"
                    label="Chainage end"
                    required
                    variant="outlined"
                  />
                </div>}
            </div>
          )}
          {typeAuditSel != "Chainage" &&
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "15px",
              marginTop: "20px",
            }}>
              {auditorSelected.map((i, j) =>
                <FormControl>
                  <FormLabel id={j + "demo-radio-buttons-group-label"}>{getAuditorName(i)}</FormLabel>
                  <RadioGroup
                    aria-labelledby={j + "demo-radio-buttons-group-label"}
                    defaultValue="lhs"
                    id={j + "travel"}
                    name={j + "radio-buttons-group"}
                  >
                    <FormControlLabel value="lhs" control={<Radio />} label="LHS" />
                    <FormControlLabel value="rhs" control={<Radio />} label="RHS" />
                  </RadioGroup>
                </FormControl>
              )}
            </div>}
          <div style={
            {display:'flex'}
          }>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={checkfe} onChange={(e) => {
                    setcheckfe(e.target.checked)
                }} />}
                label="Do you want this audit to be done by Field User?" />
            </FormGroup>
            <FormControl disabled={!checkfe} sx={{ width: '250px' }}>
              <InputLabel id="demo-simple-select-label"></InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={feSelected}
                onChange={(e) => { setfeSelected(e.target.value) }}
              >
                {
                  fieldList.map((x, index) =>
                    <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                  )
                }
              </Select>
            </FormControl>
          </div>
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
              onClick={() => onsubmit()}
            >
              Assign Audit
            </Button>
          </div>
        </div>{" "}
      </div>
    </div>
  );
}

export default AuditAssignment;
