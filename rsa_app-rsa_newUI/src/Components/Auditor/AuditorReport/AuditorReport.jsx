/** this is the single format report page structure. */
import React, { useState, useEffect } from "react";
import AuditorHeader from "../AuditorHeader/AuditorHeader";
import {
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
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbarQuickFilter, GridRenderCellParams } from '@mui/x-data-grid';
import AxiosApp from "../../../common/AxiosApp";
import { url1 } from "../../../App";
import CustomAlerts from "../../../common/CustomAlerts";
import CustomLoader from "../../../common/customLoader";
import FinalRepot1 from "../../FinalReport/FinalRepot1";
import AE_FinalReport from "../../AE/AEAudit/AE_FinalReport";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
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



const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  height: "70vh",
  overflow: "scroll",
  bgcolor: "background.paper",
  borderRadius: "10px",
  justifyContent: 'center',
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
  zIndex: "100900",
};



function AuditorReport() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [isload, setIsload] = useState("");

  const [uadid, setuAdiId] = useState("");
  const [uatyid, setAdTyId] = useState("");

  const [openFinalReport, setOpenFinalReport] = React.useState(false);
const [openAEFinalReport, setOpenAEFinalReport] = React.useState(false);

  const handleOpenFRFn = (aid, atypeID) => {

    console.log("aid >> " + aid, " type id >> " + atypeID)
    setuAdiId(aid);
    setAdTyId(atypeID)

    handleOpenFR();
  };

  const handleOpenAEFnReport = (aid, atypeID) => {

    console.log("aid >> " + aid, " type id >> " + atypeID)
    setuAdiId(aid);
    setAdTyId(atypeID)

    handleOpenAEFR();
  };
  
  const handleOpenAEFR = () => {
    setOpenAEFinalReport(true);

    console.log("first");
  };
  const handleCloseAEFR = () => setOpenAEFinalReport(false);



  const handleOpenFR = () => {
    setOpenFinalReport(true);

    console.log("first");
  };
  const handleCloseFR = () => setOpenFinalReport(false);


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

  // const [rows, setRows] = React.useState([
  //     { 'id': '', 'audit_type_id':'','road_type': '', 'stage': '', 'stretch_name':'',
  //     'audit_id':'','status':''}]);
  const [rows, setRows] = useState([])

  const columns = [
    { field: 'id', flex: 0.5, headerName: 'S.No' },
    { field: 'audit_type', flex: 1, headerName: 'Audit type' },
    { field: 'audit_type_id', flex: 1, headerName: 'Audit type id' },
    {
      field: 'stretch_name', flex: 1, headerName: 'Stretch Name',
      renderCell: (params) => {
        return (
          <Button onClick={() => handleOpen()}
          >
            {params.row.stretch_name}
          </Button>)
      }
    },
    { field: 'road_type', flex: 1, headerName: 'Road Type' },
    { field: 'stage', flex: 1, headerName: 'Stage' },
    {
      field: 'report', flex: 1, headerName: 'Report',
      renderCell: (params) => {
        let l1 = params.row.user_status;
        let l3 = params.row.audit_id;
        let l2 = (params.row.user_status == null) ? true : false;
        let l4 = params.row.audit_type_id
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "10px",
              margin: '10px 0px 10px 0px'
            }}
          >
            <Button
              style={{
                color: "black",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                display: "flex",
                gap: "10px",
              }}
              // disabled = {(params.row.status == "Report Submitted")?true:false}
              onClick={() => {
                navigate("/Auditor_data", {
                  state: {
                    aid: l3
                    , uid: localStorage.getItem("rsa_user1"),
                    atypeID: params.row.audit_type_id, editMode: true
                  }
                })
              }}
            >
              <DescriptionIcon />
              Edit Report
            </Button>
            {/* <Button
              style={{
                color: "black",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                display: "flex",
                gap: "10px",
              }}
              onClick={() => navigate("/AE_FinalReport", { state: { aid: l3, atid: l4, hidePrint: true } })}
            >
              AE Report
            </Button> */}




 <Button
            style={{
              color: "black",
              border: "1px solid rgba(127, 163, 222, 0.3)",
              display: "flex",
              gap: "10px",
            }}
            // disabled = {(params.row.status == "Report Submitted")?true:false}
            onClick={() => {
              handleOpenAEFnReport(l3, l4)
            }
            }
          >
            <DescriptionIcon />
            View AE Report
          </Button>



          </div>
        );
      },
    },
    {
      field: 'action', flex: 1, headerName: 'Action',
      renderCell: (params) => {
        let l1 = params.row.user_status;
        let l3 = params.row.audit_id
        let l4 = params.row.audit_type_id
        let l2 = (params.row.user_status == null) ? true : false;


        console.log(l1)
        console.log(l2)
        console.log(l3)
        console.log(l4)
        return (
          // <Button
          //   style={{
          //     color: "black",
          //     border: "1px solid rgba(127, 163, 222, 0.3)",
          //     display: "flex",
          //     gap: "10px",
          //     background: "rgba(43, 154, 102, 1)",
          //     color: "white",
          //     margin:"10px"
          //   }}
          //   onClick={() => navigate("/Report_final", { state: { aid: l3, atid: l4 } })}
          // >
          //   View and Submit
          // </Button> 


          <Button
            style={{
              color: "black",
              border: "1px solid rgba(127, 163, 222, 0.3)",
              display: "flex",
              gap: "10px",
            }}
            // disabled = {(params.row.status == "Report Submitted")?true:false}
            onClick={() => {
              handleOpenFRFn(l3, l4)
            }
            }
          >
            <DescriptionIcon />
            View Report
          </Button>


        );
      }
    },
    // {
    //   field: 'comments', flex: 1, headerName: 'Comments',
    //   renderCell: (params) => {
    //     let l3 = params.row.audit_id;
    //     return (
    //       <Button style={{
    //         color: "black",
    //         border: "1px solid rgba(127, 163, 222, 0.3)",
    //         display: "flex",
    //         gap: "10px",
    //         background: "rgba(43, 154, 102, 1)",
    //         color: "white",
    //       }}
    //         onClick={() => navigate("/Report_comment_form", { state: { aid: l3 } })}
    //       >
    //         View Comments
    //       </Button>)
    //   }
    // },
    { field: 'status', flex: 1, headerName: 'Status' },
  ];
  function createData(id, audit_type, audit_type_id, road_type, stage, stretch_name, audit_id, status) {
    return { id, audit_type, audit_type_id, road_type, stage, stretch_name, audit_id, status };
  }
  const loadLists = () => {
    let l1 = { "userid": localStorage.getItem("rsa_user1") }
    AxiosApp.post(url1 + "auditor_report_list", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        console.log(l1)
        if (response.data.statusCode == "200") {
          l1 = response.data.details;
          setReportListOri(l1)
          let count = 0;
          let r1 = [];
          for (let element of response.data.details) {
            r1.push(createData(++count, element['audit_plan_Type'], element['audit_type_id'],
              element['road_type'], element['stage'], element['stretch_name'],
              element['audit_id'], element['status']));
          }
          setRows(r1)
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
    loadLists()
  }, [])
  return (

    <div>
      <AuditorHeader />
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
          {/* <TableContainer style={{ marginTop: "15px" }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    SI no
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Road Type
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Stage
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Road name
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Stretch Id
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Stretch Name
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Report
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Action
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1].map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                    }}
                  >
                    <TableCell align="center">{"1"}</TableCell>
                    <TableCell align="center">{"lkn"}</TableCell>
                    <TableCell align="center">{"etgf"}</TableCell>
                    <TableCell align="center">{"road"}</TableCell>
                    <TableCell
                      align="center"
                      onClick={handleOpen}
                      style={{
                        color: "rgba(5, 136, 240, 1)",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {"NE_04_TN_01"}
                    </TableCell>
                    <TableCell align="center">{"STRNAME"}</TableCell>
                    <TableCell align="center">
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
                          }}
                          onClick={() => 
                            navigate("/Report_final",{state:{aid:"Audit06595"}})}
                        >
                          <DescriptionIcon />
                          View Report
                        </Button>
                        <Button
                          style={{
                            color: "black",
                            border: "1px solid rgba(127, 163, 222, 0.3)",
                            display: "flex",
                            gap: "10px",
                          }}
                          onClick={() => {
                            navigate("/Auditor_data",{state:{aid:"Audit06595"
                              ,uid:localStorage.getItem("rsa_user1"),editMode:true}})
                          }}
                        >
                          <DescriptionIcon />
                          Edit Report
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      {
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <Button
                            style={{
                              color: "black",
                              border: "1px solid rgba(127, 163, 222, 0.3)",
                              display: "flex",
                              gap: "10px",
                              background: "rgba(43, 154, 102, 1)",
                              color: "white",
                            }}
                          >
                            Submit
                          </Button>
                        </div>
                      }
                    </TableCell>

                    <TableCell
                      align="center"
                      style={{
                        color: "rgba(5, 136, 240, 1)",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/Report_comment_form")}
                    >
                      View Response
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer> */}
          <DataGrid getRowHeight={() => 'auto'}
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
              columns: {
                columnVisibilityModel: {
                  audit_type_id: false,
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
              toolbarQuickFilterPlaceholder: 'Search in the table'
            }}
          >
          </DataGrid>
        </div>
      </div>


      <div>
        {openFinalReport && (
          <Modal
            open={openFinalReport}
            onClose={handleCloseFR}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={styleModal}>
        
          <Button
                style={{
                  backgroundColor: "rgba(46, 75, 122, 1)",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                onClick={handleCloseFR}
              >
                X
              </Button>
        
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                Final Report
              </p>

            

              {/* <FinalReport /> */}
              <FinalRepot1 aid={uadid} atid={uatyid} />

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
                  onClick={handleCloseFR}
                >
                  Close
                </Button>
              </div>
            </Box>
          </Modal>
        )}
      </div>



  <div>
        {openAEFinalReport && (
          <Modal
            open={openAEFinalReport}
            onClose={handleCloseAEFR}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={styleModal}>
        
          <Button
                style={{
                  backgroundColor: "rgba(46, 75, 122, 1)",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                onClick={handleCloseAEFR}
              >
                X
              </Button>
        
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                AE Final Report
              </p>

            

              {/* <FinalReport /> */}
              <AE_FinalReport aid={uadid} atid={uatyid} />

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
                  onClick={handleCloseAEFR}
                >
                  Close
                </Button>
              </div>
            </Box>
          </Modal>
        )}
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
                  <p>Road Type</p>
                  <p>Stage</p>
                  <p>stretch Id </p>
                  <p>Road Name</p>
                  <p>Road Number</p>
                  <p>road owning agency </p>
                  <p>chainage</p>
                  <p>state</p>
                  <p>district</p>
                  <p>assigned Auditors Name </p>
                  <p>Auditor Id </p>
                  <p>started date</p>
                  <p>completed date</p>
                  <p>type of audit </p>
                  <p>Length </p>
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
    </div >
  );
}

export default AuditorReport;
