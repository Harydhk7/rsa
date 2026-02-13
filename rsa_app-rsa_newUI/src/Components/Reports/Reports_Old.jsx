/** This is the Report view from LA,Owner,Coers */
import React, { useState,useEffect } from "react";
import Header from "../Header/Header";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";
import AxiosApp from "../../common/AxiosApp";
import { url1 } from "../../App";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  // height: "70vh",
  bgcolor: "background.paper",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
  zIndex: "100900",
};
function Reports_old() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [isload, setIsload] = useState("");

  const handleOpen = () => {
    setOpen(true);

    console.log("first");
  };
  const handleClose = () => setOpen(false);
  const data = [
    {
      stretchId: 1,
      stretchName: "Stretch A",
      chainage: "10-20",
      leadAuditName: "John Doe",
      latLng: "12.34, 56.78",
      roadType: "Highway",
      assignDate: "2024-11-20",
      completedDate: "2024-11-21",
      workStatus: "Completed",
    },
    {
      stretchId: 2,
      stretchName: "Stretch B",
      chainage: "20-30",
      leadAuditName: "Jane Smith",
      latLng: "23.45, 67.89",
      roadType: "Urban",
      assignDate: "2024-11-19",
      completedDate: "2024-11-20",
      workStatus: "Pending",
    },
  ];
  const [reportListOri, setReportListOri] = useState([]);

  const [stretchList, setStretchList] = useState([[]])
  const [stretchNames, setStretchNames] = useState([])
  const [showObj, setShowObj] = useState([])
  const [allAuditDetails, setAllAuditDetails] = useState([])
  const [rows, setRows] = React.useState([
      { 'id': '', 'audit_type_id':'','road_type': '', 'stage': '', 'stretch_name':'',
      'audit_id':'','status':''}]);
  const columns= [
    { field: 'id', flex:0.5,headerName: 'S.No'},
    {field: 'audit_type_id',flex:1,headerName: 'Stretch ID'},
    {field: 'road_type',flex:1,headerName: 'Road Type'},
    {field: 'stage',flex:1,headerName: 'Stage'},
    {field: 'stretch_name',flex:1,headerName: 'Stretch Name'},
    {field: 'report',flex:1,headerName: 'Action',
      renderCell: (params) => {         
        let l1 = params.row.user_status;
        let l3 = params.row.audit_id;
        let l2 = (params.row.user_status == null)?true:false;
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Button
              style={{
                color: "black",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                display: "flex",
                gap: "10px",
                background:"green"
              }}
              onClick={() => {
                handleAppRej(l3,"approve")
              }}
            >
              Approve
            </Button>
            <Button
              style={{
                color: "black",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                display: "flex",
                gap: "10px",
                background:"red"
              }}
              onClick={() => {
               handleAppRej(l3,"reject")
              }}
            >
              Reject
            </Button>
          </div>
        );
      },
    },  
    {field: 'action',flex:1,headerName: 'Report',
      renderCell: (params) => {         
        let l1 = params.row.user_status;
        let l3 = params.row.audit_id
        let l2 = (params.row.user_status == null)?true:false;
        return (          
          <Button
          style={{
            color: "black",
            border: "1px solid rgba(127, 163, 222, 0.3)",
            display: "flex",
            gap: "10px",
            background: "rgba(43, 154, 102, 1)",
            color: "white",
          }}
          onClick={() => navigate("/Report_Add_Comment",{state:{aid:l3}})}
        >
          View and Add Comments
        </Button>
        );
      }
     },
    {field: 'status',flex:1,headerName: 'Status'},
    {field: 'comments',flex:1,headerName: 'Comments',
       renderCell:(params) =>{
      let l3 = params.row.audit_id;
      return(
      <Button style={{
        color: "black",
        border: "1px solid rgba(127, 163, 222, 0.3)",
        display: "flex",
        gap: "10px",
        background: "rgba(43, 154, 102, 1)",
        color: "white",
      }}
      onClick={() => navigate("/Report_comment_form",{state:{aid:l3}})}
      >
      View Comments
      </Button>)}      
    }
  ];
  function createData(id,audit_type_id,road_type,stage,stretch_name,audit_id,status) {
    return {id,audit_type_id,road_type,stage,stretch_name,audit_id,status};
  }
  const loadLists = () =>{
    let l1 = {"userid":localStorage.getItem("rsa_user") }
  AxiosApp.post(url1 + "admin_report_list",l1)
    .then((response) => {
      setIsload(false);
      let l1 = response.data;
      console.log(l1)
      if (response.data.statusCode == "200") {
        l1 = response.data.details;
        setReportListOri(l1)
        setStretchNames(Object.keys(l1))   
        let l2 = Object.values(l1)  
        let fullList = [[]]
        for (let index = 0; index < l2.length; index++) {          
          let count = 0;
          let r1 = [];
          for(let index1 = 0; index1 < l2[index].length; index1++){  
            let element = l2[index][index1]
            r1.push(createData(++count,element['audit_type_id'],element['road_type'],
              element['stage'],element['stretch_name'],element['audit_id'],element['status']));          
          }
          fullList[index] = r1;
        }
        setStretchList(fullList)        
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
  const onLanding = () =>{
    loadLists();
    loadAuditLists();
  }
  const handleAppRej = (x,y) =>{
    let f1 = new FormData();
    f1.append("audit_id",x)
    f1.append("approval",y)
    const config = {     
      headers: { 'content-type': 'multipart/form-data' }
    }
    AxiosApp.post(url1 + "report_approval", f1)
    .then((response) => {
        if (response.data.statusCode == "200") {
        console.log(response.data);
        setAlert("success");
        setAlertMsg(response.data.status);
        onLanding();
        return;
        }
    })
    .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
    }); 
  }
  const getDetails = (x) =>{
    //search in allAuditDetails, this audit and send it
    let l2 = allAuditDetails.filter(obj => obj.audit_id == x.audit_id)
    if(l2.length > 0){
      setShowObj(l2[0]); handleOpen()
    }
  }
  const loadAuditLists = () =>{
    let l1 = {"user_id":localStorage.getItem("rsa_user") }
    AxiosApp.post(url1 + "audit_details",l1)
    .then((response) => {
      setIsload(false);
      let l1 = response.data;
      if (response.data.statusCode == "200") {        
        setAllAuditDetails(l1.details)
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
  useEffect(()=>{ 
    onLanding();
  },[])

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
        className="rsa_usermanagement"
      >
        <div
          style={{
            backgroundColor: "white",
            minHeight: "90vh",
            width: "100%",
            borderRadius: "10px",
            padding: "15px",
          }}
        >
          <p style={{ fontSize: "26px", fontWeight: "600" }}>Report</p>{" "}
          {/* <div
            style={{
              marginTop: "15px",
              border: "1px solid rgba(127, 163, 222, 0.3)",
              height: "100px",
              width: "100%",
              backgroundColor: "white",
              borderRadius: "10px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr ",
              alignItems: "center",
              gap: "10px",
              padding: "10px 15px",
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Road Type</InputLabel>
              <Select variant="outlined" defaultValue="">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Stage</InputLabel>
              <Select variant="outlined" defaultValue="">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Road Name</InputLabel>
              <Select variant="outlined" defaultValue="">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Stretch Id</InputLabel>
              <Select variant="outlined" defaultValue="">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </Select>
            </FormControl>
          </div> */}
          <TableContainer style={{ marginTop: "15px" }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    SI no
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Road Type
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Stage
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Road name
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Stretch Id
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Stretch Name
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Report
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Action
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ width:"10%",color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Comments
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody> 
              {stretchNames.map((row, i) => (
              <>
              <TableRow> 
              <TableCell colspan="10">               
              <Accordion>    
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <div style={{                        
                        display: "flex",
                        padding:"10px",
                        //border: "1px solid rgba(18, 100, 232, 0.3)",
                        gap: "10px",
                        width:"100%"
                      }}>
                  <p style={{                        
                        flex:1,
                        fontSize: "18px", fontWeight: "600" 
                      }}>{row}</p>
                  <Button disabled variant="outlined"
                      onClick={() => navigate("/MergeAll",{state:{sid:row}})}
                    >
                      Merge and Save
                    </Button>
                    <Button disabled variant="outlined"
                      onClick={() => navigate("/view_merged_final",{state:{sid:row}})}
                    >
                      View Merged Document
                    </Button>
                    </div>
                </AccordionSummary>  
                <AccordionDetails>
                {stretchList[i].map((row, index) => (
                  <Table>
                  <TableRow
                    key={row}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                    }}
                  >
                    <TableCell sx={{ width:"20%" }} align="center">{index+1}</TableCell>
                    <TableCell sx={{ width:"10%" }} >{row.road_type}</TableCell>
                    <TableCell sx={{ width:"10%" }} >{row.stage}</TableCell>
                    <TableCell sx={{ width:"10%" }} >{row.stage}</TableCell>
                    <TableCell
                      align="center"
                      onClick={(e)=>getDetails(row)}
                      style={{
                        color: "rgba(5, 136, 240, 1)",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {row.audit_id}
                    </TableCell>
                    <TableCell sx={{ width:"10%" }} >{row.stretch_name}</TableCell>
                    <TableCell sx={{ width:"10%" }} >
                    <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              gap: "10px",
                            }}
                          >
                            <Button
                              style={{
                                color: "white",
                                border: "1px solid rgba(127, 163, 222, 0.3)",
                                display: "flex",
                                gap: "10px",
                                background:"green"
                              }}
                              onClick={(e,c) => {
                                handleAppRej(row.audit_id,"approve")
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              style={{
                                color: "white",
                                border: "1px solid rgba(127, 163, 222, 0.3)",
                                display: "flex",
                                gap: "10px",
                                background:"red"
                              }}
                              onClick={() => {                               
                               handleAppRej(row.audit_id,"reject")
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                    </TableCell>
                    <TableCell sx={{ width:"10%" }} >
                    <Button
                      style={{
                        color: "black",
                        border: "1px solid rgba(127, 163, 222, 0.3)",
                        display: "flex",
                        gap: "10px",
                        background: "rgba(43, 154, 102, 1)",
                        color: "white",
                      }}
                      onClick={() => navigate("/Report_Add_Comment",{state:{aid:row.audit_id}})}
                    >
                      View and Add Comments
                    </Button>
                    </TableCell>
                    <TableCell sx={{ width:"10%" }} >{row.status}</TableCell>
                    <TableCell sx={{ width:"10%" }}
                      align="center"
                      style={{
                        color: "rgba(5, 136, 240, 1)",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/Report_comment_form",{state:{aid:row.audit_id}})}
                    >
                      View Response
                    </TableCell>
                  </TableRow>
                  </Table>
                ))}
                </AccordionDetails>
                </Accordion>
              </TableCell>
              </TableRow> 
              </>))}
              </TableBody>
            </Table>
          </TableContainer> 
          {/* <DataGrid getRowHeight={() => 'auto'} 
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
                toolbarQuickFilterPlaceholder:'Search in the table'
              }}
              >              
          </DataGrid> */}
        </div>
      </div>

      {/* modal strctch */}
      <div>
        {open && (
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                }}
              >
                Stretch Detail
              </p>
              <div
                style={{
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  borderRadius: "10px",
                  // height: "10vh",
                  marginTop: "20px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    color: "rgba(119, 114, 114, 1)",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >     
                  <p>Road Type : {showObj.name_of_road}</p>
                  <p>Stage : {showObj.name_of_road}</p>
                  <p>stretch Id  : {showObj.stretch_name}</p>
                  <p>Road Name : {showObj.name_of_road}</p>
                  <p>Road Number : {showObj.road_number}</p>
                  <p>Road Owning Agency  : {showObj.road_owning_agency}</p>
                  <p>Chainage : {showObj.chainage_start + " - "+showObj.chainage_end}</p>
                  <p>State : {showObj.state}</p>
                  <p>District : {showObj.district_name}</p>
                  <p>Assigned Auditors Name  : {showObj.auditor}</p>
                  <p>Auditor Id  : {showObj.auditor}</p>
                  <p>Started date : {showObj.start_date}</p>
                  <p>Completed date : {showObj.submit_date}</p>
                  <p>Type of audit  : {showObj.type_of_audit}</p>
                  <p>Length  : {showObj.stretch_length}</p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <Button
                  style={{
                    backgroundColor: "rgba(46, 75, 122, 1)",
                    color: "white",
                  }}
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            </Box>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Reports_old;
