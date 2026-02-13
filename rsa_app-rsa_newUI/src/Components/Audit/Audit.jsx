import React, { useState, useEffect } from "react";
import Header from "../Header/Header";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DataGrid, GridToolbarQuickFilter, GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from "@mui/icons-material/Search";
import adiutimg from "../../Assets/aduitcreatimg.png";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";

import { url1 } from "../../App";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  height: "70vh",
  bgcolor: "background.paper",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
};
function Audit() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [subTab, setSubTab] = useState(1);
  const [open, setOpen] = React.useState(false); //reassign popup
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openTwo, setOpenTwo] = React.useState(false); //audit table - row -click-modal
  const handleOpenTwo = () => setOpenTwo(true);
  const handleCloseTwo = () => setOpenTwo(false);

  const [openThree, setOpenThree] = React.useState(false);//assigned audit - view button
  const handleOpenThree = () => setOpenThree(true);
  const handleCloseThree = () => setOpenThree(false);
  const [showObj, setShowObj] = React.useState({})

  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  //create tab - its subtabs
  const [createdList, setCreatedList] = useState([]);
  const [plannedList, setPlannedList] = useState([]);
  const [templateList, setTemplateList] = useState([]);

  //assign tab
  const [assStart, setAssStart] = useState([]);
  const [assProg, setAssProg] = useState([]);

  //complete tab
  const [approvedList, setApprovedList] = useState([]);
  const [rejectedList, setRejectedList] = useState([]);
  const [submittedList, setSubmittedList] = useState([]);
  const [completedList, setcompletedList] = useState([])

  //create tab - its subtabs Originals
  const [createdListOri, setCreatedListOri] = useState([]);
  const [plannedListOri, setPlannedListOri] = useState([]);
  const [templateListOri, setTemplateListOri] = useState([]);

  //assign tab Originals
  const [assStartOri, setAssStartOri] = useState([]);
  const [assProgOri, setAssProgOri] = useState([]);

  //complete tab Originals
  const [approvedListOri, setApprovedListOri] = useState([]);
  const [rejectedListOri, setRejectedListOri] = useState([]);
  const [submittedListOri, setSubmittedListOri] = useState([]);
  const [completedListOri, setcompletedListOri] = useState([])

  //audit list tabs - table
  const [auditData, setAuditData] = useState([])
  const [auditDataOri, setAuditDataOri] = useState([])
  const [viewAuditObj, setViewAuditObj] = useState([]);
  const [rows, setRows] = React.useState([
    {
      'id': '', 'audit_type': '', 'stretch_name': '', 'audit_id': '', 'state': '',
      'district_name': '', 'road_owning_agency': '', 'name_of_road': '', 'road_number': '',
      'stretch_length': '', 'status': '', 'auditor': ''
    }]);
  const columns = [
    { field: 'id', flex: 0.5, headerName: 'S.No' },
    { field: 'audit_type', flex: 1, headerName: 'Audit type', hide: true },
    { field: 'stretch_name', flex: 1, headerName: 'Stretch Name' },
    { field: 'audit_id', flex: 1, headerName: 'Audit ID' },
    { field: 'state', flex: 1, headerName: 'State' },
    { field: 'district_name', flex: 1, headerName: 'District Name' },
    { field: 'road_owning_agency', flex: 1, headerName: 'ROA' },
    { field: 'name_of_road', flex: 1, headerName: 'Name of Road' },
    { field: 'road_number', flex: 1, headerName: 'Road No' },
    { field: 'stretch_length', flex: 1, headerName: 'Stretch Length' },
    { field: 'status', flex: 1, headerName: 'Status' },
    { field: 'auditor', flex: 1, headerName: 'Auditor' }
  ];
  function createData(id, audit_type, stretch_name, audit_id, state,
    district_name, road_owning_agency, name_of_road, road_number,
    stretch_length, status, auditor) {
    return {
      id, audit_type, stretch_name, audit_id, state,
      district_name, road_owning_agency, name_of_road, road_number,
      stretch_length, status, auditor
    };
  }

  //dropdown and chosenvalue to filter the table
  const [roa, setRoa] = useState([])
  const [road, setRoad] = useState([])
  const [stretch, setStretch] = useState([])
  const [states, setStates] = useState([])
  const [dist, setDist] = useState([])

  const [roa1, setRoa1] = useState('')
  const [road1, setRoad1] = useState('')
  const [stretch1, setStretch1] = useState('')
  const [states1, setStates1] = useState('')
  const [dist1, setDist1] = useState('')

  //reassign modal
  const [stretchModal, setStretchModal] = useState('');
  const [auditModal, setAuditModal] = useState('')
  const [fullAuditList, setFullAuditList] = useState([])
  const [auditList, setAuditList] = useState([]);
  const [auditModalDetail, setAuditModalDetail] = useState([]);
  const [auditorsList, setAuditorsList] = useState([]);
  const [okAssign, setOkAssign] = useState('')

  const [dummy1, setDummy1] = useState('')

  const loadDropdowns = () => {
    AxiosApp.post(url1 + "dropdowns")
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          if (l1['roa'] != '') {
            let t1 = l1['roa']
            setRoa(t1)
          }
          if (l1['road'] != '') {
            let t1 = l1['road']
            setRoad(t1)
          }
          if (l1['audit_type_id'] != '') {
            let k1 = Object.keys(l1['audit_type_id'])
            let v1 = Object.values(l1['audit_type_id'])
            let t1 = [];
            for (let index = 0; index < k1.length; index++) {
              t1.push([k1[index], v1[index]])
            }
            setStretch(t1)
          }
          if (l1['states'] != '') {
            let t1 = l1['states']
            setStates(t1)
          }
          if (l1['dist'] != '') {
            let t1 = l1['dist']
            setDist(t1)
          }
          if (l1['auditor_name'] != '') {
            let k1 = Object.keys(l1['auditor_name'])
            let v1 = Object.values(l1['auditor_name'])
            let t1 = [];
            for (let index = 0; index < k1.length; index++) {
              t1.push([k1[index], v1[index]])
            }
            setAuditorsList(t1)
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
  const loadLists = () => {
    let l1 = {
      "user_id": localStorage.getItem("rsaLogged")
    }
    AxiosApp.post(url1 + "audit_section", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          setPlannedList(l1.audit_plan_list); setPlannedListOri(l1.audit_plan_list)
          setCreatedList(l1.audit_type_list); setCreatedListOri(l1.audit_type_list)
          setTemplateList(l1.template_list); setTemplateListOri(l1.template_list)

          //approved/rejected/submitted
          setApprovedList(l1.approved_audit_list); setApprovedListOri(l1.approved_audit_list)
          setRejectedList(l1.rejected_audit_list); setRejectedListOri(l1.rejected_audit_list)
          setSubmittedList(l1.submitted_audit_list); setSubmittedListOri(l1.submitted_audit_list)

          //split assignedList into 5 lists(yet to start,in progress, completed, report submitted and report approved)
          for (let index = 0; index < l1.assigned_audit_list.length; index++) {
            let key = l1.assigned_audit_list[index];
            switch (key.status.toLowerCase()) {
              //case "audit started":
              // case "declined":
              // case "accepted":
              case 'audit assigned':
                {
                  setAssStart(assStart => [...assStart, key]);
                  setAssStartOri(assStart => [...assStart, key]);
                  break;
                }
              case "audit started": {
                setAssProg(assProg => [...assProg, key]);
                setAssProgOri(assProg => [...assProg, key]);
                break;
              }
              case "audit completed": {
                setcompletedList(completedList => [...completedList, key]);
                setcompletedListOri(completedList => [...completedList, key]);
                break;
              }
            }
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
  const loadAuditLists = () => {
    let l1 = { "user_id": localStorage.getItem("rsa_user") }
    AxiosApp.post(url1 + "audit_details", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          l1 = response.data.details;
          if (l1) {
            setAuditData(l1)
            setAuditDataOri(l1)
            let count = 0;
            let r1 = [];
            for (let element of response.data.details) {
              r1.push(createData(++count, element['audit_type'], element['stretch_name'], element['audit_id'],
                element['state'], element['district_name'], element['road_owning_agency'], element['name_of_road'],
                element['road_number'], element['stretch_length'], element['status'], element['auditor']));
            }
            setRows(r1)
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

  //for reassign modal
  const loadAuditorsList = () => {
    AxiosApp.post(url1 + "reassign_details")
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          setFullAuditList(l1.details)
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const getChosenAudits = (x) => {
    //x is the stretch chosen
    //loop thru the fullAuditList and set the auditList
    let l1 = [];
    console.log(fullAuditList);
    for (let index = 0; index < fullAuditList.length; index++) {
      const element = fullAuditList[index];
      if (element.audit_type_id == x) {
        for (let index = 0; index < element.audit_id.length; index++) {
          l1.push(element.audit_id[index])
        }
        break;
      }
    }
    setAuditList(l1)
    setDummy1(Math.random())
  }
  const getChosenAuditsDialog = (x, y) => {
    let l1 = {
      "audit_id": y,
      "audit_type_id": x
    }
      ;
    let l2 = {
      "audit_id": "",
      "audit_plan_id": "",
      "audit_type_id": "",
      "auditor": "",
      "chainage_end": "",
      "chainage_start": "",
      "district_name": "",
      "road_owning_agency": "",
      "state": "",
      "stretch_length": '',
      "stretch_name": "",
      "type_of_audit": ""
    }
    AxiosApp.post(url1 + "audit_assigned_list", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          l1 = response.data.details[0];
          setAuditModalDetail(l1)
        } else {
          setAuditModalDetail(l2)
          setAlert("error");
          setAlertMsg(response.data.status);
        }
        setDummy1(Math.random())
      })
      .catch((error) => {
        setAuditModalDetail(l2)
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const handleOk = () => {
    let l1 = {
      "audit_id": auditModal,
      "audit_type_id": stretchModal,
      "assign_to": okAssign
    }
    AxiosApp.post(url1 + "reassign_audit", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          setAlert("success");
          setAlertMsg(response.data.status);
          //update table
          loadAuditLists()
          handleClose()
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

  //filter over the table
  const updateTable = (roa1, road1, stretch1, states1, dist1) => {
    //update table obj based on roa1,road1,stretch1,states1,dist1

    //for now only search based on stretch1 is there
    let l1 = [...auditData]
    let newL1 = []
    for (let index = 0; index < l1.length; index++) {
      const obj = l1[index];
      if (obj.stretch_name == stretch1 && stretch1 != "") {
        //add multiple conditions here
        newL1.push(obj)
      }
    }
    setAuditData(newL1)
  }
  useEffect(() => {
    loadLists()
    loadAuditLists()
    loadDropdowns()
    loadAuditorsList()
  }, [])

  const clearFilter = () => {
    setRoa1('')
    setRoad1('')
    setStretch1('')
    setStates1('')
    setDist1('')
    setAuditData(auditDataOri)
  }
  function searchList(l1) {
    //filter the lists
    function filterIt(arrayOfAllObjects, searchKey) {
      let arrayOfMatchedObjects = arrayOfAllObjects.filter(object => {
        return JSON.stringify(object)
          .toString()
          .toLowerCase()
          .includes(searchKey);
      });
      return arrayOfMatchedObjects;
    }
    if (l1) {
      let l11 = filterIt(createdList, l1);

      setCreatedList(filterIt(createdList, l1))
      setPlannedList(filterIt(plannedList, l1))
      setTemplateList(filterIt(templateList, l1))
      setAssStart(filterIt(assStart, l1))
      setAssProg(filterIt(assProg, l1))
      setApprovedList(filterIt(approvedList, l1))
      setRejectedList(filterIt(rejectedList, l1))
      setSubmittedList(filterIt(submittedList, l1))
      setcompletedList(filterIt(completedList, l1))
    } else {
      setCreatedList(createdListOri)
      setPlannedList(plannedListOri)
      setTemplateList(templateListOri)
      setAssStart(assStartOri)
      setAssProg(assProgOri)
      setApprovedList(approvedListOri)
      setRejectedList(rejectedListOri)
      setSubmittedList(submittedListOri)
      setcompletedList(completedListOri)
    }
  }

  function handleSearch() {
    let l1 = document.getElementById('searchString').value;
    searchList(l1)
    return;
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
          <p style={{ fontSize: "26px", fontWeight: "600" }}>Audit Section</p>
          <br />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <Button
              onClick={() => setTab(0)}
              style={{
                backgroundColor: tab == 0 ? "rgba(46, 75, 122, 1)" : "white",
                color: tab == 0 ? "white" : "rgba(46, 75, 122, 1)",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                fontWeight: 500,
              }}
            >
              Create Audit
            </Button>
            <Button
              onClick={() => setTab(1)}
              style={{
                backgroundColor: tab == 1 ? "rgba(46, 75, 122, 1)" : "white",
                color: tab == 1 ? "white" : "rgba(46, 75, 122, 1)",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                fontWeight: 500,
              }}
            >
              Audit list
            </Button>

          </div>
          {tab == 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    // paddingTop: "20px",
                  }}
                ></div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button style={{
                    backgroundColor: subTab == 1 ? "rgba(46, 75, 122, 1)" : "white",
                    color: subTab == 1 ? "white" : "rgba(46, 75, 122, 1)",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    fontWeight: 500,
                  }} variant={"outlined"} onClick={() => setSubTab(1)}>Create</Button>
                  <Button style={{
                    backgroundColor: subTab == 2 ? "rgba(46, 75, 122, 1)" : "white",
                    color: subTab == 2 ? "white" : "rgba(46, 75, 122, 1)",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    fontWeight: 500,
                  }} variant={"outlined"} onClick={() => setSubTab(2)}>Assigned</Button>
                  <Button style={{
                    backgroundColor: subTab == 3 ? "rgba(46, 75, 122, 1)" : "white",
                    color: subTab == 3 ? "white" : "rgba(46, 75, 122, 1)",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    fontWeight: 500,
                  }} variant={"outlined"} onClick={() => setSubTab(3)}>Completed</Button>
                </div>
                <FormControl sx={{ m: 1, width: "200px" }}>
                  <InputLabel htmlFor="outlined-adornment-amount">
                    Search in Audit
                  </InputLabel>
                  <OutlinedInput
                    id="searchString"
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "black" }} />
                      </InputAdornment>
                    }
                    label="Search in Audit"
                    onChange={() => handleSearch()}
                  />
                </FormControl>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    // paddingTop: "20px",
                  }}
                ></div>
              </div>
              {subTab == 1 && /** create sub tab */
                <div style={{ marginTop: "15px" }}>
                  <div>
                    <div
                      style={{
                        width: "170px",
                        height: "170px",
                        background: "rgba(46, 75, 122, 1)",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/Audit/createAudit")}
                    >
                      <img src={adiutimg} />
                      <p
                        style={{
                          color: "white",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        Create
                      </p>
                    </div>
                    <br />
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>

                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "rgba(46, 75, 122, 1)",
                            marginBottom: "10px",
                          }}
                        >
                          Saved Templates
                        </p>
                      </AccordionSummary>
                      {console.log(templateList, 'templateList')}
                      <AccordionDetails>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                          }}
                        >
                          {templateList.map((itm) => (
                            <div
                              style={{
                                border: "1px solid rgba(127, 163, 222, 0.3)",
                                width: "314px",
                                height: "170px",
                                borderRadius: "7px",
                                padding: "20px",
                                display: "flex",
                                background: "rgba(238, 245, 150, 0.3)",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{ display: "flex", flexDirection: "column" }}
                              >
                                <p style={{
                                  fontSize: "16px",
                                  fontWeight: "400",
                                  color: "rgba(46, 75, 122, 1)",
                                  marginBottom: "3px",
                                }}>
                                  {itm.audit_id}{" "}{itm.stretch_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.audit_method}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.road_type}
                                </p>{" "}
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.stage}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    Created on:{" "}
                                    {new Date(itm.created_on).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>

                                  {/* <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    Last used on 9th may 2024
                                  </p> */}
                                </div>
                                <div>
                                  <Button
                                    id={itm.audit_type_id}

                                    onClick={() => {
                                      //window.alert("send these details auditID,auditName and template false")
                                      navigate("/Audit/createAudit",
                                        {
                                          state: {
                                            tempID: itm.template_id, auditName: itm.audit_method,
                                            template: true
                                          }
                                        })
                                    }}
                                    style={{
                                      backgroundColor: "rgb(223, 151, 27)",
                                      color: "white",
                                    }}
                                  >
                                    USE
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {templateList.length == 0 &&
                            <span>No Results found<br /></span>}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                  <div style={{ marginTop: "15px", marginBottom: "10px" }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "rgba(46, 75, 122, 1)",
                            marginBottom: "10px",
                          }}
                        >
                          Created
                        </p>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                          }}
                        >
                          {createdList.map((itm) => (
                            <div
                              style={{
                                border: "1px solid rgba(127, 163, 222, 0.3)",
                                width: "314px",
                                height: "170px",
                                borderRadius: "7px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{ display: "flex", flexDirection: "column" }}
                              >
                                <p style={{
                                  fontSize: "16px",
                                  fontWeight: "400",
                                  color: "rgba(46, 75, 122, 1)",
                                  marginBottom: "3px",
                                }}>
                                  {itm.audit_id}{" "}{itm.stretch_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.audit_method}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.road_type}
                                </p>{" "}
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.stage}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    Created on:{" "}
                                    {new Date(itm.created_on).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>

                                  {/* <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    Last used on 9th may 2024
                                  </p> */}
                                </div>
                                <div>
                                  <Button
                                    id={itm.audit_type_id}

                                    onClick={() => {
                                      //window.alert("send these details auditID,auditName and template false")
                                      navigate("/Audit/planning",
                                        { state: { auditID: itm.audit_type_id, auditName: itm.stretch_name, template: false } })
                                    }}
                                    style={{
                                      backgroundColor: "rgb(223, 151, 27)",
                                      color: "white",
                                    }}
                                  >
                                    Plan
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {createdList.length == 0 &&
                            <span>No Results found</span>}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                  {localStorage.getItem("rsa_type") != "owner" &&
                    <div style={{ marginTop: "15px", marginBottom: "10px" }}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>

                          <p
                            style={{
                              fontSize: "18px",
                              fontWeight: "600",
                              color: "rgba(46, 75, 122, 1)",
                              marginBottom: "10px",
                            }}
                          >
                            Planned
                          </p>
                        </AccordionSummary>
                        <AccordionDetails>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr",
                              gap: "20px",
                            }}
                          >
                            {plannedList.map((itm) => (
                              <div
                                style={{
                                  border: "1px solid rgba(127, 163, 222, 0.3)",
                                  width: "314px",
                                  height: "170px",
                                  borderRadius: "7px",
                                  padding: "20px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div
                                  style={{ display: "flex", flexDirection: "column" }}
                                >
                                  <p
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.audit_id}{" "}{itm.stretch_name}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.road_owning_agency}
                                  </p>{" "}
                                  <p
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.name_of_road}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div>
                                    <p
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: "400",
                                        color: "rgba(46, 75, 122, 1)",
                                        marginBottom: "3px",
                                      }}
                                    >
                                      Created on:{" "}
                                      {new Date(itm.created_on).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </p>

                                    {/* <p
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: "400",
                                        color: "rgba(46, 75, 122, 1)",
                                        marginBottom: "3px",
                                      }}
                                    >
                                      Last used on 9th may 2024
                                    </p> */}
                                  </div>
                                  <div>
                                    <Button
                                      id={itm.audit_type_id}
                                      // onClick={() => setTab(1)}
                                      style={{
                                        backgroundColor: "rgba(0, 186, 117, 1)",
                                        color: "white",
                                      }}
                                      onClick={() => {
                                        //window.alert("send these details auditID,auditName,auditPlanID")
                                        navigate("/Audit/Assignment",
                                          {
                                            state: {
                                              auditID: itm.audit_type_id, auditName: itm.stretch_name, auditPlanID: itm.audit_plan_id, template: false,
                                              chain: itm.chainage_start + "-" + itm.chainage_end
                                            }
                                          }
                                        )
                                      }}
                                    >
                                      Assign
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {plannedList.length == 0 &&
                              <span>No Results found</span>}
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  }
                </div>
              }
              {subTab == 2 && /** assigned sub tab */
                <div style={{ marginTop: "15px" }}>
                  <div style={{ marginTop: "15px", marginBottom: "10px" }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "rgba(46, 75, 122, 1)",
                            marginBottom: "10px",
                          }}
                        >
                          Audit Assigned
                        </p>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* /** yet to start */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                          }}
                        >
                          {assStart.map((itm) => (
                            <div
                              style={{
                                border: "5px solid rgb(162, 113, 156)",
                                width: "314px",
                                height: "170px",
                                borderRadius: "7px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{ display: "flex", flexDirection: "column" }}
                              >
                                <p style={{
                                  fontSize: "16px",
                                  fontWeight: "400",
                                  color: "rgba(46, 75, 122, 1)",
                                  marginBottom: "3px",
                                }}>
                                  {/* {itm.audit_id}{" "} */}
                                  {itm.stretch_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.auditor}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.status}
                                </p>{" "}
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.created_by}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.type_of_audit}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.submit_date}
                                  </p>
                                </div>
                                <div>
                                  <Button
                                    id={itm.audit_type_id}

                                    onClick={() => { setOpenThree(true); setShowObj(itm) }}
                                    style={{
                                      backgroundColor: "rgb(223, 151, 27)",
                                      color: "white",
                                    }}
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {assStart.length == 0 &&
                            <span>No Results found</span>}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                    <br />
                    { /** in progress */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "rgba(46, 75, 122, 1)",
                            marginBottom: "10px",
                          }}
                        >
                          Audit Started
                        </p>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                          }}
                        >
                          {assProg.map((itm) => (
                            <div
                              style={{
                                border: "5px solid rgb(162, 243, 156)",
                                width: "314px",
                                height: "170px",
                                borderRadius: "7px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                //background:"rgb(162, 243, 156)"
                              }}
                            >
                              <div
                                style={{ display: "flex", flexDirection: "column" }}
                              >
                                <p style={{
                                  fontSize: "16px",
                                  fontWeight: "400",
                                  color: "rgba(46, 75, 122, 1)",
                                  marginBottom: "3px",
                                }}>
                                  {/* {itm.audit_id}{" "} */}
                                  {itm.stretch_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.auditor}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.status}
                                </p>{" "}
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.created_by}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.type_of_audit}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.submit_date}
                                  </p>
                                </div>
                                <div>
                                  <Button
                                    id={itm.audit_type_id}

                                    onClick={() => { setOpenThree(true) }}
                                    style={{
                                      backgroundColor: "rgb(223, 151, 27)",
                                      color: "white",
                                    }}
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {assProg.length == 0 &&
                            <span>No Results found</span>}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                </div>
              }




              {subTab == 3 && /** assigned sub tab */
                <div style={{ marginTop: "15px" }}>
                  <div style={{ marginTop: "15px", marginBottom: "10px" }}>
                    {/********************* */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "rgba(46, 75, 122, 1)",
                            marginBottom: "10px",
                          }}
                        >
                          Audit Completed
                        </p>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                          }}
                        >
                          {completedList.map((itm) => (
                            <div
                              style={{
                                border: "5px solid rgb(225, 240, 127)",
                                width: "314px",
                                height: "170px",
                                borderRadius: "7px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                //background:"rgb(225, 240, 127)"
                              }}
                            >
                              <div
                                style={{ display: "flex", flexDirection: "column" }}
                              >
                                <p style={{
                                  fontSize: "16px",
                                  fontWeight: "400",
                                  color: "rgba(46, 75, 122, 1)",
                                  marginBottom: "3px",
                                }}>
                                  {/* {itm.audit_id}{" "} */}
                                  {itm.stretch_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.auditor}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.status}
                                </p>{" "}
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.created_by}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.type_of_audit}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.submit_date}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {completedList.length == 0 &&
                            <span>No Results found</span>}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                    <br />
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "rgba(46, 75, 122, 1)",
                            marginBottom: "10px",
                          }}
                        >
                          Report Submitted
                        </p>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* /** Report submitted */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                          }}
                        >
                          {submittedList.map((itm) => (
                            <div
                              style={{
                                border: "5px solid rgb(225, 120, 27)",
                                width: "314px",
                                height: "170px",
                                borderRadius: "7px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                //background:"rgb(225, 240, 127)"
                              }}
                            >
                              <div
                                style={{ display: "flex", flexDirection: "column" }}
                              >
                                <p style={{
                                  fontSize: "16px",
                                  fontWeight: "400",
                                  color: "rgba(46, 75, 122, 1)",
                                  marginBottom: "3px",
                                }}>
                                  {/* {itm.audit_id}{" "} */}
                                  {itm.stretch_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.auditor}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.status}
                                </p>{" "}
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.created_by}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.type_of_audit}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.submit_date}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {submittedList.length == 0 &&
                            <span>No Results found</span>}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                    <br />
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        { /** Report Approved */}
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "rgba(46, 75, 122, 1)",
                            marginBottom: "10px",
                          }}
                        >
                          Report Approved
                        </p>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                          }}
                        >
                          {approvedList.map((itm) => (
                            <div
                              style={{
                                border: "5px solid rgb(225, 180, 127)",
                                width: "314px",
                                height: "170px",
                                borderRadius: "7px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                //background:"rgb(179, 235, 233)"
                              }}
                            >
                              <div
                                style={{ display: "flex", flexDirection: "column" }}
                              >
                                <p style={{
                                  fontSize: "16px",
                                  fontWeight: "400",
                                  color: "rgba(46, 75, 122, 1)",
                                  marginBottom: "3px",
                                }}>
                                  {/* {itm.audit_id}{" "} */}
                                  {itm.stretch_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.auditor}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.status}
                                </p>{" "}
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.created_by}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.type_of_audit}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.submit_date}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {approvedList.length == 0 &&
                            <span>No Results found</span>}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                    <br />
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        { /** Report Rejected */}
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "rgba(46, 75, 122, 1)",
                            marginBottom: "10px",
                          }}
                        >
                          Report Rejected
                        </p>
                      </AccordionSummary>
                      <AccordionDetails>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                          }}
                        >
                          {rejectedList.map((itm) => (
                            <div
                              style={{
                                border: "5px solid rgb(225, 100, 127)",
                                width: "314px",
                                height: "170px",
                                borderRadius: "7px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                //background:"rgb(237, 154, 162)"
                              }}
                            >
                              <div
                                style={{ display: "flex", flexDirection: "column" }}
                              >
                                <p style={{
                                  fontSize: "16px",
                                  fontWeight: "400",
                                  color: "rgba(46, 75, 122, 1)",
                                  marginBottom: "3px",
                                }}>
                                  {/* {itm.audit_id}{" "} */}
                                  {itm.stretch_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.auditor}
                                </p>
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.status}
                                </p>{" "}
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {itm.created_by}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.type_of_audit}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      color: "rgba(46, 75, 122, 1)",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {itm.submit_date}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {rejectedList.length == 0 &&
                            <span>No Results found</span>}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                </div>
              }
            </div>
          )}
          {tab == 1 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    // paddingTop: "20px",
                  }}
                ></div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "6px",
                }}
              >
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  Audit List
                </p>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  {/* <FormControl sx={{ m: 1, width: "200px" }}>
                    <InputLabel htmlFor="outlined-adornment-amount">
                      Search
                    </InputLabel>
                    <OutlinedInput
                      size="small"
                      id="searchString"
                      startAdornment={
                        <InputAdornment position="start">
                          <SearchIcon style={{ color: "black" }} />
                        </InputAdornment>
                      }
                      label="Search"
                      onChange={()=>handleSearchInDG()}
                    />
                  </FormControl>{" "} */}
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    style={{
                      backgroundColor: "rgb(46, 75, 122)",
                      color: "white",
                      // width: "70%",
                      height: "50 px",
                    }}
                    onClick={handleOpen}
                  >
                    Reassign audit
                  </Button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    // paddingTop: "20px",
                  }}
                ></div>
              </div>
              <div
                style={{
                  marginTop: "15px",
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  maxHeight: "500px",
                  width: "100%",
                  overflow: "auto",
                  backgroundColor: "rgba(127, 163, 222, 0.1)",
                  borderRadius: "10px",
                  display: "none",//"grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 15px",
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Road Owning Agency</InputLabel>
                  {/* <Select variant="outlined" defaultValue=""
                    onChange={(e)=>{
                        setRoa1(e.target.value);
                        updateTable()
                      }}>
                     {
                      roa.map((x,index)=>                    
                        <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                      )
                      }
                  </Select> */}
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Road Name</InputLabel>
                  {/* <Select variant="outlined" defaultValue=""
                    onChange={(e)=>{
                      setRoad1(e.target.value);
                      updateTable()
                    }}>
                  {
                    road.map((x,index)=>                    
                      <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                    )
                    }
                  </Select> */}
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Stretch Name</InputLabel>
                  <Select variant="outlined"
                    value={stretch1}
                    onChange={(e) => {
                      setStretch1(e.target.value);
                      updateTable(roa1, road1, e.target.value, states1, dist1)
                    }}>
                    {
                      stretch.map((x, index) =>
                        <MenuItem key={x[0]} value={x[1]}>{x[1]}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>State</InputLabel>
                  {/* <Select variant="outlined" defaultValue=""
                    onChange={(e)=>{
                      setStates1(e.target.value);
                      updateTable()
                    }}>
                    {
                    states.map((x,index)=>                    
                      <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                    )
                    }                    
                  </Select> */}
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>District</InputLabel>
                  {/* <Select variant="outlined" defaultValue=""onChange={(e)=>{
                        setDist1(e.target.value);
                        updateTable()
                      }}>
                     {
                      dist.map((x,index)=>                    
                        <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                      )
                      }
                  </Select> */}
                </FormControl>
                <Button onClick={() => clearFilter()}>Clear</Button>
              </div>
              <div style={{ marginTop: "15px" }}>
                {/* <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                      >
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          SI.no
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Stretch Id
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Stretch Name
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Audit Id
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          State
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          District
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Road owning agency
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Road name
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Road number
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Stretch length
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Assign to
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditData.map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              backgroundColor:
                                index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                            onClick={()=>{
                              handleOpenTwo();
                              setViewAuditObj(auditData[index])}}
                          >
                          <TableCell>{index}</TableCell>
                          <TableCell>{row.audit_type}</TableCell>
                          <TableCell>{row.stretch_name}</TableCell>
                          <TableCell>{row.audit_id}</TableCell>
                          <TableCell>{row.state}</TableCell>
                          <TableCell>{row.district_name}</TableCell>
                          <TableCell>{row.road_owning_agency}</TableCell>
                          <TableCell>{row.name_of_road}</TableCell>
                          <TableCell>{row.road_number}</TableCell>
                          <TableCell>{row.stretch_length}</TableCell>                          
                          <TableCell>{row.status}</TableCell>                          
                          <TableCell>{row.auditor}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer> */}
                <DataGrid
                  sx={{ overflow: 'hidden' }}
                  pageSizeOptions={[50, 100, 150]}
                  rows={rows}
                  columns=
                  {columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 50,
                      },
                    },
                    density: 'comfortable',
                  }}
                  disableRowSelectionOnClick
                  //disableColumnFilter
                  //disableColumnSelector
                  disableDensitySelector
                  slots={{
                    toolbar: GridToolbarQuickFilter,
                  }}
                  localeText={{
                    toolbarQuickFilterPlaceholder: 'Search...'
                  }}
                >
                </DataGrid>
              </div>
            </div>
          )}
        </div>

        {/* modal one(reassign)  REASSIGN AUDIT DETAILS PAGE*/}
        <div> <p style={{
          display: "none"
        }}>{dummy1}</p>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  Reassign Audit
                </Typography>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Stretch Id </InputLabel>
                  <Select variant="outlined" defaultValue=""
                    value={stretchModal}
                    onChange={(e) => {
                      setStretchModal(e.target.value);
                      getChosenAudits(e.target.value);
                    }}>
                    {
                      stretch.map((x, index) =>
                        <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Audit Id</InputLabel>
                  <Select variant="outlined" defaultValue=""
                    value={auditModal}
                    onChange={(e) => {
                      setAuditModal(e.target.value);
                      getChosenAuditsDialog(stretchModal, e.target.value);
                    }}>
                    {
                      auditList.map((x, index) =>
                        <MenuItem key={x} value={x}>{x}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
              </div>
              <div
                style={{
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  // height: "200px",
                  marginTop: "15px",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  Audit Details
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                ><p style={{
                  display: "none"
                }}>{dummy1}</p>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Stretch Name: {auditModalDetail.stretch_name}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    State:{auditModalDetail.state}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    District:{auditModalDetail.district_name}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Type of audit:{auditModalDetail.type_of_audit}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Assigned Auditors Name:{auditModalDetail.auditor}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Auditor Id:{auditModalDetail.auditor}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Road owning agency:{auditModalDetail.road_owing_agency}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Chainage:{auditModalDetail.chainage_start} - {auditModalDetail.chainage_end}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Length:{auditModalDetail.stretch_length}
                  </div>
                </div>
              </div>
              <FormControl fullWidth required style={{ marginTop: "15px" }}>
                <InputLabel>Assign auditor</InputLabel>
                <Select variant="outlined" defaultValue=""
                  onChange={(e) => { setOkAssign(e.target.value) }}>
                  {
                    auditorsList.map((x, index) => {
                      if (auditModalDetail.auditor != x[1])
                        return (
                          <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                        )
                    }
                    )
                  }
                </Select>
              </FormControl>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  style={{
                    backgroundColor: "rgb(46, 75, 122)",
                    color: "white",
                    marginTop: "15px",
                  }}
                  onClick={() => handleOk()}
                >
                  Assign
                </Button>
              </div>
            </Box>
          </Modal>
        </div>
        {/* modal two (detail) AUDIT DETAIL TABLE ROW CLICK*/}
        <div>
          <Modal
            open={openTwo}
            onClose={handleCloseTwo}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style} style={{ height: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  Audit Detail
                </Typography>
              </div>
              <div
                style={{
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  // height: "200px",
                  marginTop: "15px",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Stretch Name:{viewAuditObj.stretch_name}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    State:{viewAuditObj.state}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    District:{viewAuditObj.district_name}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Type of audit:{viewAuditObj.type_of_audit}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Assigned Auditors Name:{viewAuditObj.auditor}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Auditor Id:{viewAuditObj.auditor}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Road owning agency:{viewAuditObj.road_owning_agency}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Chainage:{viewAuditObj.type_of_audit}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Length:{viewAuditObj.stretch_length}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  style={{
                    backgroundColor: "rgb(46, 75, 122)",
                    color: "white",
                    marginTop: "15px",
                  }}
                  onClick={handleCloseTwo}
                >
                  Close
                </Button>
              </div>
            </Box>
          </Modal>
        </div>
        {/* modal to view assigned audit */}
        <div>
          <Modal
            open={openThree}
            onClose={handleCloseThree}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style} style={{ height: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  Assigned Audit Detail :
                </Typography>
              </div>
              <div
                style={{
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  // height: "200px",
                  marginTop: "15px",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Stretch Name: {showObj.stretch_name}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Status:{showObj.status}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Created by: {showObj.created_by}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Type of audit:{showObj.type_of_audit}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(119, 114, 114, 1)",
                    }}
                  >
                    Assigned Auditors Name:
                    {/** loop thru auditor stretch */}
                    {showObj.auditor_stretch != null && Object.keys(showObj.auditor_stretch).map((key, i) => {
                      if (key != null) {
                        return (
                          <div>
                            <p>{showObj.auditor_name}</p>
                            {"Travel Direction" != showObj.type_of_audit && <>
                              <p>{"Start point:"}{showObj.auditor_stretch[key].start_point}</p>
                              <p>{"End point:"}{showObj.auditor_stretch[key].end_point}</p>
                            </>}
                            {"Travel Direction" == showObj.type_of_audit && <>
                              <p>{"Direction:"}{showObj.auditor_stretch[key].travel_direction}</p>
                            </>}
                          </div>)
                      }
                    })}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  style={{
                    backgroundColor: "rgb(46, 75, 122)",
                    color: "white",
                    marginTop: "15px",
                  }}
                  onClick={handleCloseThree}
                >
                  Close
                </Button>
              </div>
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Audit;
