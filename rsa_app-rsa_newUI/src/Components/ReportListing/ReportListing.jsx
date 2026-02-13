import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AxiosApp from "../../common/AxiosApp";
import { url1 } from "../../App";
import React,{useState,useEffect} from "react";
import { DataGrid,GridToolbarQuickFilter ,GridRenderCellParams } from '@mui/x-data-grid';
import { useLocation,useNavigate } from "react-router-dom";
var auditID = ''

function ReportListing() {  
  const Navigate = useNavigate();
   //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [salient, setSalient] = useState([]);
  const state = useLocation()
  auditID = state.state.aid;

  const [rows, setRows] = React.useState([
      { 'id': '', 'page':'','section': '', 'comment': '','date':'',
      's_no':'','auditor_reply':''
      }]);
  const columns= [
    { field: 'id', flex:0.5,headerName: 'S.No'},
    {field: 'page',flex:0.5,headerName: 'Page'},
    {field: 'section',flex:1,headerName: 'Section'},
    {field: 'comment',flex:1,headerName: 'Comment'},
    {field: 'date',flex:0.5,headerName: 'Date'},
   // {field: 's_no',flex:1,headerName: 'Serial id'},
    {field: 'auditor_reply',flex:1,headerName: 'Response',
    renderCell: (params) => {         
      let l1 = params.row.s_no;
      return (  
        <div style={{display:'flex',justifyContent:"space-between"}}>        
        <TextField id={l1+"comment"}
        value={params.row.auditor_reply} 
        disabled={params.row.auditor_reply && 
          params.row.auditor_reply.length > 0?true:false}>

        </TextField>
        <Button id={l1+"submitButton"}
        disabled={params.row.auditor_reply && 
          params.row.auditor_reply.length > 0?true:false}
        variant="contained"
        onClick={() => submitMyComment(params.row)}
      >
        Submit
      </Button>
      </div>
      );
    }
  }
  ];
  function submitMyComment(row){
    let f1 = {
      "audit_id":auditID,
      "user_id":localStorage.getItem("rsa_user1"),
      "s_no":row.s_no,
      "comments":document.getElementById(row.s_no+"comment").value,
      "date":new Date().toISOString().slice(0, 10).split('-').reverse().join('-')
    }
    AxiosApp.post(url1 + "auditor_comment",f1)
    .then((response) => {
      setIsload(false);                     
      let l1 = response.data.details;
      if (response.data.statusCode == "200") { 
        setAlert("success");
        setAlertMsg(response.data.status);
        document.getElementById(row.s_no+"submitButton").disabled = true;
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
  
  function createData(id,page, section,comment,date,s_no,auditor_reply) {
    return {id,page, section,comment,date,s_no,auditor_reply};
  }
  useEffect(()=>{
      loadTable();
      populateSalientReport()
  },[])

  const loadTable = () =>{
    setIsload(true);
    let f1 = {
      "audit_id":auditID
    }
  AxiosApp.post(url1 + "report_comments_list",f1)
    .then((response) => {
      setIsload(false);                     
      let l1 = response.data.details;
      if (response.data.statusCode == "200") { 
        let r1 = [];
        let count = 1;
        for(let element of response.data.details){  
          r1.push(createData(count++,element['page_no'],element['section'],
            element['comments'], element['comment_date'], 
            element['s_no'],element['auditor_reply']));          
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
  return (
    <div style={{ padding: "20px" }}>
      <div>
        <p
          style={{
            color: "rgba(46, 75, 122, 1)",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          <ArrowBackOutlinedIcon onClick={() => Navigate(-1)} />
          Comment List
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
            <p>Stretch Id : {auditID} </p>
            <p>Stretch Name: {salient.stretch_name}</p>
            <p>Road Name :{salient.name_of_road}</p>
            <p>Road Number: {salient.road_number}</p>
          </div>
        </div>
        <br/>
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
      </div>
    </div>
  );
}

export default ReportListing;