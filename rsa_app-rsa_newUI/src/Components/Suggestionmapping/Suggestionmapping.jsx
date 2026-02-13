import React, { useState, useEffect } from "react";
import Header from "../Header/Header";
import {
  Autocomplete,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
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

import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";

import { DataGrid, GridToolbarQuickFilter, GridRenderCellParams } from '@mui/x-data-grid';
import { url1, rsiltUrl } from "../../App";
import { X } from "@mui/icons-material";

function Suggestionmapping() {
  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [dummy, setDummy] = useState(0);
  //for table
  const [rowData, setRowData] = useState([])
  const [editMode, setEditMode] = useState(false)

  //add popup rsa side
  const [roadList, setRoadList] = useState([])
  const [stageList, setStageList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [ridList, setRidList] = useState([])
  const [questionList, setQuestionList] = useState([])

  const [selRoad, setSelRoad] = useState('')
  const [selStage, setSelStage] = useState('')
  const [selSection, setSelSection] = useState('')
  const [selSectionName, setSelSectionName] = useState('')
  const [selRid, setSelRid] = useState('')
  const [selID, setSelID] = useState('')

  //rsilt side
  const [rsiltCat, setRsiltCat] = useState([])
  const [rsiltRoad, setRsiltRoad] = useState([]);
  const [rsiltIds, setRsiltID] = useState([]);

  const [chosenCat, setChosenCat] = useState('')
  const [chosenRoad, setChosenRoad] = useState('')
  const [chosenId, setChosenID] = useState('')
  const [suggestion, setSuggestion] = useState('')

  const [filename, setFilename] = useState("");
  const [fileImage, setFileImage] = useState("");
  const [fileURL, setFileURL] = useState("");

  const [rows, setRows] = React.useState([
    {
      'id': '', 'roadType': '', 'stage': '', 'secID': '', 'sec': '',
      'rid': '', 'question': '', 'sid': '', 'sug': '', 'rsilt_cat': '',
      'rsilt_road': '', 'rsilt_id': ''
    }]);
  const columns = [
    { field: 'id', flex: 0.5, headerName: 'S.No' },
    { field: 'roadType', flex: 1, headerName: 'Road type' },
    { field: 'stage', flex: 1, headerName: 'Stage' },
    { field: 'secID', flex: 1, headerName: 'Section ID' },
    { field: 'sec', flex: 1, headerName: 'Section' },
    { field: 'rid', flex: 1, headerName: 'Retrieval ID' },
    { field: 'question', flex: 1, headerName: 'Question' },
    { field: 'rsilt_id', flex: 1, headerName: 'Suggestion ID' }
  ];
  function createData(id, roadType, stage, secID, sec, rid, question, mt, rsilt_cat,
    rsilt_road, rsilt_id) {
    return { id, roadType, stage, secID, sec, rid, question, mt, rsilt_cat, rsilt_road, rsilt_id };
  }

  const fillCat = (e) => {
    AxiosApp.get(rsiltUrl + "rsa_search_category")
      .then((response) => {
        setIsload(false);
        let l1 = response.data.details;
        if (response.data.statusCode == "200") {
          setRsiltCat(l1)
        } else {
          setAlert("error");
          //window.alert("$$")
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const fillRoad = (x, x1) => {
    //take chosenCat and fill the roadType
    let l2 = {
      "category": x
    }
    AxiosApp.post(rsiltUrl + "rsa_road_type", l2)
      .then((response) => {
        setIsload(false);
        let l1 = response.data.details;
        if (response.data.statusCode == "200") {
          setRsiltRoad(l1)
          if (x1) {
            setChosenRoad(x1)
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
  const fillID = (x, y, x1) => {
    //take chosenRoad and fill the IDS
    let l2 = {
      "category": x,
      "road_type": y
    }
    AxiosApp.post(rsiltUrl + "rsa_fetch_sugg_id", l2)
      .then((response) => {
        setIsload(false);
        let l1 = response.data.details;
        if (response.data.statusCode == "200") {
          setRsiltID(l1)
          if (x1) {
            setChosenID(x1)
            fillSugg(x, y, x1)
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
  const fillSugg = (x, y, z) => {
    //fill the suggestion based on the ID
    let l2 = {
      "category": x,
      "road_type": y,
      "id_link": z
    }
    AxiosApp.post(rsiltUrl + "rsa_fetch_details", l2)
      .then((response) => {
        setIsload(false);
        let l11 = response.data.details;
        if (response.data.statusCode == "200") {
          let l1 = {
            "book": l11.book_title,
            "book_id": l11.book_id,
            "desc": l11.summary,
            "clause": l11.clause,
            "id": chosenId,
            "blob": "data:image/png;base64," + l11.photo_blob,
            "problem": l11.problem
          }
          let l2 = l11.summary + ' as per clause ' + l11.clause + " of " + l11.book_id;
          setSuggestion(l2);

          let url = l1.blob;
          setFileImage(url);
          setFileURL(url);
          setFilename("filename1.png");
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
    /* change the variables
    setFileImage(e.target.files[0]);
    setFileURL(URL.createObjectURL(e.target.files[0]));
    setFilename(e.target.files[0].name);
    */
  }

  //Axios to fetch road,stage,section list
  const loadDropdowns = () => {
    AxiosApp.post(url1 + "dropdowns")
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          if (l1['stage_types'] != '') {
            let k1 = Object.keys(l1['stage_types'])
            let v1 = Object.values(l1['stage_types'])
            let t1 = [];
            for (let index = 0; index < k1.length; index++) {
              t1.push([k1[index], v1[index]])
            }
            setStageList(t1)
          }
          if (l1['sections'] != '') {
            let k1 = Object.keys(l1['sections'])
            let v1 = Object.values(l1['sections'])
            let t1 = [];
            for (let index = 0; index < k1.length; index++) {
              t1.push([k1[index], v1[index]])
            }
            setSectionList(t1)
          }
          if (l1['road_types'] != '') {
            let k1 = Object.keys(l1['road_types'])
            let v1 = Object.values(l1['road_types'])
            let t1 = [];
            for (let index = 0; index < k1.length; index++) {
              t1.push([k1[index], v1[index]])
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
  //Axios to fetch table
  const loadLists = () => {
    setIsload(true);
    AxiosApp.post(url1 + "suggestion_mapping_list")
      .then((response) => {
        setIsload(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        let l1 = response.data.details;
        if (response.data.statusCode == "200") {
          setRowData(l1)
          let r1 = [];
          for (let element of response.data.details) {
            r1.push(createData(element['s_no'], element['road_type'], element['stage'],
              element['section_id'], element['section'], element['retrieval_id'],
              element['question'], element['suggestion'], element['rsilt_category'],
              element['rsilt_road_type'], element['suggestion_id']));
          }
          setRows(r1)
        } else {
          setAlert("error");
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const populateRid = (x, y, z, a) => {
    let l1 = {
      "road_type_id": x,
      "stage_id": y,
      "section_id": z
    }
    if (!(x != "" && y != "" && z != "")) {
      //dropdown array empty
      //questions html empty
      setRidList([]);
      setQuestionList([]);
      setSelRid('')
      return;
    }
    //populate id and its questions
    AxiosApp.post(url1 + "rsa_suggestion", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          if (l1[0] != '') {
            let t1 = [];
            let t2 = [];
            let l2 = response.data.details;
            for (let index = 0; index < l2.length; index++) {
              const element = l2[index];
              t1.push(element["retrieval_id"])
              t2.push(element["question"])
            }
            setRidList(t1);
            setQuestionList(t2);

            if (a) {
              setSelRid(a)
            }
            setDummy(Math.random())
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

  const handleLink = () => {
    if (!(selRoad && selStage && selSection && selRid && document.getElementById('questions').value && selSectionName && chosenId
      && suggestion && chosenCat && chosenRoad && fileImage && fileURL)) {
      setAlert("error")
      setAlertMsg("Please add details to Link")
      return;
    }

    let l2 = new FormData();
    //rsa
    l2.append("road_type_id", selRoad)
    l2.append("stage_id", selStage)
    l2.append("section_id", selSection)
    l2.append("retrieval_id", selRid)
    l2.append("issue", document.getElementById('questions').value.replace(",", "-"))
    l2.append("section", selSectionName)

    //rsilt
    //l2.append("suggestion_id",chosenId)
    l2.append("suggestion_id", chosenId)
    l2.append("suggestion", suggestion)
    l2.append("rsilt_category", chosenCat)
    l2.append("rsilt_road_type", chosenRoad)
    l2.append("file_name", "image1.png")

    l2.append("image1.png", new File([fileURL], "image1.png", { type: 'image/jpeg' }))

    if (!editMode) {
      AxiosApp.post(url1 + "suggestion_mapping", l2)
        .then((response) => {
          setIsload(true);
          if (response.data.statusCode == "200") {
            setIsload(false);
            setAlert("success");
            setAlertMsg(response.data.status);
            loadLists();
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
    } else {
      l2.append("s_no", selID);

      AxiosApp.post(url1 + "suggestion_mapping_edit", l2)
        .then((response) => {
          setIsload(true);
          if (response.data.statusCode == "200") {
            setIsload(false);
            setAlert("success");
            setAlertMsg(response.data.status);
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
  }
  const handleAutoLink = () => {
    window.alert("yet to autolink")
  }
  const handleClear = () => {
    setEditMode(false)
    setSelID('')
    setSelRoad('')
    setSelStage('')
    setSelSection('')
    setSelRid('')
    setRsiltID([])
    setRidList([])
    document.getElementById("questions").value = ''
    document.getElementById("autoRSA").value = ''
    document.getElementById("autoRSILT").value = ''

    setChosenCat('')
    setChosenRoad('')
    setChosenID('')
    setSuggestion('')
    setFileURL('')
    setFileImage('')
    setFilename('')
  }
  useEffect(() => {
    loadDropdowns();
    loadLists();
    fillCat();
  }, [])

  const handleRowClick = async (
    params, // GridRowParams
    event, // MuiEvent<React.MouseEvent<HTMLElement>>
    details, // GridCallbackDetails
  ) => {
    setEditMode(true)
    console.log(params.row);

    //search params.row.roadType in roadList
    let b = ['', '', ''];
    function returnID(x) {
      return x[1].trim() == params.row.roadType.trim()
    }
    let a1 = roadList.find(returnID);
    setSelRoad(a1[0])
    b[0] = a1[0]

    //search params.row.roadType in stageList
    function returnStage(x) {
      return x[1].trim() == params.row.stage.trim()
    }
    a1 = stageList.find(returnStage)
    setSelStage(a1[0])
    b[1] = a1[0]

    setSelSection(params.row.secID)
    b[2] = params.row.secID;

    function returnSectionName(x) {
      return x[0].trim() == params.row.secID.trim()
    }
    a1 = sectionList.find(returnSectionName)
    setSelSectionName(a1[1])

    //call the rsa_SUGGESTION
    populateRid(b[0], b[1], b[2], params.row.rid)

    if (params.row.rsilt_cat) {
      setChosenCat(params.row.rsilt_cat)
      fillRoad(params.row.rsilt_cat, params.row.rsilt_road)
    }

    if (params.row.rsilt_road) {
      fillID(params.row.rsilt_cat, params.row.rsilt_road, params.row.rsilt_id)
    }

    setSelID(params.row.id)

  };

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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p
              style={{
                fontSize: "26px",
                fontWeight: "600",
                color: "rgba(46, 75, 122, 1)",
              }}
            >
              Suggestion mapping
            </p>
          </div>
          <div style={{ marginTop: "15px", display: "flex", gap: "20px" }}>
            <div
              style={{
                border: "1px solid rgba(217, 228, 246, 1)",
                width: "50%",
                height: "350px",
                borderRadius: "10px",
                padding: "20px",
                backgroundColor: "#faf8fc",
              }}
            >
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                }}
              >
                RSSA
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginTop: "15px",
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Road type </InputLabel>
                  <Select variant="outlined" defaultValue=""
                    value={selRoad}
                    onChange={(e) => {
                      setSelRoad(e.target.value);
                      populateRid(e.target.value, selStage, selSection)
                    }}
                  >
                    {
                      roadList.map((x, index) =>
                        <MenuItem key={x[0]} value={x[0]}>{x[0] + "-" + x[1]}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Stage</InputLabel>
                  <Select variant="outlined" defaultValue=""
                    value={selStage}
                    onChange={(e) => {
                      setSelStage(e.target.value);
                      populateRid(selRoad, e.target.value, selSection)
                    }}
                  >
                    {
                      stageList.map((x, index) =>
                        <MenuItem key={x[0]} value={x[0]}>{x[0] + "-" + x[1]}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>sections</InputLabel>
                  <Select variant="outlined" defaultValue=""
                    value={selSection}
                    onChange={(e, c) => {
                      setSelSection(e.target.value);
                      setSelSectionName(c.props.label)
                      populateRid(selRoad, selStage, e.target.value)
                    }}
                  >
                    {
                      sectionList.map((x, index) =>
                        <MenuItem key={x[0]} label={x[1]} value={x[0]}>{x[0] + "-" + x[1]}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                <Autocomplete
                  fullWidth required
                  options={ridList}
                  value={selRid}
                  onChange={(e) => { 
                    setSelRid(e.target.textContent); }}
                  renderInput={(params) => <TextField {...params} id="autoRSA" label="Retrieval Id" />}
                />
                {/* <FormControl fullWidth required>
                  <InputLabel>Retrieval Id</InputLabel>
                  <Select variant="outlined" value={selRid}
                    onChange={(e) => { 
                      setSelRid(e.target.value); }}
                  >
                    {
                      ridList.map((x, index) =>
                        <MenuItem key={x} value={x}>{x}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl> */}
              </div>
              <TextField
                style={{ marginTop: "15px" }}
                fullWidth
                multiline
                rows={3}
                id="questions"
                label="questions"
                disabled
                variant="outlined"
                value={(selRid != "") ? questionList[ridList.indexOf(selRid)] : ""}
              />
            </div>
            <div
              style={{
                border: "1px solid rgba(217, 228, 246, 1)",
                width: "50%",
                height: "350px",
                borderRadius: "10px",
                padding: "20px",
                backgroundColor: "#faf8fc",
              }}
            >
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                }}
              >
                RSILT
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginTop: "15px",
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Category </InputLabel>
                  <Select variant="outlined" value={chosenCat}
                    onChange={(e) => {
                      setChosenCat(e.target.value);
                      fillRoad(e.target.value)
                    }}
                  >
                    {
                      rsiltCat.map((x, index) =>
                        <MenuItem key={x} value={x}>{x}</MenuItem>
                      )
                    }</Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Road Type </InputLabel>
                  <Select variant="outlined" value={chosenRoad}
                    onChange={(e) => {
                      setChosenRoad(e.target.value);
                      fillID(chosenCat, e.target.value)
                    }}
                  >
                    {
                      rsiltRoad.map((x, index) =>
                        <MenuItem key={x} value={x}>{x}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                {/* <FormControl fullWidth required>
                  <InputLabel>Suggestion Id</InputLabel>
                  <Select variant="outlined" value={chosenId}
                    onChange={(e) => {
                      setChosenID(e.target.value);
                      fillSugg(chosenCat, chosenRoad, e.target.value)
                    }}
                  >
                    {
                      rsiltIds.map((x, index) =>
                        <MenuItem key={x} value={x}>{x}</MenuItem>
                      )
                    }
                  </Select>
                </FormControl> */}
                <Autocomplete
                  fullWidth required
                  options={rsiltIds}
                  value={chosenId}
                  onChange={(e) => {
                    setChosenID(e.target.textContent);
                    fillSugg(chosenCat, chosenRoad, e.target.textContent)
                  }}
                  renderInput={(params) => <TextField {...params} id="autoRSILT" label="Suggestion Id" />}
                />
              </div>
              <TextField
                style={{ marginTop: "15px" }}
                fullWidth
                multiline
                id="rsilt_suggestion"
                rows={4}
                label="Suggestion"
                required
                variant="outlined"
                value={suggestion}
                InputProps={{
                  endAdornment: <img src={fileURL} width={"100px"} height={"100px"} />
                }}
              />
              <div style={{
                  marginTop: "20px"}}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                style={{
                  backgroundColor: "rgb(46, 75, 122)",
                  color: "white",
                  // width: "70%",
                  float: "right",
                }}
                onClick={() => handleLink()}
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
                  float: "right",
                  marginRight: "15px",
                }}
                onClick={() => handleClear()}
              >
                Clear Form
              </Button>  
              </div>            
            </div>
          </div>
          <br/>
          <div style={{ marginTop: "40px", height: "35vh" }}>
            <p style={{ fontSize: "24px", fontWeight: "600" }}>
              Linked list (Click a row to Edit)
            </p>
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
                density: 'compact',
              }}
              onRowClick={handleRowClick}
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
            {/* <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      SI.no
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Road type
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Stage
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Sections id
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Sections
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Retrieval id
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Question
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Suggestion id
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Suggestion
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Action
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
                      <TableCell>{row.suggestion_id}</TableCell>
                      <TableCell>{row.suggestion}</TableCell>
                      <TableCell>
                        <IconButton>
                          <DescriptionIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Suggestionmapping;
