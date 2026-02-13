import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import AxiosApp from '../../common/AxiosApp';
import { url1 } from '../../App';
const columns = [
  { field: 'gps', headerName: 'GPS', flex: 1, },
  { field: 'chainage', headerName: 'Chainage', flex: 1, },
  { field: 'issues', headerName: 'Issues', flex: 1,width: 150},
  { field: 'severity', headerName: 'Severity', flex: 1, },
  { field: 'priority', headerName: 'Priority', flex: 1 },
  { field: 'category', headerName: 'Sub-Category', flex: 1,width: 150 },
  { field: 'critical', headerName: 'Critical', flex: 1, },
  { field: 'roadside', headerName: 'Road Side', flex: 1, },
];

const rows1 = [
  { id: 11, gps: '', chainage: '', issues: '', severity: '', priority: '', 
    category: '', critical: '', roadside:''}
];
export default function SurveyformAllEntries(props) {
  const [selectionModel, setSelectionModel] = React.useState([]);
  const [idArray, setIdArray] = React.useState([])

  const handleRowSelectionChange = (newSelectionModel) => {
    setSelectionModel(newSelectionModel);
    // You can perform additional actions here, e.g.,
    // fetching data related to selected rows, opening a modal, etc.
    console.log('Selected row IDs:', newSelectionModel);
  };
  const handleUseCall = () => {
    if(selectionModel.length >0)
      props.callChildBackCloseData(rows[selectionModel[0]-1],idArray)
    else {
      window.alert("Choose an entry to prefill the form")
      return;
    }
  }
  const loadTable = () => {
    let l1 = {
      "user_id": props.a,
      "audit_id": props.b,
      "section_id": props.c
    }
    AxiosApp.post(url1 + "duplicate", l1)
      .then((response) => {
                  console.log(response.data.statusCode)

        //  setIsload(false);
        //{ id: 1, gps: '', chainage: '', issues: '', severity: '', priority: '' }
        if (response.data.statusCode == "200" || response.data.statusCode == 200) {
          let oriData = response.data.details;
          let rows2 = []
          const idArr = new Array(8)
          for (let index = 1; index <= response.data.max_count; index++) {
            let secData = oriData.filter((x) => x.section_count == index)
            if (!(secData == {} && secData.length > 0)) {
              let a1 = "";
              let a2 = "";
              let a3 = "";
              let a4 = "";
              let a5 = "";
              let a6 = "";
              let a7 = "";
              let a8 = '';
              for (let index = 0; index < secData.length; index++) {
                const element = secData[index];
                if (element.question == "GPS Location") 
                  {a1 = element.answer; idArr[0]=element.question_id}
                if (element.question == "Chainage (km)") 
                  {a2 = element.answer;idArr[1]=element.question_id}
                if (element.question == "Issues") 
                  {a3 = element.answer;idArr[2]=element.question_id}
                if (element.question == "Severity") 
                  {a4 = element.answer;idArr[3]=element.question_id}
                if (element.question == "Priority") 
                  {a5 = element.answer;idArr[4]=element.question_id}
                if (element.question.indexOf("Category") > -1)
                  {a6 = element.answer;idArr[5]=element.question_id}
                if (element.question == "Critical observation") 
                  {a7 = element.answer;idArr[6]=element.question_id}
                if (element.question == "Road Side") 
                  {a8 = element.answer;idArr[7]=element.question_id}
              }
              rows2.push(
                {
                  id: index, gps: a1, chainage: a2, issues: a3, severity: a4, priority: a5,
                  category: a6, critical: a7, roadside: a8
                }
              )
            }
          }
          setRows(rows2)
          setIdArray(idArr)
        } else {
           setRows([])
          console.log(response.data.status);
        }
      })
      .catch((error) => {
        // setIsload(false);
        // setAlert("error");
        // setAlertMsg(error);
      });
  }
  React.useEffect(() => {
    loadTable();
  }, [])

  const [rows, setRows] = React.useState(rows1)
  return (
    <Box sx={{ height: 400, width: '100%' }}>
    
      <div>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
            columns: {
              columnVisibilityModel: {
                
                gps: false,
                chainage:false,
                severity:false,
                priority:false,
                critical:false,
                roadside:false,
                // age: false,
              },
            },
          }}
         
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
          disableMultipleRowSelection
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={handleRowSelectionChange}
        />
        <br />
        <Button variant="contained" onClick={(e) => handleUseCall(e)}>Use the Selected Entry</Button>
        <span>&nbsp;&nbsp;&nbsp;</span>
        <Button variant="contained" onClick={props.callChildBackClose}>Close</Button>
      </div>
    </Box>
  );
}