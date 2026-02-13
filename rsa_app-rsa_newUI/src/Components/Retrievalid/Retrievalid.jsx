import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { DataGrid,GridToolbarQuickFilter ,GridRenderCellParams } from '@mui/x-data-grid';
import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";

import { url1 } from "../../App";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  height: "70vh",
  bgcolor: "background.paper",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
};
function Retrievalid() {
  //   const [tab, setTab] = useState(0);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  //for table
  const [rowData, setRowData] = useState([])
  
  //for Add Popup
  const [roadList, setRoadList] = useState([])
  const [stageList, setStageList] = useState([])
  const [sectionList, setSectionList] = useState([])

  const [selRoad, setSelRoad] = useState('')
  const [selStage, setSelStage] = useState('')
  const [selSection, setSelSection] = useState('')
  const [selSection1, setSelSection1] = useState('')
  const [counter, setCounter] = useState(2)

  const [questionList, setQuestionList] = useState([])
  const [fullSubQList, setFullSubQList] = useState([])
  const [subQList, setSubQlist] = useState([])
  const [dummy, setDummy] = useState('')

  const [qSubPair, setQSubPair] = useState([])
  const [retID, setRetID] = useState([])

  const [rows, setRows] = React.useState([
    { 'id': '', 'roadType':'','stage': '', 'secID': '', 'sec':'',
      'rid': '','question':'','mt':''
    }]);
  const columns= [
    { field: 'id', flex:0.5,headerName: 'S.No'},
    {field: 'roadType',flex:1,headerName: 'Road type'},
    {field: 'stage',flex:1,headerName: 'Stage'},
    {field: 'secID',flex:1,headerName: 'Section ID'},
    {field: 'sec',flex:1,headerName: 'Section'},
    {field: 'rid',flex:1,headerName: 'Retrieval ID'},
    {field: 'question',flex:1,headerName: 'Question'},  
    {field: 'mt',flex:1,headerName: 'Master Table' }
  ];
  function createData(id,roadType, stage,secID,sec, rid, question, mt) {
    return {id,roadType, stage,secID,sec, rid, question, mt };
  }
  const formQString = ()=>{
    let s1 = "";
    let s2 = "";
    let count = 1;
    for (let index = 0; index < counter; index++) {
      let v1 = document.getElementById("subqid"+index).innerText;
      if(v1 == null) return;
      //search inside the fullarray and show in the list
      let q = document.getElementById("qid"+index).innerText;
      if(q ==null) return;
      for (let index = 0; index < fullSubQList.length; index++) {
        const element = fullSubQList[index];
        if(element[0] == q){
          let sq = element[1];
          for (const key in sq) {
            if(key == v1){
              if(count == 0 ) {s1 = s1.concat(",");s2=s2.concat(".");}
              s1 = s1.concat(sq[v1])
              s2 = s2.concat(key)
              count = 0
              break;
            }
          }
          break;
        }        
      }
    }
    document.getElementById("questions").innerText = s1;
    document.getElementById("retID").value = s2;
  }
  //Axios to fetch road,stage,section list
  const loadDropdowns=()=>{
    AxiosApp.post(url1 + "dropdowns")
    .then((response) => {
      setIsload(false);
      let l1 = response.data;
      if (response.data.statusCode == "200") { 
        if(l1['stage_types'] != '') {
          let k1 = Object.keys(l1['stage_types'])
          let v1 = Object.values(l1['stage_types'])
          let t1 = [];
          for (let index = 0; index < k1.length; index++) {
            t1.push([k1[index],v1[index]])
          }
          setStageList(t1)
        }
        if(l1['sections'] != '') {
          let k1 = Object.keys(l1['sections'])
          let v1 = Object.values(l1['sections'])
          let t1 = [];
          for (let index = 0; index < k1.length; index++) {
            t1.push([k1[index],v1[index]])
          }
          setSectionList(t1)
        }
        if(l1['road_types'] != ''){
          let k1 = Object.keys(l1['road_types'])
          let v1 = Object.values(l1['road_types'])
          let t1 = [];
          for (let index = 0; index < k1.length; index++) {
            t1.push([k1[index],v1[index]])
          }
          setRoadList(t1)
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

  const populateQ=(x,y,z) =>{
    let l1 = { 
      "road_type_id":x, 
      "stage_id":y, 
      "section_id":z
    } 
    if(!(x != "" && y != "" && z != "")){
      return;
    }
    AxiosApp.post(url1 + "question_id_dropdown",l1)
    .then((response) => {
      setIsload(false);
      let l1 = response.data;
      if (response.data.statusCode == "200") { 
        if(l1['stage_types'] != '') {
          let t1 = [];
          let t2 = [];
          let l2 = response.data.details[0];       
          for (const key in l2) {
            t1.push(key)
            t2.push([key,l2[key]])
          }
          setQuestionList(t1);
          setFullSubQList(t2);
          setDummy(Math.random())
        }
      } else {
        setIsload(false);
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

  const findSubList= (q) =>{
    if(q != null){
    for (let index = 0; index < fullSubQList.length; index++) {
      const temp = fullSubQList[index];
      if(q.innerHTML == temp[0]){
        console.log(temp[1]);        
        return(temp[1])
      }
    }
    }
    return[];
  }

  const handleOK = () =>{    
    setIsload(true);
    let l2 = [];
    for (let index = 0; index < counter; index++) {
      let a1 = document.getElementById("qid"+index).innerHTML;
      let a2 = document.getElementById("subqid"+index).innerHTML;
      l2.push(
        {"q_id":a1,"q_sub_id":a2}
      )
    }
    let l1 =
    { 
      "road_type_id":selRoad,   
      "stage_id":selStage,   
      "section_id":selSection, 
      "section" :selSection1,
      "retrieval_id":document.getElementById("retID").value,
      "question_ids": l2
  
     } 
    AxiosApp.post(url1 + "retrieval_id_creation",l1)
    .then((response) => {
      setIsload(false);
      let l1 = response.data;
      if (response.data.statusCode == "200") { 
        setAlert("success");
        setAlertMsg(response.data.status);
        loadLists();
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
  //Axios to fetch table
  const loadLists = () =>{
    setIsload(true);
  AxiosApp.post(url1 + "retrieval_id_list")
    .then((response) => {
      setIsload(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      let l1 = response.data.details;
      if (response.data.statusCode == "200") { 
        setRowData(l1)
        let count = 0;
        let r1 = [];
        for(let element of response.data.details){   
          r1.push(createData(++count,element['road_type'],element['stage'],element['section_id'],
          element['section'], element['retrieval_id'],element['question'],element['master_table']));          
         }
        setRows(r1)
      } else {
        setIsload(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    loadDropdowns();
    loadLists();
  },[])
  return (
    <div>
      
      <CustomLoader show={isload} />
      <Header />
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p
              style={{
                fontSize: "26px",
                fontWeight: "600",
                color: "rgba(46, 75, 122, 1)",
              }}
            >
              Retrieval Id
            </p>
            <div>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                {/* <FormControl sx={{ m: 1, width: "200px" }}>
                  <InputLabel htmlFor="outlined-adornment-amount">
                    Search
                  </InputLabel>
                  <OutlinedInput
                    size="small"
                    id="outlined-adornment-amount"
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "black" }} />
                      </InputAdornment>
                    }
                    label="Search"
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
                  Link ID
                </Button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px", height:"70vh"}}>
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
                  toolbarQuickFilterPlaceholder:'Search in the table'
                }}
                >              
            </DataGrid>
            {/* <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      SI.no
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      road type
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      stage
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      sections id
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      sections
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      retrieval id
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Question
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                     Master Table
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowData.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor:
                          index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                      }}
                    >
                      <TableCell>{index+1}</TableCell>
                      <TableCell>{row.road_type}</TableCell>
                      <TableCell>{row.stage}</TableCell>
                      <TableCell>{row.section_id}</TableCell>
                      <TableCell>{row.section}</TableCell>
                      <TableCell>{row.retrieval_id}</TableCell>
                      <TableCell>{row.question}</TableCell>
                      <TableCell>{row.master_table}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> */}
          </div>
          {/* modal  */}
          <div>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={style}
                style={{
                  height: "auto",
                  backgroundColor: "rgba(248, 250, 252, 1)",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
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
                    Retrieval Id creation
                  </Typography>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <FormControl fullWidth required>
                    <InputLabel id="demo-simple-select-label">Road Type</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={selRoad}
                      onChange={(e)=>{
                        setSelRoad(e.target.value);
                        populateQ(e.target.value,selStage,selSection)}}
                    >
                      {
                      roadList.map((x,index)=>                    
                        <MenuItem key={x[0]} value={x[0]}>{x[0]+"-"+x[1]}</MenuItem>
                      )
                      }
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Stage</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={selStage}
                      onChange={(e)=>{setSelStage(e.target.value);populateQ(selRoad,e.target.value,selSection)}}
                    >
                      {
                      stageList.map((x,index)=>                    
                        <MenuItem key={x[0]} value={x[0]}>{x[0]+"-"+x[1]}</MenuItem>
                      )
                      }
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Sections</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={selSection}
                      onChange={(e,c)=>{setSelSection(e.target.value); setSelSection1(c.props.label);populateQ(selRoad,selStage,e.target.value)}}
                    >
                      {
                      sectionList.map((x,index)=>                    
                        <MenuItem key={x[0]} label={x[1]} value={x[0]}>{x[0]+"-"+x[1]}</MenuItem>
                      )
                      }
                    </Select>
                  </FormControl>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "15px",
                  }}
                >
                  <p style={{ fontSize: "24px", fontWeight: 600 }}>
                    Questionnaire
                  </p>

                  {/* 
                  commenting this code as counter is always 2 
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
                    onClick={()=>setCounter(counter+1)}
                  >
                    Add
                    <AddBoxOutlinedIcon/>
                  </div>   
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
                    onClick={()=>{
                      if(counter > 1)
                        setCounter(counter-1)}
                    }
                  >
                    Reduce
                  </div>   */}

                </div>
                <div
                  style={{
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    // height: "10vh",
                    borderRadius: "10px",
                    padding: "10px",
                    marginTop: "15px",
                  }}
                >
                  <p style={{
          display:"none"
        }}>{dummy}</p>
                  {new Array(counter).fill('').map((_, i)=>{
                    return(
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <FormControl fullWidth required>
                      <InputLabel>Question Id </InputLabel>
                      <Select
                      id={"qid"+i}
                      onClose={(e)=>{
                        setIsload(true)
                        window.setTimeout(()=>{
                          setDummy(Math.random())
                          setIsload(false)
                        },1000)
                      }}
                      >
                      {
                      questionList.map((x,index)=>                    
                        <MenuItem key={x} value={x}>{x}</MenuItem>
                      )
                      }
                    </Select>
                    </FormControl>
                    <FormControl fullWidth required>
                      <InputLabel>Subquestion Id</InputLabel>
                      <Select id={"subqid"+i} 
                      onClose={()=>{
                        window.setTimeout(()=>{
                          formQString()
                        },1000)
                      }}>
                      {
                      Object.keys(findSubList(document.getElementById("qid"+i))).map((x,index)=>                    
                        <MenuItem key={findSubList(document.getElementById("qid"+i))[x]} 
                        value={x} id={findSubList(document.getElementById("qid"+i))[x]}>
                        {x}</MenuItem>
                      )
                      }
                      </Select>
                    </FormControl>
                  </div>    
                  )})}

                  <TextField
                    style={{ marginTop: "15px" }}
                    fullWidth
                    multiline
                    rows={3}
                    id="questions"
                    required disabled
                    variant="outlined"
                  />
                </div>
                <TextField
                  style={{ marginTop: "15px" }}
                  fullWidth
                  id="retID"
                  placeholder="Enter Retrieval id "
                  required
                  variant="outlined"
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: "15px",
                  }}
                >
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
                    onClick={handleOK}
                  >
                    Link
                  </Button>
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
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                </div>
              </Box>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Retrievalid;
