import React, { useEffect, useState, useRef } from "react";
import AuditorHeader from "../AuditorHeader/AuditorHeader";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./AuditorData.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { CheckBox } from "@mui/icons-material";
import AxiosApp from "../../../common/AxiosApp";
import CustomAlerts from "../../../common/CustomAlerts";
import CustomLoader from "../../../common/customLoader";
import noImage from '../../../Assets/noImage.png';
import JSZip from 'jszip';
import { url1 } from "../../../App";
import LocCap from "../../LocationCapture/LocCap";
import axios from "axios";
var auditID = localStorage.getItem("rsa_chosen_audit")
var auditTypeID = localStorage.getItem("rsa_audit_typeid")
var userID = ""
var contentReport = {}
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  // height: "",
  bgcolor: "background.paper",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
};
const style1 = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  // height: "",
  bgcolor: "background.paper",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
};
var imageFileSource = new Map()
var imageSource = new Map()
var regex = /^\d+\+\d+$/;
var gpsLive = ['', '']
navigator.geolocation.getCurrentPosition((position) => {
  gpsLive[0] = position.coords.latitude.toFixed(5);
  gpsLive[1] = position.coords.longitude.toFixed(5);
});
var imageList = {};

function AuditorData() {
  //for report frontpage

  const [title_report, setreport] = useState('');
  const [title_sub_report, setsubreport] = useState('');
  const [title_name, setname] = useState('');
  const [title_company_name, setcompany] = useState('');
  const [title_address, setaddress] = useState('');
  const [title_contact, setcontact] = useState('');


  const [isUploadClicked, setUploadClicked] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();
  const focus = () => {
    inputRef.current.focus();
  };
  const [chosenSection, setchosenSection] = useState('');

  function handleSearchSection(l1) {
    let l11 = -1;
    l11 = sectionNames.indexOf(l1)
    if (l11 < 0) {
      setSectionRows(sectionRowsOrig);
      setchosenSection('')
    } else {
      let l2 = [];
      l2.push(sectionRowsOrig[l11])
      setSectionRows(l2)
      setchosenSection(l1)
    }
    return;
  }
  function handleSearch() {
    let l1 = document.getElementById('searchString').value;
    searchList(l1)
    return;
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
      let l11 = filterIt(sectionRowsOrig, l1);
      setSectionRows(l11)
    } else {
      setSectionRows(sectionRowsOrig)
    }
  }
  const uploadImage = (e) => {
    setFileImage(e.target.files[0]);
    setFileURL(URL.createObjectURL(e.target.files[0]));
    setFilename(e.target.files[0].name);
  };
  const [filename, setFilename] = useState("");
  const [fileImage, setFileImage] = useState("");
  const [fileURL, setFileURL] = useState("");

  const state = useLocation()
  auditID = state.state.aid;
  userID = state.state.uid;
  auditTypeID = state.state.atypeID;

  const [tab, setTab] = useState(0);
  const [subtab, setsubTab] = useState(0);
  const [openTwo, setOpenTwo] = React.useState(false);
  // hide (HFAZ)
  const [showHFAZ, setShowHFAZ] = useState(false);
  const handleOpenTwo = () => setOpenTwo(true);
  const handleCloseTwo = () => setOpenTwo(false);
  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [dummy, setDummy] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [sectionCategoryNames, setSectionCategoryNames] = useState([])

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
    }
  ];

  //start/end table rows
  const [startList, setStartList] = useState([]);
  const [endList, setEndList] = useState([]);
  const [startRow, setStartRow] = useState([])
  const [endRow, setEndRow] = useState([])
  const [otherStart, setOtherStart] = useState([])
  const [otherEnd, setOtherEnd] = useState([])
  const [weather, setWeather] = useState([])
  const [weatherID, setWeatherID] = useState([])
  const [openOther, setOpenOther] = React.useState(false);
  const handleOpenOth = () => setOpenOther(true);
  const handleCloseOth = () => setOpenOther(false);

  //for Other Popup
  const [showObj, setShowObj] = useState([])

  //for general audit detail - 2 tables
  const loadWeather = () => {
    let qid1 = "C.E.A.4";
    let qid = qid1.split(".")
    let local1 = { "section_id": qid[2], "q_id": qid1 }
    setIsload(true);
    AxiosApp.post(url1 + "master_table_view", local1)
      .then((response) => {
        setIsload(false);
        let object = response.data.details;
        let x1 = [];
        let x2 = [];
        if (response.data.statusCode == "200") {
          for (let index = 0; index < object.length; index++) {
            const element = object[index];
            x1.push(element.answer)
            x2.push(element.sub_q_id)
          }
          setWeather(x1)
          setWeatherID(x2)
          setDummy(Math.random())
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
  const loadStartEndTable = () => {
    setIsload(true);
    let l1 = { "audit_id": auditID }
    AxiosApp.post(url1 + "general_audit_details", l1)
      .then((response) => {
        setIsload(false);
        loadSectionTable();
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          l1 = response.data.details;
          if (l1["Start Audit Details"]) {
            setStartList(l1["Start Audit Details"])
            //the ids are fixed here;

            let otherExclude = ["A.11", "A.4", "A.10", "A.1", "A.2"]
            let l11 = []; let m1 = -1;

            let element = l1["Start Audit Details"];
            //start date and time [0] "C.E.A.11"           
            m1 = element.findIndex(x => x.q_id.includes("A.11"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //weather [1] "C.E.A.4"
            m1 = element.findIndex(x => x.q_id.includes("A.4"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //start location [2] "C.E.A.10"
            m1 = element.findIndex(x => x.q_id.includes("A.10"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //gps location [3] "C.E.A.1"
            m1 = element.findIndex(x => x.q_id.includes("A.1"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //chainage [4] "C.E.A.2"
            m1 = element.findIndex(x => x.q_id.includes("A.2"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //photo [5] // need axios call
            // m1 = element.findIndex(x =>x.q_id == "xx")
            // if(m1 >= 0) l11.push(element[m1])
            // else l11.push({})

            m1 = -1;
            for (let index = 0; index < element.length; index++) {
              if (element[index] && element[index].question &&
                element[index].question.toLowerCase().includes("photo")) {
                m1 = index; l11.push(element[index]);
                break;
              }
            }
            if (m1 == -1) l11.push({})


            //other [6]
            let o1 = [];
            for (let index = 0; index < element.length; index++) {
              const temp = element[index];
              let t1 = temp.q_id.split(".");
              let t2 = t1[2] + "." + t1[3]
              if (!(otherExclude.includes(t2))) {
                o1.push(temp)
              }
            }
            setOtherStart(o1)
            setStartRow([l11])
          }
          if (l1["End Audit Details"]) {
            setEndList(l1["End Audit Details"])
            let otherExclude = ["B.5", "B.4", "B.1", "B.2"]
            let l11 = []; let m1 = -1;

            let element = l1["End Audit Details"];
            //end date and time [0] "C.E.B.5"  
            m1 = element.findIndex(x => x.q_id.includes("B.5"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //end location [2] "C.E.B.4"
            m1 = element.findIndex(x => x.q_id.includes("B.4"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //gps location [3] "C.E.B.1"
            m1 = element.findIndex(x => x.q_id.includes("B.1"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //chainage [4] "C.E.B.2"
            m1 = element.findIndex(x => x.q_id.includes("B.2"))
            if (m1 >= 0) l11.push(element[m1])
            else l11.push({})

            //photo [5] // need axios call
            // m1 = element.findIndex(x =>x.q_id == "xx")
            // if(m1 >= 0) l11.push(element[m1])
            // else l11.push({})

            m1 = -1;
            for (let index = 0; index < element.length; index++) {
              if (element[index] && element[index].question &&
                element[index].question.toLowerCase().includes("photo")) {
                m1 = index; l11.push(element[index]);
                break;
              }
            }
            if (m1 == -1) l11.push({})

            //other [6]
            let o1 = [];
            for (let index = 0; index < element.length; index++) {
              const temp = element[index];
              let t1 = temp.q_id.split(".");
              let t2 = t1[2] + "." + t1[3]
              if (!(otherExclude.includes(t2))) {
                o1.push(temp)
              }
            }
            setOtherEnd(o1)
            setEndRow([l11])
          }
        } else {
          setAlert("error");
          setAlertMsg("General Audit Details: " + response.data.status);
        }
      })
      .catch((error) => {
        loadSectionTable();
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const handleGeneralData1 = (sdata, edata) => {
    //for StartRow Changes = sdata
    let a1 = {};
    //startRow ,1,2,3,4,5 can be edited
    a1[sdata[1].q_id] = sdata[1].answer;
    a1[sdata[2].q_id] = sdata[2].answer;
    a1[sdata[3].q_id] = sdata[3].answer;
    a1[sdata[4].q_id] = sdata[4].answer;
    a1[sdata[5].q_id] = sdata[5].q_id;


    let formData = new FormData()
    formData.append("audit_id", auditID) //fix
    formData.append("updated_on", new Date().toISOString().slice(0, 10).split('-').reverse().join('-'))
    formData.append("updated_by", localStorage.getItem("rsa_user1")) //fix

    formData.append("section_id", "A")
    formData.append("number", 1)
    formData.append("delete_status", false)


    console.log(formData, "11111112222222222222");

    // CHECK HERE FOR THE IMAGE UPDATION
    let image = fetchImage(sdata[5].q_id, 1);

    if (image && isUploadClicked === true) {
      formData.append(a1[sdata[5].q_id] + ".jpg", image);
      a1[sdata[5].q_id] = "Image"
      a1["file_name"] = [sdata[5].q_id + ".jpg"]
    }

    // else{
    //   formData.append(a1[sdata[5].q_id] + ".jpg", image);
    //   a1[sdata[5].q_id] = "Image"
    //   a1["file_name"] = []
    // }


    console.log(formData);
    // //download and see this file???
    // const a = document.createElement("a");
    // a.href = URL.createObjectURL(image)
    // document.body.appendChild(a);
    // a.download = "checkimage.png"
    // a.click();
    // document.body.removeChild(a);
    //check over

    setIsload(true);
    formData.append("answers", JSON.stringify(a1))

    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }
    formData.append("live_gps", gpsLive)

    formData.append("road_side", "")
    formData.append("gps_location", sdata[3].answer)
    let chain = sdata[4].answer
    if (!(regex.test(chain))) {
      setAlert("error");
      setAlertMsg("Please enter correct format for  chainage, eg:0+200 in start section");
      return;
    }
    chain = chain.replace("+", ".")
    formData.append("chainage", chain)
    setIsload(true);
    axios.post(url1 + "answer_edit", formData, config)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          setAlert("success");
          setAlertMsg(response.data.status + " Start Details ");
        } else {
          setAlert("error");
          setAlertMsg(response.data.status + " Start Details ");
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });

    // //for EndRow
    // let b1 = {}
    // b1[edata[1].q_id] = edata[1].answer;
    // b1[edata[2].q_id] = edata[2].answer;
    // b1[edata[3].q_id] = edata[3].answer;
    // b1[edata[4].q_id] = edata[4].q_id;

    // let formData1 = new FormData()
    // formData1.append("audit_id", auditID) //fix
    // formData1.append("updated_on", new Date().toISOString().slice(0, 10).split('-').reverse().join('-'))
    // formData1.append("updated_by", localStorage.getItem("rsa_user1")) //fix
    // formData1.append("section_id", "B")
    // formData1.append("number", 1)
    // formData1.append("delete_status", false)
    // setIsload(true);
    // formData1.append("live_gps", gpsLive)

    // formData1.append("road_side", "")
    // formData1.append("gps_location", edata[2].answer)
    // chain = edata[3].answer
    // if (!(regex.test(chain))) {
    //   setAlert("error");
    //   setAlertMsg("Please enter correct format for  chainage, eg:0+200 in end section");
    //   return;
    // }
    // chain = chain.replace("+", ".")
    // formData1.append("chainage", chain)

    // // CHECK HERE FOR THE IMAGE UPDATION
    // let image1 = fetchImage(edata[4].q_id, 1)
    // if (image1) {
    //   formData1.append(b1[edata[4].q_id] + ".jpg", image1);
    //   b1[edata[4].q_id] = "Image"
    //   b1["file_name"] = [edata[4].q_id + ".jpg"]
    // }

    // formData1.append("answers", JSON.stringify(b1))
    // setIsload(true);
    // AxiosApp.post(url1 + "answer_edit", formData1, config)
    //   .then((response) => {
    //     setIsload(false);
    //     if (response.data.statusCode == "200") {
    //       setAlert("success");
    //       setAlertMsg(response.data.status + " End Details ");
    //     } else {
    //       setAlert("error");
    //       setAlertMsg(response.data.status + " End Details ");
    //     }
    //   })
    //   .catch((error) => {
    //     setIsload(false);
    //     setAlert("error");
    //     setAlertMsg(error);
    //   });
  }




  const handleGeneralData2 = (sdata, edata) => {
    //for StartRow Changes = sdata
    let a1 = {};
    //startRow ,1,2,3,4,5 can be edited
    a1[sdata[1].q_id] = sdata[1].answer;
    a1[sdata[2].q_id] = sdata[2].answer;
    a1[sdata[3].q_id] = sdata[3].answer;
    a1[sdata[4].q_id] = sdata[4].answer;
    a1[sdata[5].q_id] = sdata[5].q_id;


    let formData = new FormData()
    formData.append("audit_id", auditID) //fix
    formData.append("updated_on", new Date().toISOString().slice(0, 10).split('-').reverse().join('-'))
    formData.append("updated_by", localStorage.getItem("rsa_user1")) //fix

    formData.append("section_id", "B")
    formData.append("number", 1)
    formData.append("delete_status", false)

    // CHECK HERE FOR THE IMAGE UPDATION
    let image = fetchImage(sdata[5].q_id, 1)



    if (image && isUploadClicked === true) {
      formData.append(a1[sdata[5].q_id] + ".jpg", image);
      a1[sdata[5].q_id] = "Image"
      a1["file_name"] = [sdata[5].q_id + ".jpg"]
    }


    // if (image) {
    //   formData.append(a1[sdata[5].q_id] + ".jpg", image);
    //   a1[sdata[5].q_id] = "Image"
    //   a1["file_name"] = [sdata[5].q_id + ".jpg"]
    // }
    // //download and see this file???
    // const a = document.createElement("a");
    // a.href = URL.createObjectURL(image)
    // document.body.appendChild(a);
    // a.download = "checkimage.png"
    // a.click();
    // document.body.removeChild(a);
    //check over

    setIsload(true);
    formData.append("answers", JSON.stringify(a1))

    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }
    formData.append("live_gps", gpsLive)

    formData.append("road_side", "")
    formData.append("gps_location", sdata[3].answer)
    let chain = sdata[4].answer
    if (!(regex.test(chain))) {
      setAlert("error");
      setAlertMsg("Please enter correct format for  chainage, eg:0+200 in start section");
      return;
    }
    chain = chain.replace("+", ".")
    formData.append("chainage", chain)
    setIsload(true);
    AxiosApp.post(url1 + "answer_edit", formData, config)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          setAlert("success");
          setAlertMsg(response.data.status + " End Audit Details ");
        } else {
          setAlert("error");
          setAlertMsg(response.data.status + " End Audit Details ");
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });

    //for EndRow
    // let b1 = {}
    // b1[edata[1].q_id] = edata[1].answer;
    // b1[edata[2].q_id] = edata[2].answer;
    // b1[edata[3].q_id] = edata[3].answer;
    // b1[edata[4].q_id] = edata[4].q_id;

    // let formData1 = new FormData()
    // formData1.append("audit_id", auditID) //fix
    // formData1.append("updated_on", new Date().toISOString().slice(0, 10).split('-').reverse().join('-'))
    // formData1.append("updated_by", localStorage.getItem("rsa_user1")) //fix
    // formData1.append("section_id", "B")
    // formData1.append("number", 1)
    // formData1.append("delete_status", false)
    // setIsload(true);
    // formData1.append("live_gps", gpsLive)

    // formData1.append("road_side", "")
    // formData1.append("gps_location", edata[2].answer)
    // chain = edata[3].answer
    // if (!(regex.test(chain))) {
    //   setAlert("error");
    //   setAlertMsg("Please enter correct format for  chainage, eg:0+200 in end section");
    //   return;
    // }
    // chain = chain.replace("+", ".")
    // formData1.append("chainage", chain)

    // // CHECK HERE FOR THE IMAGE UPDATION
    // let image1 = fetchImage(edata[4].q_id, 1)
    // if (image1) {
    //   formData1.append(b1[edata[4].q_id] + ".jpg", image1);
    //   b1[edata[4].q_id] = "Image"
    //   b1["file_name"] = [edata[4].q_id + ".jpg"]
    // }

    // formData1.append("answers", JSON.stringify(b1))
    // setIsload(true);
    // AxiosApp.post(url1 + "answer_edit", formData1, config)
    //   .then((response) => {
    //     setIsload(false);
    //     if (response.data.statusCode == "200") {
    //       setAlert("success");
    //       setAlertMsg(response.data.status + " End Details ");
    //     } else {
    //       setAlert("error");
    //       setAlertMsg(response.data.status + " End Details ");
    //     }
    //   })
    //   .catch((error) => {
    //     setIsload(false);
    //     setAlert("error");
    //     setAlertMsg(error);
    //   });
  }

  //for sections
  const [severity, setSeverity] = useState(new Map())
  const [priority, setPriority] = useState(new Map())
  const [roadsideArray, setRoadSideArray] = useState(new Map())
  const [sevIDs, setSevIDs] = useState(new Map())
  const [priIDs, setPriIDs] = useState(new Map())
  const [sectionRows, setSectionRows] = useState([[]])
  const [sectionRowsOrig, setSectionRowsOrig] = useState([[]])
  const [sectionNames, setSectionNames] = useState([])

  //for section audit detail = so many section tables
  const loadSeverityPriority = (count) => {
    let t1 = [];
    for (let index = 0; index < count; index++) {
      let l1 = [""]
      t1.push(l1)
    }
    //setSeverity(t1)

    t1 = [];
    for (let index = 0; index < count; index++) {
      let l1 = [""]
      t1.push(l1)
    }
    //setPriority(t1)

    t1 = [];
    for (let index = 0; index < count; index++) {
      let l1 = [""]
      t1.push(l1)
    }
    //setRoadSideArray(new Map())
  }
  const loadSectionSeverity = (xx, i) => {
    let qid1 = xx;
    let qid = qid1.split(".")
    let local1 = { "section_id": qid[2], "q_id": qid1 }
    setIsload(true);
    AxiosApp.post(url1 + "master_table_view", local1)
      .then((response) => {
        setIsload(false);
        let object = response.data.details;
        let x1 = [];
        let x2 = [];
        if (response.data.statusCode == "200") {
          for (let index = 0; index < object.length; index++) {
            const element = object[index];
            x1.push(element.answer)
            x2.push(element.sub_q_id)
          }

          let localCopy = new Map()
          localCopy = severity
          localCopy.set(qid1, x1)
          setSeverity(localCopy)

          localCopy = new Map()
          localCopy = sevIDs
          localCopy.set(qid1, x2)
          setSevIDs(localCopy)

          setDummy(Math.random())
        } else {
          setAlert("error");
          setIsload(false);
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const loadSectionPriority = (xx, i) => {
    let qid1 = xx;
    let qid = qid1.split(".")
    let local1 = { "section_id": qid[2], "q_id": qid1 }
    setIsload(true);
    AxiosApp.post(url1 + "master_table_view", local1)
      .then((response) => {
        setIsload(false);
        let object = response.data.details;
        let x1 = [];
        let x2 = [];
        if (response.data.statusCode == "200") {
          for (let index = 0; index < object.length; index++) {
            const element = object[index];
            x1.push(element.answer)
            x2.push(element.sub_q_id)
          }
          let localCopy = new Map()
          localCopy = priority
          localCopy.set(qid1, x1)
          setPriority(localCopy)

          localCopy = new Map()
          localCopy = priIDs
          localCopy.set(qid1, x2)
          setPriIDs(localCopy)

          setDummy(Math.random())
        } else {
          setAlert("error");
          setIsload(false);
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const loadSectionRoadSide = (xx, i) => {
    let qid1 = xx;
    let qid = qid1.split(".")
    let local1 = { "section_id": qid[2], "q_id": qid1 }
    setIsload(true);
    AxiosApp.post(url1 + "master_table_view", local1)
      .then((response) => {
        setIsload(false);
        let object = response.data.details;
        let x1 = [];
        let x2 = [];
        if (response.data.statusCode == "200") {
          for (let index = 0; index < object.length; index++) {
            const element = object[index];
            x1.push(element.answer)
            x2.push(element.sub_q_id)
          }
          let localCopy = new Map()
          localCopy = roadsideArray
          localCopy.set(qid1, x1)
          setRoadSideArray(localCopy)

          // let localCopy1 = priIDs
          // localCopy1[i] = x2;
          // setPriIDs(localCopy1)

          setDummy(Math.random())
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
  const setHfazAPI = (t1) => {
    let l1 = { "audit_id": auditID }
    setIsload(true);
    AxiosApp.post(url1 + "hfaz_enable", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          setShowHFAZ(t1)
        } else {
          setAlert("error");
          setIsload(false);
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const loadSectionTable = () => {
    let l1 = { "audit_id": auditID }
    setIsload(true);
    AxiosApp.post(url1 + "audit_section_detail", l1)
      .then((response) => {
        console.log(response)
        loadSectionNameID()
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          l1 = response.data.details;
          fillSecTables(l1)
          if (response.data.hfaz == true)
            setShowHFAZ(true)
          else
            setShowHFAZ(false)
        } else {
          setAlert("error");
          setIsload(false);
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        loadSectionNameID()
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const fillSecTables = (l1) => {

    loadSeverityPriority(Object.keys(l1).length);
    setSectionNames(Object.keys(l1))


    //add dummy array
    let dummyA = []
    for (let index = 0; index < Object.keys(l1).length; index++) {
      let l2 = [];
      let persectionCount = l1[Object.keys(l1)[index]].length
      for (let index = 0; index < persectionCount; index++) {
        l2.push([])
      }
      // adding last row as false -- delete status option
      l2.push(false)
      dummyA.push(l2)
    }
    setSectionRows(dummyA)
    setSectionRowsOrig(dummyA)

    let m1 = -1;
    let s1 = { ...sectionRows };

    let local = [];
    for (let index1 = 0; index1 < Object.keys(l1).length; index1++) {
      local[index1] = [];
      const eachSection = Object.values(l1)[index1];
      let perSectionCounter = 0;
      for (const rowNo in eachSection) {
        const element = eachSection[rowNo]
        let l11 = [];
        //means -> each row in that section  
        //gothru each number's array of objects and fix the table population row.
        //1.gps
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("GPS")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //2.chainage
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Chainage")) {
            element[index].answer = element[index].answer.replace(".", "+")
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //3.roadside
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Road Side")) {
            m1 = index; l11.push(element[index]);

            loadSectionRoadSide(element[index].question_id, perSectionCounter);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //4.photo
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("photo")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //5.Issues/Landuse Category/ Roadside Hazard Category/ User Behaviour Category
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            (element[index].question.includes("Issues") ||
              element[index].question.includes("Landuse Category") ||
              element[index].question.includes("Roadside Hazard Category") ||
              element[index].question.includes("User Behaviour Category")
            )) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //6.Suggestion
        //debugger;
        m1 = -1;
        let l6 = "";

        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].retrieval_id
            && element[index].retrieval_id) {
            let l5 = element[index].retrieval_id;
            try {
              for (let index1 = 0; index1 < l5.length; index1++) {
                const element = l5[index1];
                if (index1 == 0) l6 = element.suggestions;
                else l6 = l6 + " , " + element.suggestions;
                /** This is for array of array of objects code. mostly can be removed.
                  for (let index2 = 0; index2 < element.length; index2++) {
                  const element1 = element[index2];
                  if (index2 == 0) l6 = element1.suggestion;
                  else l6 = l6 + " , " + element1.suggestion;
                }*/
              }
            } catch (error) {

            }
            m1 = index; l11.push(l6);
            break;
          }
        }

        if (m1 == -1) l11.push({})
        //7.Observation type
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Critical")) {
            if (element[index].answer == "true") element[index].answer = true;
            else element[index].answer = false;
            m1 = index; l11.push(element[index]);
            break;
          }

        }
        if (m1 == -1) l11.push({})
        //8.General Observation
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("General")) {
            if (element[index].answer == "true") element[index].answer = true;
            else element[index].answer = false;
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //9.Severity
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Severity")) {
            m1 = index; l11.push(element[index]);

            loadSectionSeverity(element[index].question_id, perSectionCounter);
            break;
          }
        }


        if (m1 == -1) l11.push({})
        //10.Priority
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Priority")) {
            m1 = index; l11.push(element[index]);

            loadSectionPriority(element[index].question_id, perSectionCounter);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //11.Other Entries
        m1 = -1;
        let other1 = []
        for (let index = 0; index < element.length; index++) {
          //should not have this in the list
          let l2 = ["Priority", "Severity", "General observation",
            "Critical observation", "Photo/Video/Audio", "Road Side",
            "Chainage (km)", "GPS Location", "Issues",
            "Landuse Category", "Roadside Hazard Category", "User Behaviour Category"]
          if (element[index] && element[index].question &&
            !l2.includes(element[index].question.trim())) {
            m1 = index; other1.push(element[index]);
          }
        }
        l11.push(other1)
        if (m1 == -1) l11.push({})

        //12 - delete status
        // adding row as false -- delete status option
        l11.push(false)

        //debugger;
        // 13 new issue
        m1 = -1;
        let t1 = element[0].new_issue;
        if (t1 && t1[0]) {
          m1 = 0;
          l11.push(t1[0])
        }
        if (m1 == -1) l11.push("")

        // 14 new suggestion
        m1 = -1;
        t1 = element[0].new_suggestion;
        if (t1 && t1[0]) {
          m1 = 0;
          l11.push(t1[0])
        }
        if (m1 == -1) l11.push("")
        local[index1][perSectionCounter] = l11;
        perSectionCounter = perSectionCounter + 1;
      }
    }
    setSectionRows(local)
    setSectionRowsOrig(local)
    setDummy(Math.random())
    console.log("SectionRows here");
    console.log(local)
  }

  const loadAnsImages = () => {
    let config = {
      "audit_id": auditID
    }
    //somehow settimeout makes the imageSource empty and images were not loading.
    //window.setTimeout(function(){
    //return;
    setIsload(true);
    AxiosApp.post(url1 + "ans_images", config,
      {
        responseType: 'arraybuffer',
        contentType: 'application/zip'
      })
      .then(data => {
        JSZip.loadAsync(data.data)
          .then(zip => {
            setIsload(false);
            // Filter the files to only include image files
            const imageFiles = Object.keys(zip.files)
              .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));

            // Read each image file
            let count = 0;

            imageFiles.forEach((filename, index) => {
              console.log("filename s" + filename);;
              //should be saved in another way  
              //imageFileSource.set(filename,zip.files[imageFiles[index]])

              zip.file(filename)
                .async('blob')
                .then(blob => {
                  imageSource.set(filename, URL.createObjectURL(blob))

                  //new way
                  const zfile1 = new File([blob], filename, {
                    lastModified: zip.files[imageFiles[index]].date.getTime(),
                    type: 'application/image'
                  });
                  imageFileSource.set(filename, zfile1)
                  setDummy(Math.random())
                });
            })
            console.log(imageSource)
            console.log(imageFileSource);
            setDummy(Math.random())
          })
          .catch(e => { console.log(e); setIsload(false); })
      })
      .catch(error => { setIsload(false); console.error(error) });
    //},20000)    
  }
  //for HFAZ
  const [hfazList, sethfazList] = useState([]);
  const [hfazFullList, sethfazFullList] = useState([]);
  const [hfazId, sethfazId] = useState('')
  const [hfazStart, sethfazStart] = useState('')
  const [hfazEnd, sethfazEnd] = useState('')
  const [hfazSection, sethfazSection] = useState('')
  const [hfazLM, sethfazLM] = useState('')
  const [hfazType, sethfazType] = useState('')
  const [hfazAuditSection, sethfazAuditSection] = useState('')
  const [hfazgpsStart, sethfazgpsStart] = useState('')
  const [hfazgpsEnd, sethfazgpsEnd] = useState('')
  const [sectionIDList, setsectionIDList] = useState('')

  //for hfaz view modal
  const [hfazViewRows, sethfazViewRows] = useState([])
  const [hfazViewNames, sethfazViewNames] = useState([])
  const [openHfazView, setopenHfazView] = useState(false)
  const [hfazViewNamesReports, sethfazViewNamesReports] = useState([])
  const [hfazViewRowsReports, sethfazViewRowsReports] = useState([])
  const [hfazIssueList, sethfazIssueList] = useState([])
  const handleCloseHfaz = () => {
    setopenHfazView(false)
  }

  const handleAddHfaz = () => {
    if (!(
      hfazId != "" || hfazStart != "" || hfazEnd != "" ||
      hfazLM != "" || hfazSection != "" || hfazType != "" ||
      hfazgpsStart != "" || hfazgpsEnd != ""
    )) {
      setAlert('error')
      setAlertMsg('Please enter all the details to add HFAZ')
      return;
    }
    let regex = /^\d+\+\d+$/;
    if (!(regex.test(hfazStart) && regex.test(hfazEnd))) {
      setAlert("error");
      setAlertMsg("Please enter correct format for the start and end chainage, eg:0+200");
      return;
    }
    let first1 = hfazStart;
    let second1 = hfazEnd;

    first1 = first1.replace("+", ".")
    second1 = second1.replace("+", ".")

    sethfazEnd(second1);
    sethfazStart(first1);
    let l1 =
    {

      "hfaz_id": hfazId,
      "start_chainage": first1,
      "end_chainage": second1,
      "land_mark": hfazLM,
      "hfaz_section": hfazSection,
      "section_id": hfazAuditSection,
      "stretch_type": hfazType,
      "audit_id": auditID,
      "start_gps": hfazgpsStart,
      "end_gps": hfazgpsEnd
    }
    setIsload(true)
    AxiosApp.post(url1 + "hfaz_creation", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          console.log(response.data);
          setAlert("success");
          setAlertMsg(response.data.status);
          loadHfazTable()
        } else {
          setAlert("error");
          setAlertMsg(response.data.status);
        }
        clearAddForm()
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const loadSectionNameID = () => {
    let local1 = { "audit_id": auditID }
    setIsload(true);
    AxiosApp.post(url1 + "section_auditwise", local1)
      .then((response) => {
        setIsload(false);
        let object = response.data.details;
        let x = [];
        let k1 = Object.keys(object);
        let v1 = Object.values(object);

        if (response.data.statusCode == "200") {
          for (let index = 0; index < k1.length; index++) {
            if (!(v1[index].includes("Start") || v1[index].includes("End")))
              x.push([k1[index], v1[index]])
          }
          setsectionIDList(x)
          if (x.length > 0) {
            sethfazAuditSection(x[0][0])
            loadHfazTable(x[0][1])
          }
        } else {
          setAlert("error");
          setIsload(false);
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const loadHfazTable = (search1) => {
    let l1 = {
      "audit_id": auditID
    }
    setIsload(true)
    window.setTimeout(function () {
      AxiosApp.post(url1 + "hfaz_list", l1)
        .then((response) => {
          setIsload(false);
          if (response.data.statusCode == "200") {
            console.log(response.data);
            let l1 = response.data.details;
            sethfazFullList(l1)
            sethfazList(l1)

            // if(document.getElementById("audSecHfaz")){
            //   let searchName = document.getElementById("audSecHfaz").innerHTML;
            //   let l11 = l1.filter((item)=> item.section == searchName)
            //   sethfazList(l11)
            // } else if(search1){
            //   let l11 = l1.filter((item)=> item.section == search1)
            //   sethfazList(l11)
            // }
          } else {
            setIsload(false);
            //setAlert("error");
            //setAlertMsg("Could not filter");
          }
        })
        .catch((error) => {
          setIsload(false);
          //setAlert("error");
          //setAlertMsg(error);
        });
    }, 20000)
  }
  const filterHfazList = (e, c) => {
    let searchName = c.props.name
    let l1 = hfazFullList.filter((item) => item.section == searchName)
    sethfazList(l1)
  }
  const clearAddForm = () => {
    sethfazEnd('');
    sethfazId('')
    sethfazType('')
    sethfazStart('')
    sethfazLM('')
    sethfazSection('')
    sethfazgpsStart('')
    sethfazgpsEnd('')
  }
  const fetchImage = (l1, rowNo) => {
    if (!(l1 && rowNo)) return ''
    console.log("search" + l1)
    //send blob from here?
    //imageSource, find the search
    let returnArray = '';
    let search1 = auditID + "/" + rowNo + "/" + l1;
    for (let [key, value] of imageFileSource) {
      if (key.includes(search1)) {
        returnArray = value;
        break;
      }
    }
    return returnArray;
  }
  const fetchImageURLSalient = (mode) => {
    let returnArray = noImage;
    let search1 = ""
    if (!mode) return returnArray;
    else {
      search1 = (mode == "start") ? ".A.3.jpg" : ".B.3.jpg";
      for (let [key, value] of imageSource) {

        if (key.search(search1) != -1) {
          returnArray = value;
          break;
        }
      }
      return returnArray;
    }
  }
  const fetchImageURL = (x, rowNo) => {
    // console.log(x)
    if (!(x && rowNo)) {
      return (noImage)
    }
    //c.e.d.2
    let l2 = x.split(".");
    let l3 = l2[0] + "." + l2[1] + "." + l2[2] + "." + "3.jpg";

    let returnArray = noImage;
    //console.log("search" + l1)
    //send blob from here?
    //imageSource, find the search
    let search1 = auditID + "/" + rowNo + "/" + l3;
    for (let [key, value] of imageSource) {
      if (key == search1) {
        returnArray = value;
        break;
      }
    }
    return returnArray;
  }
  const setRowImage = (e, l1, rowNo) => {
    if (rowNo == "start" || rowNo == "end") return;
    if (!(l1 && rowNo)) return
    console.log("search" + l1)
    //add blob from here
    //imageSource, find the search
    let search1 = auditID + "/" + rowNo + "/" + l1;
    //if searched, put this image
    for (let [key, value] of imageSource) {
      if (key.includes(search1)) {
        imageFileSource.set(key, e.target.files[0])
        imageSource.set(key, URL.createObjectURL(e.target.files[0]))
        setDummy(Math.random())
        return
      }
    }
    setAlert("error")
    setAlertMsg("Error in updating the photo, pls try again later")
    return;
  }

  //report page
  const [teamNames, setTeamNames] = useState([])
  const [salient, setSalient] = useState([]);
  const [hfazReport, setHfazReport] = useState([])
  const [hfazSectionReport, setHfazSectionReport] = useState([])
  const [hfazIssuesPerHfaz, sethfazIssuesPerHfaz] = useState([])
  const [subSection, setSubsection] = useState([])
  const [criticalSection, setCriticalSection] = useState([])
  const [criticalNames, setCriticalNames] = useState([])
  const [generalNames, setGeneralNames] = useState([])
  const [generalSection, setGeneralSection] = useState([])

  //get the suggestion to print
  const getSuggestionHere = (object, issue, index) => {
    let l1 = "";
    let l11 = ""
    try {
      l1 = object[issue][0].issues;
      if (l1.length > 0) {
        for (let index = 0; index < l1.length; index++) {
          const element = l1[index];
          if (index == 0) {
            l11 = element.suggestion
          } else {
            l11 = l11 + "," + element.suggestion
          }
        }
      }
    } catch (error) {

    }
    return l11;
  }
  const getIssueHere = (object, issue, index) => {
    let l1 = "";
    let l11 = ""
    try {
      l1 = object[issue][0].issues;
      if (l1.length > 0) {
        for (let index = 0; index < l1.length; index++) {
          const element = l1[index];
          if (index == 0) {
            l11 = element.issue
          } else {
            l11 = l11 + "," + element.issue
          }
        }
      }
    } catch (error) {

    }
    return l11;
  }
  const genReport = () => {
    let l1 = {}
    l1.exec_summary = document.getElementById("exec_summary").value;
    l1.bkg_summary = document.getElementById("bkg_summary").value;
    l1.proj_details = document.getElementById("proj_details").value;
    l1.acc_summary = document.getElementById("accident_data").value;
    //table id
    let l2 = document.getElementById("bgAccidentDetails") // table

    l1.bgAccidentDetails = {}

    let l3 = {}
    for (let index1 = 1; index1 < l2.rows.length; index1++) { //rows
      let v3 = []
      //l2.rows[index1] && l2.rows[index1].cells && l2.rows[index1].cells.length
      for (let index = 0; index < 4; index++) { //cols
        v3.push(l2.rows[index1].cells[index].getElementsByTagName("input")[0].value)
      }
      l3["row" + index1] = v3
    }
    //l3.col_names = ["year", "total_acc", "fatalities", "injured"]
    l1.bgAccidentDetails = l3;
    l1.acc_data_table = {
      "bs": document.getElementById("bs_report").value,
      "ebs": document.getElementById("ebs_report").value,
      "bs_irc": document.getElementById("bs_irc_report").value,
      "veh_count_report": document.getElementById("veh_count_report").value,
      "pass_count_report": document.getElementById("pass_count_report").value,
      "ped_count_report": document.getElementById("ped_count_report").value
    }
    l1.opportunities = document.getElementById("opportunities").value;

    //section 2 hfaz

    let l5 = {}
    l1.hfazDetails = {}
    let hfazID = [];
    for (let index = 0; index < hfazReport.length; index++) {
      let l4 = {}
      l4.description = document.getElementById(index + "hfazDescription").value
      l4.severity = document.getElementById(index + "hfazSeverity").value
      l4.priority = document.getElementById(index + "hfazPriority").value
      l4.accTable = {}
      //for loop for the table
      let v3 = [];
      let l6 = document.getElementById(index + "hfazAccDataTable") //table
      v3.push(["Year", l6.rows[0].cells[1].getElementsByTagName("input")[0].value,
        l6.rows[0].cells[2].getElementsByTagName("input")[0].value])

      for (let index1 = 1; index1 < l6.rows.length; index1++) {
        v3.push([l6.rows[index1].cells[0].innerText, l6.rows[index1].cells[1].getElementsByTagName("input")[0].value,
        l6.rows[index1].cells[2].getElementsByTagName("input")[0].value])
      }
      l4.accTable = v3
      l5[hfazReport[index]["hfaz_id"]] = l4
      hfazID.push(hfazReport[index]["hfaz_id"])
    }
    l1.hfazDetails = l5;
    //call report api

    console.log(l1)

    if (editMode == false) {
      let l22 = {
        background: l1,
        hfaz_data: hfazID,
        audit_id: auditID,
        auditor_id: localStorage.getItem("rsa_user1"),
        last_updated: new Date().toISOString().slice(0, 10).split('-').reverse().join('-')
      }
      const config = {
        headers: { 'content-type': 'multipart/form-data' }
      }
      setIsload(true);
      AxiosApp.post(url1 + "report", l22)
        // AxiosApp.post(url1 + "report", f1, config)
        .then((response) => {
          if (response.data.statusCode == "200") {
            postTitle();
            console.log(response.data);
            setIsload(false);
            setAlert("success");
            setAlertMsg(response.data.status);
            window.setTimeout(() => { navigate("/Auditor_report") }, 1000)
          }
        })
        .catch((error) => {
          setIsload(false);
          setAlert("error");
          setAlertMsg(error);
          window.setTimeout(() => { navigate("/Auditor_report") }, 1000)
        });
    } else {
      let l22 = {
        background: l1,
        hfaz_data: hfazID,
        audit_id: auditID,
        updated_by: localStorage.getItem("rsa_user1"),
        last_updated: new Date().toISOString().slice(0, 10).split('-').reverse().join('-')
      }
      setIsload(true);
      AxiosApp.post(url1 + "report_edit", l22)
        .then((response) => {
          if (response.data.statusCode == "200") {
            postTitle();
            console.log(response.data);
            setIsload(false);
            setAlert("success");
            setAlertMsg(response.data.status);
            window.setTimeout(() => { navigate("/Auditor_report") }, 1000)
          }
        })
        .catch((error) => {
          setIsload(false);
          setAlert("error");
          setAlertMsg(error);
        });
    }
  }
  const postTitle = () => {

    let f1 = new FormData();
    f1.append("title", title_report)
    f1.append("sub_title", title_sub_report)
    f1.append("title_name", title_name)
    f1.append("title_company", title_company_name)
    f1.append("title_address", title_address)
    f1.append("title_contact", title_contact)
    f1.append("titleLogo.jpg", imageList['titleLogo'].image1)
    f1.append("titleLeft.jpg", imageList['titleLeft'].image1)
    f1.append("titleRight.jpg", imageList['titleRight'].image1)
    f1.append("filename", JSON.stringify(["titleLogo.jpg", "titleLeft.jpg", "titleRight.jpg"]))
    f1.append("audit_id", auditID)
    f1.append("last_updated", new Date().toISOString().slice(0, 10).split('-').reverse().join('-'))

    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }
    setIsload(true);
    AxiosApp.post(url1 + "report_logo_data", f1, config)
      .then((response) => {
        if (response.data.statusCode == "200") {
          console.log(response.data);
          setIsload(false);
        } else {
          setIsload(false);
        }
      })
      .catch((error) => {
        setIsload(false);
      });
  }
  const titleValidations = () => {
    if (!(title_report != null &&
      title_sub_report != null &&
      title_name != null &&
      title_company_name != null &&
      title_address != null &&
      title_contact != null &&
      imageList && imageList['titleLogo'] && imageList["titleLogo"].image1 &&
      imageList['titleLeft'] && imageList["titleLeft"].image1 &&
      imageList['titleRight'] && imageList["titleRight"].image1
    )) {
      window.alert("Please fill all the Front Page Details.")
      return;
    }
    // if(title_report.length > 55){
    //   setAlertMsg("Please enter the Title in Less than 55 Characters");
    //   return
    // }
    // if(title_sub_report.length > 60){
    //   setAlertMsg("Please enter the Sub-Title in Less than 60 Characters");
    //   return
    // }
    genReport();
  }
  const getTitleImages = () => {
    let l1 = {
      "audit_id": auditID
    }
    setIsload(true);
    AxiosApp.post(url1 + "report_logo_get", l1,
      {
        responseType: 'arraybuffer',
        contentType: 'application/zip'
      })
      .then(data => {
        JSZip.loadAsync(data.data)
          .then(zip => {
            setIsload(false);
            // Filter the files to only include image files
            const imageFiles = Object.keys(zip.files)
              .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));

            // Read each image file
            imageFiles.forEach((filename, index) => {
              //console.log("filename s" + filename);
              let fname1 = filename.split("/")[0]
              let file = filename.split("/")[1]

              zip.file(filename)
                .async('blob')
                .then(blob => {
                  let url1 = URL.createObjectURL(blob);
                  const image1 = new File([blob], fname1);

                  if (fname1.includes("titleLeft"))
                    imageList["titleLeft"] = { image1, url1, fname1 }
                  else if (fname1.includes("titleRight"))
                    imageList["titleRight"] = { image1, url1, fname1 }
                  else if (fname1.includes("titleLogo"))
                    imageList["titleLogo"] = { image1, url1, fname1 }
                  setDummy(Math.random())
                });
            })
          })
          .catch(e => { console.log(e); setIsload(false); })
      })
      .catch(error => { console.error(error); setIsload(false); });
  }
  const loadHfazTableReport = () => {
    let l1 = {
      "hfaz_id": "",
      "audit_id": auditID
    }
    setIsload(true);
    AxiosApp.post(url1 + "hfaz_report", l1)
      .then((response) => {
        if (response.data.statusCode == "200") {
          setIsload(false);
          console.log(response.data);
          let l1 = response.data.details;
          // l1 = [
          //   {
          //     "audit_id": "Audit68925",
          //     "end_chainage": "66.664",
          //     "hfaz_id": "gdgdfg",
          //     "hfaz_section": "Emerging Blackspot",
          //     "landmark": "dfgdfg",
          //     "start_chainage": "6.55",
          //     "stretch_type": "456546456"
          //   },
          //   {
          //     "audit_id": "Audit68925",
          //     "end_chainage": "66.664",
          //     "hfaz_id": "gdeegdfg9",
          //     "hfaz_section": "Emerging Blackspot",
          //     "landmark": "dfsdfsdf",
          //     "start_chainage": "6.535",
          //     "stretch_type": "22"
          //   }
          // ];
          setHfazReport(l1)
          //loop thru and get the hfazreportview details
          for (let index = 0; index < l1.length; index++) {
            const element = l1[index];
            handleHfazSections(element)
            loadIssuesPerHfaz(element.hfaz_id)
          }
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const loadIssuesPerHfaz = () => {
    let l1 =
      { "audit_id": auditID }
    setIsload(true);
    AxiosApp.post(url1 + "report_issue", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          sethfazIssuesPerHfaz(response.data.details)
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const populateTeamDetails = () => {
    let l1 =
      { "audit_type_id": auditTypeID }
    setIsload(true);
    AxiosApp.post(url1 + "team_details", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          setTeamNames(response.data.details)
          console.log(response.data.details);

        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const populateSalientReport = () => {
    let l1 =
      { "audit_id": auditID }
    setIsload(true);
    AxiosApp.post(url1 + "report_plan_data", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          setSalient(response.data.details)
          if (state.state.editMode) {
            let l2 = response.data.logo_details;
            setreport(l2.title)
            setsubreport(l2.sub_title)
            setname(l2.title_name)
            setcompany(l2.title_company)
            setaddress(l2.title_address)
            setcontact(l2.title_contact)
          }
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const handleHfazSections = (r1) => {
    if (r1 == null) return;
    let l1 = { "hfaz_id": r1.hfaz_id }
    setIsload(true);
    AxiosApp.post(url1 + "hfaz_view", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          let l1 = hfazSectionReport
          let l2 = hfazViewNamesReports
          console.log(l1);
          let a = fillHfazViewTablesReports(response.data.details);
          l1[r1.hfaz_id] = a[0]
          l2[r1.hfaz_id] = a[1]
          //l3[r1.hfaz_id] = a[2]
          sethfazViewRowsReports(l1)
          sethfazViewNamesReports(l2)
          //sethfazIssueList(l3)
          console.log(l1)
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const getAllSubSection = () => {
    let l1 =
      { "audit_id": auditID }
    setIsload(true);
    AxiosApp.post(url1 + "sub_section", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          setSubsection(response.data.details)
        }
      })
      .catch((error) => {
        setIsload(false);
      });
  }
  const loadCriticalSection = () => {
    // let l1 =
    //   {
    //     "Curve": {
    //       "1": [
    //         {
    //           "answer": "25556",
    //           "conditions": "NA",
    //           "data_type": "Numerical (Float - Autogenerated)",
    //           "field_type": "Mandatory",
    //           "functionality": "Autogenerated",
    //           "irc_help_tool": "Capture the GPS Coordinates by Clicking the Button",
    //           "master_table": "Lat Long",
    //           "question": "GPS Location",
    //           "question_id": "C.E.E.1",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "39434",
    //           "conditions": "NA",
    //           "data_type": "Numerical (Special Character)",
    //           "field_type": "Optional",
    //           "functionality": "Numerical Box",
    //           "irc_help_tool": "Enter the Chainage Value in this Format (170+000)",
    //           "master_table": "Custom",
    //           "question": "Chainage (km)",
    //           "question_id": "C.E.E.2",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "w4",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Mandatory",
    //           "functionality": "Dropdown/ Radio Button",
    //           "irc_help_tool": "From Master Table",
    //           "master_table": "Master_Table",
    //           "question": "Road Side",
    //           "question_id": "C.E.E.4",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "yyy",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Mandatory",
    //           "functionality": "Dropdown/ Radio Button",
    //           "irc_help_tool": "From Master Table",
    //           "master_table": "Master_Table",
    //           "question": "Issues",
    //           "question_id": "C.E.E.5",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "Mandatory",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Text Area",
    //           "irc_help_tool": "Any Other Details about the Issue/ Location - Root Cause ",
    //           "master_table": "Custom",
    //           "question": "Comments",
    //           "question_id": "C.E.E.6",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": true,
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Checkbox",
    //           "irc_help_tool": "Select Critical: If the issue falls within the High Frequency Accident Zone, Affects the Vulnerable Road Users, or Select General.",
    //           "master_table": "Custom",
    //           "question": "Critical observation",
    //           "question_id": "C.E.E.7",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": true,
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Checkbox",
    //           "irc_help_tool": "Select Critical: If the issue falls within the High Frequency Accident Zone, Affects the Vulnerable Road Users, or Select General.",
    //           "master_table": "Custom",
    //           "question": "General observation",
    //           "question_id": "C.E.E.8",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "Very High",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Dropdown/ Radio Button",
    //           "irc_help_tool": "Very High - In cases of very high severity, multiple deaths are likely. Examples: include high-speed, multi-vehicle crashes on expressways or a bus collision at high speed with a bridge abutment.\nHigh - High severity refers to situations where a death and/or serious injuries are likely. Examples: include high or medium-speed vehicle-to-vehicle collisions, collisions with a fixed roadside object, or pedestrian crashes on rural highways.\nMedium - Medium severity involves scenarios where only minor injuries are likely. This includes low-speed collisions, such as a three-wheeler colliding with a bicyclist, a rear-end crash in a slip lane, or a pedestrian struck in a car park.",
    //           "master_table": "Master_Table",
    //           "question": "Severity ",
    //           "question_id": "C.E.E.9",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "Low",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Dropdown/ Radio Button",
    //           "irc_help_tool": "Essential - Where risk is assessed as Very High, the recommendation shall be implemented \u201cat any cost\u201d. \nHighly Desirable - Where risk is assessed as High, the recommendation shall be implemented unless cost of remedial treatment is prohibitive and risk can be reduced by an alternative measure.\nDesirable - Where risk is assessed as Medium, the recommendation shall be implemented if the safety concerns could not be mitigated even after the implementation of the recommendations under \u201cessential;\u201d and \u2018highly desirable\u2019 priority levels for the same location and the risk needs to be reduced further.",
    //           "master_table": "Master_Table",
    //           "question": "Priority ",
    //           "question_id": "C.E.E.10",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 1,
    //           "section_id": "E"
    //         },
    //         {}
    //       ],
    //       "2": [
    //         {
    //           "answer": "494",
    //           "conditions": "NA",
    //           "data_type": "Numerical (Float - Autogenerated)",
    //           "field_type": "Mandatory",
    //           "functionality": "Autogenerated",
    //           "irc_help_tool": "Capture the GPS Coordinates by Clicking the Button",
    //           "master_table": "Lat Long",
    //           "question": "GPS Location",
    //           "question_id": "C.E.E.1",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 2,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "231",
    //           "conditions": "NA",
    //           "data_type": "Numerical (Special Character)",
    //           "field_type": "Optional",
    //           "functionality": "Numerical Box",
    //           "irc_help_tool": "Enter the Chainage Value in this Format (170+000)",
    //           "master_table": "Custom",
    //           "question": "Chainage (km)",
    //           "question_id": "C.E.E.2",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 2,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "Yes",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Mandatory",
    //           "functionality": "Dropdown/ Radio Button",
    //           "irc_help_tool": "From Master Table",
    //           "master_table": "Master_Table",
    //           "question": "Road Side",
    //           "question_id": "C.E.E.4",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 2,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "No",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Mandatory",
    //           "functionality": "Dropdown/ Radio Button",
    //           "irc_help_tool": "From Master Table",
    //           "master_table": "Master_Table",
    //           "question": "Issues",
    //           "question_id": "C.E.E.5",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 2,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": "Yes",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Text Area",
    //           "irc_help_tool": "Any Other Details about the Issue/ Location - Root Cause ",
    //           "master_table": "Custom",
    //           "question": "Comments",
    //           "question_id": "C.E.E.6",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 2,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": true,
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Checkbox",
    //           "irc_help_tool": "Select Critical: If the issue falls within the High Frequency Accident Zone, Affects the Vulnerable Road Users, or Select General.",
    //           "master_table": "Custom",
    //           "question": "Critical observation",
    //           "question_id": "C.E.E.7",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 2,
    //           "section_id": "E"
    //         },
    //         {
    //           "answer": true,
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Checkbox",
    //           "irc_help_tool": "Select Critical: If the issue falls within the High Frequency Accident Zone, Affects the Vulnerable Road Users, or Select General.",
    //           "master_table": "Custom",
    //           "question": "General observation",
    //           "question_id": "C.E.E.8",
    //           "retrieval_id": [
    //             {
    //               "issue": "Curve - Alignment Isuues",
    //               "retrieval_id": "C.E.E.5.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.E.5.1"
    //             }
    //           ],
    //           "section": "Curve",
    //           "section_count": 2,
    //           "section_id": "E"
    //         },
    //         {}
    //       ]
    //     },
    //     "Location Capture": {
    //       "1": [
    //         {
    //           "answer": "Yes",
    //           "conditions": "NA",
    //           "data_type": "Numerical (Float - Autogenerated)",
    //           "field_type": "Mandatory",
    //           "functionality": "Autogenerated",
    //           "irc_help_tool": "Capture the GPS Coordinates by Clicking the Button",
    //           "master_table": "Lat Long",
    //           "question": "GPS Location",
    //           "question_id": "C.E.C.1",
    //           "retrieval_id": [
    //             {
    //               "issue": "Acceleration Lane - Missing",
    //               "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.D.5.1.C.E.D.6.1"
    //             }
    //           ],
    //           "section": "Location Capture",
    //           "section_count": 1,
    //           "section_id": "C"
    //         },
    //         {
    //           "answer": "No",
    //           "conditions": "NA",
    //           "data_type": "Numerical (Special Character)",
    //           "field_type": "Optional",
    //           "functionality": "Numerical Box",
    //           "irc_help_tool": "Enter the Chainage Value in this Format (170+000)",
    //           "master_table": "Custom",
    //           "question": "Chainage (km)",
    //           "question_id": "C.E.C.2",
    //           "retrieval_id": [
    //             {
    //               "issue": "Acceleration Lane - Missing",
    //               "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.D.5.1.C.E.D.6.1"
    //             }
    //           ],
    //           "section": "Location Capture",
    //           "section_count": 1,
    //           "section_id": "C"
    //         },
    //         {
    //           "answer": "Updated",
    //           "conditions": "NA",
    //           "data_type": "Image/Video/Audio",
    //           "field_type": "Mandatory",
    //           "functionality": "Camera/ Upload",
    //           "irc_help_tool": "Click the Image focusing on the issue/ landmark. Coverage Area should be 75% focus and mark the issue before submiting the image.",
    //           "master_table": "Camera",
    //           "question": "Photo",
    //           "question_id": "C.E.C.3",
    //           "retrieval_id": [
    //             {
    //               "issue": "Acceleration Lane - Missing",
    //               "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.D.5.1.C.E.D.6.1"
    //             }
    //           ],
    //           "section": "Location Capture",
    //           "section_count": 1,
    //           "section_id": "C"
    //         },
    //         {
    //           "answer": "No",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Text Area",
    //           "irc_help_tool": "Any Other Details about the Issue/ Location - Root Cause ",
    //           "master_table": "Custom",
    //           "question": "Comments",
    //           "question_id": "C.E.C.4",
    //           "retrieval_id": [
    //             {
    //               "issue": "Acceleration Lane - Missing",
    //               "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.D.5.1.C.E.D.6.1"
    //             }
    //           ],
    //           "section": "Location Capture",
    //           "section_count": 1,
    //           "section_id": "C"
    //         }
    //       ],
    //       "2": [
    //         {
    //           "answer": "Yes",
    //           "conditions": "NA",
    //           "data_type": "Numerical (Float - Autogenerated)",
    //           "field_type": "Mandatory",
    //           "functionality": "Autogenerated",
    //           "irc_help_tool": "Capture the GPS Coordinates by Clicking the Button",
    //           "master_table": "Lat Long",
    //           "question": "GPS Location",
    //           "question_id": "C.E.C.1",
    //           "retrieval_id": [
    //             {
    //               "issue": "Acceleration Lane - Missing",
    //               "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.D.5.1.C.E.D.6.1"
    //             }
    //           ],
    //           "section": "Location Capture",
    //           "section_count": 2,
    //           "section_id": "C"
    //         },
    //         {
    //           "answer": "No",
    //           "conditions": "NA",
    //           "data_type": "Numerical (Special Character)",
    //           "field_type": "Optional",
    //           "functionality": "Numerical Box",
    //           "irc_help_tool": "Enter the Chainage Value in this Format (170+000)",
    //           "master_table": "Custom",
    //           "question": "Chainage (km)",
    //           "question_id": "C.E.C.2",
    //           "retrieval_id": [
    //             {
    //               "issue": "Acceleration Lane - Missing",
    //               "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.D.5.1.C.E.D.6.1"
    //             }
    //           ],
    //           "section": "Location Capture",
    //           "section_count": 2,
    //           "section_id": "C"
    //         },
    //         {
    //           "answer": "Updated",
    //           "conditions": "NA",
    //           "data_type": "Image/Video/Audio",
    //           "field_type": "Mandatory",
    //           "functionality": "Camera/ Upload",
    //           "irc_help_tool": "Click the Image focusing on the issue/ landmark. Coverage Area should be 75% focus and mark the issue before submiting the image.",
    //           "master_table": "Camera",
    //           "question": "Photo",
    //           "question_id": "C.E.C.3",
    //           "retrieval_id": [
    //             {
    //               "issue": "Acceleration Lane - Missing",
    //               "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.D.5.1.C.E.D.6.1"
    //             }
    //           ],
    //           "section": "Location Capture",
    //           "section_count": 2,
    //           "section_id": "C"
    //         },
    //         {
    //           "answer": "No",
    //           "conditions": "NA",
    //           "data_type": "Alphabetical",
    //           "field_type": "Optional",
    //           "functionality": "Text Area",
    //           "irc_help_tool": "Any Other Details about the Issue/ Location - Root Cause ",
    //           "master_table": "Custom",
    //           "question": "Comments",
    //           "question_id": "C.E.C.4",
    //           "retrieval_id": [
    //             {
    //               "issue": "Acceleration Lane - Missing",
    //               "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
    //               "suggestion": null,
    //               "suggestion_id": "C.E.D.5.1.C.E.D.6.1"
    //             }
    //           ],
    //           "section": "Location Capture",
    //           "section_count": 2,
    //           "section_id": "C"
    //         }
    //       ]
    //     }
    //   }
    //   let a = fillCriticalSection(l1);
    //   setCriticalNames(a[1])
    //   setCriticalSection(a[0])
    //   return;
    let l11 = {
      "audit_id": auditID
    }
    setIsload(true);
    AxiosApp.post(url1 + "critical_observation", l11)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          console.log(response.data);
          let l1 = response.data.details;
          let a = fillCriticalSection(l1);

          console.log(l1);
          console.log(a);
          setCriticalNames(a[1])
          setCriticalSection(a[0])
          criticalSection != [] && console.log(criticalSection)
          console.log(a)
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const dummyCall = () => {
    let l1 = {
      "details": [
        {
          "Cross Section": [
            {
              "Acceleration Lane - Missing": [
                {
                  "RHS-SR": [
                    {
                      "ans_id": 8,
                      "chainage": "4 + 2",
                      "gps_location": null,
                      "issue": "Acceleration Lane - Missing",
                      "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
                      "roadside": "RHS-SR",
                      "sec_count": 1,
                      "section": "Cross Section",
                      "suggestion": null
                    }
                  ]
                }
              ]
            }
          ],
          "Curve": [
            {
              "Acceleration Lane - Missing": [
                {
                  "LHS-MCW": [
                    {
                      "ans_id": 2,
                      "chainage": "101 + 200",
                      "gps_location": null,
                      "issue": "Acceleration Lane - Missing",
                      "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
                      "roadside": "LHS-MCW",
                      "sec_count": 2,
                      "section": "Curve",
                      "suggestion": null
                    }
                  ]
                }
              ],
              "Curve - Alignment Isuues": [
                {
                  "LHS-MCW": [
                    {
                      "ans_id": 1,
                      "chainage": "0 + 100",
                      "gps_location": null,
                      "issue": "Curve - Alignment Isuues",
                      "retrieval_id": "C.E.E.5.1",
                      "roadside": "LHS-MCW",
                      "sec_count": 1,
                      "section": "Curve",
                      "suggestion": null
                    }
                  ]
                }
              ]
            }
          ],
          "Drainage": [
            {
              "Curve - Alignment Isuues": [
                {
                  "LHS-MCW": [
                    {
                      "ans_id": 6,
                      "chainage": "601 + 700",
                      "gps_location": null,
                      "issue": "Curve - Alignment Isuues",
                      "retrieval_id": "C.E.E.5.1",
                      "roadside": "LHS-MCW",
                      "sec_count": 1,
                      "section": "Drainage",
                      "suggestion": null
                    }
                  ]
                }
              ]
            }
          ],
          "Facilities": [
            {
              "Curve - Alignment Isuues": [
                {
                  "RHS-SR": [
                    {
                      "ans_id": 7,
                      "chainage": "701 + 800",
                      "gps_location": null,
                      "issue": "Curve - Alignment Isuues",
                      "retrieval_id": "C.E.E.5.1",
                      "roadside": "RHS-SR",
                      "sec_count": 1,
                      "section": "Facilities",
                      "suggestion": null
                    }
                  ]
                }
              ]
            }
          ],
          "Location Capture": [
            {
              "Acceleration Lane - Missing": [
                {
                  "LHS-MCW": [
                    {
                      "ans_id": 26,
                      "chainage": "0 + 1001",
                      "gps_location": "20`22`109",
                      "issue": "Acceleration Lane - Missing",
                      "retrieval_id": "C.E.D.5.1.C.E.D.6.1",
                      "roadside": "LHS-MCW",
                      "sec_count": 2,
                      "section": "Location Capture",
                      "suggestion": null
                    }
                  ]
                }
              ],
              "Curve - Alignment Isuues": [
                {
                  "LHS-SR": [
                    {
                      "ans_id": 9,
                      "chainage": "901 + 1000",
                      "gps_location": null,
                      "issue": "Curve - Alignment Isuues",
                      "retrieval_id": "C.E.E.5.1",
                      "roadside": "LHS-SR",
                      "sec_count": 1,
                      "section": "Location Capture",
                      "suggestion": null
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "status": "Success",
      "statusCode": 200
    }

    fillGeneralSection(l1.details[0]);
    return;
  }
  const loadEditableDatas = () => {
    let l1 = {
      "audit_id": auditID
    }
    setIsload(true);
    AxiosApp.post(url1 + "report_rsa_data", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          console.log(response.data);
          //uncomment once u have all BE data
          contentReport = response.data.background[0];
          let l11 = {
            "title": "",
            "sub_title": "",
            "title_name": "",
            "title_company": "",
            "title_address": "",
            "title_contact": ""
          }
          contentReport.background.title_details = l11;
          setDummy(Math.random())
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const loadGeneralSection = () => {
    // dummyCall();
    // return;
    let l1 = {
      "audit_id": auditID
    }
    setIsload(true);
    AxiosApp.post(url1 + "general_observation", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          console.log(response.data);
          let l1 = response.data.details;
          fillGeneralSection(l1);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const fillGeneralSection = (l1) => {
    setGeneralSection(Object.values(l1))
    setGeneralNames(Object.keys(l1))
  }
  const fillCriticalSection = (l1) => {

    setCriticalNames(Object.keys(l1))

    //add dummy array
    let dummyA = []
    for (let index = 0; index < Object.keys(l1).length; index++) {
      let l2 = [];
      let persectionCount = l1[Object.keys(l1)[index]].length
      for (let index = 0; index < persectionCount; index++) {
        l2.push([])
      }
      // adding last row as false -- delete status option
      l2.push(false)
      dummyA.push(l2)
    }
    setCriticalSection(dummyA)

    let m1 = -1;
    let s1 = { ...criticalNames };

    let local = [];
    for (let index = 0; index < Object.keys(l1).length; index++) {
      local[index] = [];
      const eachSection = Object.values(l1)[index];
      let perSectionCounter = 0;
      for (const rowNo in eachSection) {
        const element = eachSection[rowNo]
        let l11 = [];
        //means -> each row in that section  
        //gothru each number's array of objects and fix the table population row.
        //1.gps
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("GPS")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //2.chainage
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Chainage")) {
            element[index].answer = element[index].answer.replace(".", "+")
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //3.roadside
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Road Side")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //4.photo
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("photo")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})

        /**
         * issues and suggestions, take from the retrieval_id
         * take from first element, coz it will be repeated for each question
         */
        let t1 = element[0].retrieval_id; //array of objects
        let t2 = [];
        let t3 = [];
        for (let index = 0; index < t1.length; index++) {
          const element1 = t1[index];
          t2.push(element1['issue'])
          t3.push(element1['suggestion'])
        }
        if (element[0]["new_issue"] != null)
          t2.push(element[0]["new_issue"][0])
        else
          t2.push("")
        if (element[0]["new_suggestion"] != null)
          t3.push(element[0]["new_suggestion"][0])
        else
          t3.push("")

        //issues
        l11.push(t2.join(","))

        //suggestion
        l11.push(t3.join(","))

        /* this is for array of array of objects code. can be removed
        for (let index = 0; index < t1.length; index++) {
          const element1 = t1[index];
          if (element1 != null) {
            for (let index1 = 0; index1 < element1.length; index1++) {
              const element2 = element1[index1];

              t2.push(element2['issue'])
              t3.push(element2['suggestion'])
            }
          }
        }

        //issues
        l11.push(t2.toString())

        //suggestion
        l11.push(t3.toString())*/

        // //5.Issues
        // m1 = -1;            
        // for (let index = 0; index < element.length; index++) {
        //   if(element[index] && element[index].question && 
        //     element[index].question.includes("Issues")){
        //     m1 = index; l11.push(element[index]);
        //     //issuenames.push(element[index].answer)
        //     break;
        //   }              
        // }
        // if(m1 == -1) l11.push({})
        // //6.Suggestion
        // m1 = -1;            
        // for (let index = 0; index < element.length; index++) {
        //   if(element[index] && element[index].retrieval_id){
        //     m1 = index; l11.push(element[index]);
        //     break;
        //   }              
        // }       
        local[index][perSectionCounter] = l11;
        perSectionCounter = perSectionCounter + 1;
      }
    }
    console.log(local)
    return [local, Object.keys(l1)]
  }
  useEffect(() => {

    //loadSectionTable();
    //loadSectionNameID();
    try {
      loadWeather()
      loadStartEndTable();
      // const myTimeout = setTimeout(myGreeting, 5000);

      // function myStopFunction() {
      //   clearTimeout(myTimeout);
      // }
      loadAnsImages();
      clearAddForm();
      setEditMode(state.state.editMode);
      if (state.state.editMode) {
        getTitleImages()
        loadEditableDatas()
      } else {
        imageList = {}
      }
      storeCatNames();
    } catch (error) {
      console.log(error);

    }

    //already hfaz handled in audit_section_detail api
    //checkHfaz();
  }, []);

  const checkHfaz = () => {
    let l1 = {
      "audit_id": auditID
    }
    setIsload(true);
    AxiosApp.post(url1 + "check_hfaz", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          //find ways to store sections
          let l2 = response.data.details;
          setShowHFAZ(l2.hfaz)
        } else {
          setShowHFAZ(false)
          //setAlert("error");
          //setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        //setAlert("error");
        //setAlertMsg(error);
      });
  }
  const storeCatNames = () => {
    let l1 = {
      "audit_id": auditID
    }
    setIsload(true);
    AxiosApp.post(url1 + "sub_section", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          //find ways to store sections
          let l2 = response.data.details;
          setSectionCategoryNames(l2)
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

  const handleAllSectionSave = () => {
    for (let index = 0; index < sectionRows.length; index++) {
      const element = sectionRows[index];
      handleSectionSave(element)
    }
  }
  const handleSectionSave = (sectionToSave) => {
    console.log(sectionToSave)

    for (let index = 0; index < sectionToSave.length; index++) {
      const element = sectionToSave[index];
      let sectionRowId = "";
      let sectionRowNo = ""
      let a1 = {}
      let deleteStatus = false;
      let image = {}
      let forObs = [];
      let formData = new FormData()
      for (let index = 0; index < element.length; index++) {
        const data = element[index];
        if (data && data != {}) {
          /**
           * //if the row has image to edit
           * formData.append("file_name", filename);
             formData.append(filename, fileImage);
           */

          //0 is GPS
          //1 is chainage
          //2 is roadside
          //3 is photo
          //4 is issue
          //5 is sugg
          //6 7 is obs 
          //8 is severity
          //9 is priroty
          //10 is others
          if (index == 3 && data && data.question_id) {// this column is photo for all the sections
            let image = fetchImage(data.question_id, data.section_count)


            if (image && isUploadClicked === true) {
              formData.append(data.question_id + ".jpg", image);
              a1[data.question_id] = "Image"
              a1["file_name"] = [data.question_id + ".jpg"]
            }

            // //download and see this file???
            // const a = document.createElement("a");
            // a.href = URL.createObjectURL(image)
            // document.body.appendChild(a);
            // a.download = "checkimage.png"
            // a.click();
            // document.body.removeChild(a);
            //check over

          } else if (index == 0) {
            // let regex = /^\d+\.\d+$/;
            let gps = data.answer;
            // if (!(regex.test(gps))) {
            //   setAlert("error");
            //   setAlertMsg("Please enter correct format for GPS, eg:0.200 in section "+sectionToSave);
            //   return;
            // }
            a1[data.question_id] = gps;
            formData.append("gps_location", gps)

          } else if (index == 1) {
            let chain = data.answer;
            if (!(regex.test(chain))) {
              setAlert("error");
              setAlertMsg("Please enter correct format for  chainage, eg:0+200 in section" + sectionToSave);
              return;
            }
            chain = chain.replace("+", ".")
            a1[data.question_id] = chain
            formData.append("chainage", chain);
          } else if (index == 2) {
            formData.append("roadside", data.answer);
            a1[data.question_id] = data.answer
          } else if (index == 4) {
            //send additional issues
            let n1 = ""
            try {
              n1 = document.getElementById(element[0].section + element[0].section_count + "issue").value

            } catch (error) {
              n1 = ""
            }
            let m1 = [];
            n1 ? m1.push(n1) : m1.push("")
            formData.append("new_issue", JSON.stringify(m1))

            //send additional suggestion
            try {
              n1 = document.getElementById(element[0].section + element[0].section_count + "sugg").value

            } catch (error) {
              n1 = ""
            }
            m1 = [];
            n1 ? m1.push(n1) : m1.push("")
            formData.append("new_suggestion", JSON.stringify(m1))
          } else if (index == 6 || index == 7) {
            a1[data.question_id] = data.answer
            let temp = data.answer;
            if (temp) {
              forObs.push(data.question)
            }
          }
          else {
            try {
              if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                  const e1 = data[i];
                  a1[e1.question_id] = e1.answer
                }
              } else {
                a1[data.question_id] = data.answer
              }
            } catch (error) {

            }

          }
          if (sectionRowId == "") sectionRowId = data.section_id
          if (sectionRowNo == "") sectionRowNo = data.section_count
        }
      }
      deleteStatus = element[11]
      //loop over each row in the section and send axioscall

      formData.append("audit_id", auditID) //fix
      formData.append("updated_on", new Date().toISOString().slice(0, 10).split('-').reverse().join('-'))
      formData.append("updated_by", localStorage.getItem("rsa_user1")) //fix
      formData.append("answers", JSON.stringify(a1))
      formData.append("section_id", sectionRowId)
      formData.append("number", sectionRowNo)
      formData.append("delete_status", deleteStatus)
      setIsload(true);
      const config = {
        headers: { 'content-type': 'multipart/form-data' }
      }

      //share the category name
      let v1 = {}
      v1[element[0].section] = ""
      if (sectionCategoryNames[element[0].section]) {
        v1[element[0].section] = sectionCategoryNames[element[0].section]
      }
      formData.append("sub_section", JSON.stringify(v1))
      //share general and critical observation
      if (forObs.length == 2) {
        forObs = "Both";
      }
      formData.append("obs_category", forObs)
      formData.append("live_gps", gpsLive);

      formData.append("delete_status", false)

      setIsload(true);
      axios.post(url1 + "answer_edit", formData, config)
        .then((response) => {
          setIsload(false);
          if (response.data.statusCode == "200") {
            setAlert("success");
            setAlertMsg(response.data.status + " " + (Object.keys(v1)[0]));
          } else {
            setAlert("error");
            setAlertMsg(response.data.status + " " + (Object.keys(v1)[0]));
          }
        })
        .catch((error) => {
          setIsload(false);
          setAlert("error");
          setAlertMsg(error);
        });
    }
  }
  const saveHfazEdit = () => {
    //loop hfazList and send json to edit
    for (let index = 0; index < hfazList.length; index++) {
      const element = hfazList[index];
      let l1 = {
        "hfaz_id": element.hfaz_id,
        "start_chainage": element.start_chainage,
        "end_chainage": element.end_chainage,
        "land_mark": element.landmark,
        "section_id": hfazAuditSection,
        "stretch_type": element.stretch_type,
        "audit_id": auditID,
        "start_gps": element.start_gps,
        "end_gps": element.end_gps
      }
      setIsload(true);
      AxiosApp.post(url1 + "hfaz_edit", l1)
        .then((response) => {
          setIsload(false);
          if (response.data.statusCode == "200") {
            setAlert("success");
            setAlertMsg(response.data.status);
            if (index == (hfazList.length - 1))
              loadHfazTable()
          } else {
            setAlert("error");
            setAlertMsg(response.data.status);
            if (index == (hfazList.length - 1))
              loadHfazTable()
          }
        })
        .catch((error) => {
          setIsload(false);
          setAlert("error");
          setAlertMsg(error);
        });
    }
  }

  const handleView = (chosenRow) => {
    if (chosenRow == null) return;
    let l1 = { "hfaz_id": chosenRow.hfaz_id }
    setIsload(true);
    AxiosApp.post(url1 + "hfaz_view", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          setopenHfazView(true)
          fillHfazViewTables(response.data.details)
          // setAlert("success");
          //setAlertMsg(response.data.status);
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
  const fillHfazViewTables = (l1) => {

    sethfazViewNames(Object.keys(l1))

    //add dummy array
    let dummyA = []
    for (let index = 0; index < Object.keys(l1).length; index++) {
      let l2 = [];
      let persectionCount = l1[Object.keys(l1)[index]].length
      for (let index = 0; index < persectionCount; index++) {
        l2.push([])
      }
      // adding last row as false -- delete status option
      l2.push(false)
      dummyA.push(l2)
    }
    sethfazViewRows(dummyA)

    let m1 = -1;
    let s1 = { ...hfazViewNames };

    let local = [];
    for (let index = 0; index < Object.keys(l1).length; index++) {
      local[index] = [];
      const eachSection = Object.values(l1)[index];
      let perSectionCounter = 0;
      for (const rowNo in eachSection) {
        const element = eachSection[rowNo]
        let l11 = [];
        //means -> each row in that section  
        //gothru each number's array of objects and fix the table population row.
        //1.gps
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("GPS")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //2.chainage
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Chainage")) {
            element[index].answer = element[index].answer.replace(".", "+")
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //3.roadside
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Road Side")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //4.photo
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("photo")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //5.Issues/Landuse Category/ Roadside Hazard Category/ User Behaviour Category
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            (element[index].question.includes("Issues") ||
              element[index].question.includes("Landuse Category") ||
              element[index].question.includes("Roadside Hazard Category") ||
              element[index].question.includes("User Behaviour Category")
            )) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //6.Suggestion
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].retrieval_id) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //7.Observation type
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Critical")) {
            if (element[index].answer == "true") element[index].answer = true;
            else element[index].answer = false;
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //8.General Observation
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("General")) {
            if (element[index].answer == "true") element[index].answer = true;
            else element[index].answer = false;
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //9.Severity
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Severity")) {
            m1 = index; l11.push(element[index]);

            loadSectionSeverity(element[index].question_id, perSectionCounter);
            break;
          }
        }


        if (m1 == -1) l11.push({})
        //10.Priority
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Priority")) {
            m1 = index; l11.push(element[index]);

            loadSectionPriority(element[index].question_id, perSectionCounter);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //11.Other Entries
        m1 = -1;
        let other1 = []
        for (let index = 0; index < element.length; index++) {
          //should not have this in the list
          let l2 = ["Priority", "Severity", "General observation",
            "Critical observation", "Photo/Video/Audio", "Road Side", "Chainage (km)", "GPS Location", "Issues",
            "Landuse Category", "Roadside Hazard Category", "User Behaviour Category"]
          if (element[index] && element[index].question &&
            !l2.includes(element[index].question.trim())) {
            m1 = index; other1.push(element[index]);
          }
        }

        if (m1 == -1) l11.push({})
        else l11.push(other1)

        //12 - delete status
        // row as false -- delete status option
        l11.push(false)

        local[index][perSectionCounter] = l11;
        perSectionCounter = perSectionCounter + 1;
      }
    }
    sethfazViewRows(local)
    setDummy(Math.random())
  }
  const fillHfazViewTablesReports = (l1) => {

    sethfazViewNamesReports(Object.keys(l1))

    //add dummy array
    let dummyA = []
    for (let index = 0; index < Object.keys(l1).length; index++) {
      let l2 = [];
      let persectionCount = l1[Object.keys(l1)[index]].length
      for (let index = 0; index < persectionCount; index++) {
        l2.push([])
      }
      // adding last row as false -- delete status option
      l2.push(false)
      dummyA.push(l2)
    }
    sethfazViewRowsReports(dummyA)

    let m1 = -1;
    let s1 = { ...hfazViewNamesReports };

    let local = [];
    let issueLocal = [];
    for (let index = 0; index < Object.keys(l1).length; index++) {
      local[index] = [];
      const eachSection = Object.values(l1)[index];
      let perSectionCounter = 0;
      //let issuenames = [];
      //issueLocal[index] = []
      for (const rowNo in eachSection) {
        const element = eachSection[rowNo]
        let l11 = [];
        //means -> each row in that section  
        //gothru each number's array of objects and fix the table population row.
        //1.gps
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("GPS")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //2.chainage
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Chainage")) {
            element[index].answer = element[index].answer.replace(".", "+")
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //3.roadside
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.includes("Road Side")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //4.photo
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("photo")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //5.Issues/Landuse Category/ Roadside Hazard Category/ User Behaviour Category        
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            (element[index].question.includes("Issues") ||
              element[index].question.includes("Landuse Category") ||
              element[index].question.includes("Roadside Hazard Category") ||
              element[index].question.includes("User Behaviour Category")
            )) {
            m1 = index; l11.push(element[index]);
            //issuenames.push(element[index].answer)
            break;
          }
        }
        if (m1 == -1) l11.push({})
        //6.Suggestion
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].retrieval_id) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        //issueLocal[index] = issuenames;         
        local[index][perSectionCounter] = l11;
        perSectionCounter = perSectionCounter + 1;
      }
    }
    console.log(local)
    return [local, Object.keys(l1)]
  }
  return (
    <div>
      <AuditorHeader /> <p style={{
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
        className="rsa_usermanagement"
      >
        Audit: {auditID}
        <div
          style={{
            margin: "auto",
            width: "100%",
            border: "1px solid rgba(127, 163, 222, 0.3)",
            minHeight: "40vh",
            borderRadius: "10px",
            backgroundColor: "rgba(255, 255, 255, 1)  ",
            padding: "20px",
          }}
          className="rsa_newuser_add"
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p
              style={{
                fontSize: "26px",
                fontWeight: "600",
                color: "rgba(46, 75, 122, 1)",
              }}
            >
              Data Analysis
            </p>{" "}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
              <Button
                variant="contained"
                style={{
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  backgroundColor: tab == 0 ? "rgba(46, 75, 122, 1)" : "white",
                  color: tab == 0 ? "white" : "rgba(46, 75, 122, 1)",
                  height: "40px",
                  // width: "130px",
                }}
                onClick={() => setTab(0)}
              >
                Audit Data
              </Button>
              {showHFAZ && (
                <Button
                  variant="contained"
                  onClick={() => setTab(1)}
                  style={{
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    backgroundColor:
                      tab == 1 ? "rgba(46, 75, 122, 1)" : "white",
                    color: tab == 1 ? "white" : "rgba(46, 75, 122, 1)",
                    height: "40px",
                  }}
                >
                  HFAZ
                </Button>
              )}
              <Button
                variant="contained"
                id={'report_preview_button'}
                onClick={() => {
                  setTab(2);
                  loadAnsImages();
                  populateTeamDetails();
                  populateSalientReport();
                  loadHfazTableReport();
                  getAllSubSection();
                  loadCriticalSection();
                  loadGeneralSection();
                }}
                style={{
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  backgroundColor: tab == 2 ? "rgba(46, 75, 122, 1)" : "white",
                  color: tab == 2 ? "white" : "rgba(46, 75, 122, 1)",
                  height: "40px",
                }}
              >
                Report preview
              </Button>
            </div>
          </div>
          {tab == 0 && (
            <>
              <div
                style={{
                  width: "100%",
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  marginTop: "15px",
                }}
              ></div>

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginTop: "15px",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: "15px" }}>
                  <Button
                    variant="contained"
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      backgroundColor:
                        subtab == 0 ? "rgba(46, 75, 122, 1)" : "white",
                      color: subtab == 0 ? "white" : "rgba(46, 75, 122, 1)",
                      height: "40px",
                      // width: "130px",
                    }}
                    onClick={() => setsubTab(0)}
                  >
                    General Audit Detail
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setsubTab(1)}
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      backgroundColor:
                        subtab == 1 ? "rgba(46, 75, 122, 1)" : "white",
                      color: subtab == 1 ? "white" : "rgba(46, 75, 122, 1)",
                      height: "40px",
                    }}
                  >
                    Section Detail
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setsubTab(2)}
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      backgroundColor:
                        subtab == 2 ? "rgba(46, 75, 122, 1)" : "white",
                      color: subtab == 2 ? "white" : "rgba(46, 75, 122, 1)",
                      height: "40px",
                    }}
                  >
                    Additional Images
                  </Button>
                </div>
                <div>
                  <FormControl sx={{ m: 1, width: "200px" }}>
                    <InputLabel htmlFor="searchString">
                      Search
                    </InputLabel>
                    <OutlinedInput
                      id="searchString"
                      size="medium"
                      startAdornment={
                        <InputAdornment position="start">
                          <SearchIcon style={{ color: "black" }} />
                        </InputAdornment>
                      }
                      label="Search"
                      onChange={() => handleSearch()}
                    />
                  </FormControl>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  marginTop: "15px",
                }}
              ></div>
            </>
          )}
          {tab == 0 && subtab == 0 && (
            <div
              style={{
                marginTop: "15px",
                // height: "80vh",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                borderRadius: "10px",
                padding: "15px 20px",
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                }}
              >
                Start audit detail
              </p>
              <div style={{ marginTop: "15px" }} className="auditor_da_tableDiv">
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                      >
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Start Date & Time
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Weather
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Start Location
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          GPS location
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Chainage (km)
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Photo
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Other entries
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {startRow.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          {" "}
                          <TableCell>
                            {/* start datetime */}
                            {row[0].answer}
                          </TableCell>
                          <TableCell>
                            {/* weather */}
                            {<FormControl style={{ width: "200px" }}>
                              <InputLabel></InputLabel>
                              <Select variant="outlined" defaultValue=""
                                value={row[1].answer}
                                id={row[1].q_id}
                                disabled={!row[1].q_id}
                                onChange={(e) => {
                                  let g = row[1];
                                  g.answer = e.target.value
                                  setStartRow(
                                    startRow.map((item) => {
                                      return item.q_id === g.q_id ? g : item;
                                    })
                                  )
                                }}
                              >
                                {
                                  weather && weather.map((x) =>
                                    <MenuItem key={x} value={x}>{x}</MenuItem>
                                  )
                                }
                              </Select>
                            </FormControl>}
                          </TableCell>
                          <TableCell>
                            {/* start location */}
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row[2].answer}
                              id={row[2].q_id}
                              disabled={!row[2].q_id}
                              onChange={(e) => {
                                let g = row[2];
                                g.answer = e.target.value
                                setStartRow(
                                  startRow.map((item) => {
                                    return item.q_id === g.q_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {/* gps  */}
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row[3].answer}
                              id={row[3].q_id}
                              disabled
                              //disabled={!row[3].q_id}
                              onChange={(e) => {
                                let g = row[3];
                                g.answer = e.target.value
                                setStartRow(
                                  startRow.map((item) => {
                                    return item.q_id === g.q_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {/* chainage */}
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row[4].answer}
                              id={row[4].q_id}
                              disabled={!row[4].q_id}
                              onChange={(e) => {
                                let g = row[4];
                                g.answer = e.target.value
                                setStartRow(
                                  startRow.map((item) => {
                                    return item.q_id === g.q_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          {/* photo api set*/}
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                // justifyContent: "center",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <div>
                                <img
                                  style={{
                                    width: "150px",
                                    height: "150px",
                                    backgroundColor: "white",
                                  }}
                                  src={fetchImageURL(row[5].q_id, 1)}
                                  title={row[5].q_id}
                                />
                              </div>
                              <Button
                                disabled={!row[5].q_id}
                                size="small"
                                style={{
                                  backgroundColor: "white",
                                  color: "rgba(46, 75, 122, 1)",
                                }}
                                onClick={(e) => {
                                  setUploadClicked(true)
                                  document.getElementById("start" + row[5].q_id).click();
                                }}
                                title="Upload the image"
                              >
                                <FileUploadOutlinedIcon /> Upload
                              </Button>
                              <input
                                type="file"
                                //accept="image/*"
                                id={"start" + row[5].q_id}
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  setRowImage(e, row[5].q_id, 1)
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {/* other modal */}
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <VisibilityOutlinedIcon
                                style={{ margin: "auto", cursor: "pointer" }}
                                onClick={() => {
                                  setShowObj(otherStart)
                                  handleOpenOth();
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Button
                    style={{
                      backgroundColor: "rgba(46, 75, 122, 1)",
                      color: "white",
                      marginTop: "15px",
                      // margin: "auto",
                    }}
                    onClick={(e) => {
                      console.log(startRow)
                      handleGeneralData1(startRow[0], endRow[0]);
                    }}
                  >
                    Save General Details
                  </Button>
                </Box>
              </div>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                  marginTop: "15px",
                }}
              >
                End audit detail
              </p>
              <div style={{ marginTop: "15px" }} className="auditor_da_tableDiv">
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                      >
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          End Date & Time
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          End Location
                        </TableCell>

                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          GPS location
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Chainage (km)
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Photo
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Other entries
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {endRow.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          {" "}
                          <TableCell>
                            {/* end datetime */}
                            {row[0].answer}
                          </TableCell>
                          <TableCell>
                            {/* end location */}
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row[1].answer}
                              id={row[1].q_id}
                              disabled={!row[1].q_id}
                              onChange={(e) => {
                                let g = row[1];
                                g.answer = e.target.value
                                setEndRow(
                                  endRow.map((item) => {
                                    return item.q_id === g.q_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {/* gps  */}
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row[2].answer}
                              id={row[2].q_id}
                              disabled={true}
                              onChange={(e) => {
                                let g = row[2];
                                g.answer = e.target.value
                                setEndRow(
                                  endRow.map((item) => {
                                    return item.q_id === g.q_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {/* chainage */}
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row[3].answer}
                              id={row[3].q_id}
                              disabled={!row[3].q_id}
                              onChange={(e) => {
                                let g = row[3];
                                g.answer = e.target.value
                                setEndRow(
                                  endRow.map((item) => {
                                    return item.q_id === g.q_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {/* photo api set*/}
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  // justifyContent: "center",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <div>
                                  <img
                                    style={{
                                      width: "150px",
                                      height: "150px",
                                      backgroundColor: "white",
                                    }}
                                    src={fetchImageURL(row[4].q_id, 1)}
                                    title={row[4].q_id}
                                  />
                                </div>
                                <Button
                                  disabled={!row[4].q_id}
                                  size="small"
                                  style={{
                                    backgroundColor: "white",
                                    color: "rgba(46, 75, 122, 1)",
                                  }}
                                  onClick={(e) => {
                                    document.getElementById("end" + row[4].q_id).click();
                                  }}
                                  title="Upload the image"
                                >
                                  <FileUploadOutlinedIcon /> Upload
                                </Button>
                                <input
                                  type="file"
                                  //accept="image/*"
                                  id={"end" + row[4].q_id}
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    setRowImage(e, row[4].q_id, 1)
                                  }}
                                />
                              </div>
                            </TableCell>
                          </TableCell>
                          <TableCell>
                            {/* other modal */}
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <VisibilityOutlinedIcon
                                style={{ margin: "auto", cursor: "pointer" }}
                                onClick={() => {
                                  setShowObj(otherEnd)
                                  handleOpenOth();
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Button
                    style={{
                      backgroundColor: "rgba(46, 75, 122, 1)",
                      color: "white",
                      marginTop: "15px",
                      // margin: "auto",
                    }}
                    onClick={(e) => {
                      console.log(startRow)
                      handleGeneralData2(startRow[0], endRow[0]);
                    }}
                  >
                    Save General Details
                  </Button>
                </Box>
              </div>
            </div>
          )}
          {tab == 0 && subtab == 1 && (
            <div
              style={{
                marginTop: "15px",
                // height: "80vh",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                borderRadius: "10px",
                padding: "15px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  All Sections
                </p>
                <FormControl style={{ width: "200px" }}>
                  <InputLabel>Section</InputLabel>
                  <Select variant="outlined" defaultValue=""
                    onChange={(e) =>
                      handleSearchSection(e.target.value)
                    }
                    id={"searchSectionString"}
                  >
                    {
                      sectionNames.map((x) => {
                        return (
                          <MenuItem key={x} value={x}>{x}</MenuItem>
                        )
                      })
                    }
                  </Select>
                </FormControl>
              </div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "rgba(46, 75, 122, 1)",
                  marginTop: "15px",
                  marginBottom: "15px",
                }}
              >
              </p>
              {sectionRows.map((x1, index1) => {
                return (
                  <>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "400",
                        color: "rgba(46, 75, 122, 1)",
                        marginTop: "5px",
                        marginBottom: "5px"
                      }}
                    >
                      {chosenSection == '' &&
                        sectionNames[index1]}
                      {chosenSection != '' &&
                        chosenSection}
                    </p>
                    <div className="auditor_da_tableDiv">

                      {/* <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Delete in Report
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                GPS ( Lat/long)
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Chainage (km)
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Road side
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Photo
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Issue
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Suggestion
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Observation Type
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Severity
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Priority
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                Other Entries
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {x1.map((x, index) => {
                              return (
                                <TableRow
                                  key={sectionNames[index1] + x[0].section_count}
                                  sx={{
                                    backgroundColor:
                                      index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                  }}
                                >
                                  
                                  <TableCell>
                                    <FormGroup style={{ fontSize: "10px" }}>
                                      <FormControlLabel
                                        control={<Checkbox
                                          checked={x[11] ? true : false}
                                          onChange={(e) => {
                                            let g = x;
                                            g[11] = (e.target.checked == true) ? true : false
                                            let localCopy = sectionRows
                                            localCopy[index1].map((item, j) => {
                                              return item === x ? g : item
                                            }
                                            )
                                            setSectionRows(localCopy)
                                            setDummy(Math.random())
                                          }} />}
                                        label=""
                                      />
                                    </FormGroup>
                                  </TableCell>
                                 
                                  <TableCell>
                                    <TextField
                                      ref={inputRef}
                                      fullWidth multiline
                                      style={{ width: "200px" }}
                                      variant="outlined"
                                      value={x[0].answer}
                                      id={x[0].question_id}
                                      disabled={!x[0].question_id}
                                      onChange={(e) => {
                                        let g = x[0];
                                        g.answer = e.target.value
                                        let localCopy = sectionRows[index1]
                                        localCopy.map((item, j) => {
                                          return item.question_id === g.question_id ? g : item
                                        }
                                        )
                                        let newCopy = [
                                          ...sectionRows.slice(0, index1),
                                          localCopy,
                                          ...sectionRows.slice(index1 + 1),
                                        ]
                                        //not able to get the focus
                                        //state changes only after setdummy!! 
                                        //setDummy(Math.random())
                                        setSectionRows(newCopy)
                                        window.setTimeout((
                                          focus()
                                        ), 5000)
                                        //e.target.focus()
                                      }}
                                    />
                                  </TableCell>

                                  
                                  <TableCell>
                                    <TextField
                                      fullWidth multiline
                                      style={{ width: "150px" }}
                                      variant="outlined"
                                      value={x[1].answer}
                                      id={x[1].question_id}
                                      disabled={!x[1].question_id}
                                      onChange={(e) => {
                                        let g = x[1];
                                        g.answer = e.target.value
                                        let localCopy = sectionRows
                                        localCopy[index1].map((item, j) => {
                                          return item.question_id === g.question_id ? g : item
                                        }
                                        )
                                        setSectionRows(localCopy)
                                        setDummy(Math.random())
                                      }}
                                    />
                                  </TableCell>

                                  
                                  <TableCell>
                                    <FormControl style={{ width: "200px" }}>
                                      <InputLabel>Road Side</InputLabel>
                                      <Select variant="outlined" defaultValue=""
                                        value={x[2].answer}
                                        id={x[2].question_id}
                                        disabled={!x[2].question_id}
                                        onChange={(e) => {
                                          let g = x[2];
                                          g.answer = e.target.value
                                          let localCopy = sectionRows
                                          localCopy[index1].map((item, j) => {
                                            return item.question_id === g.question_id ? g : item
                                          }
                                          )
                                          setSectionRows(localCopy)
                                          setDummy(Math.random())
                                        }}
                                      >
                                        {
                                          roadsideArray &&
                                          roadsideArray.get(x[2].question_id) &&
                                          roadsideArray.get(x[2].question_id).map((x) =>
                                            <MenuItem key={x} value={x}>{x}</MenuItem>
                                          )
                                        }
                                      </Select>
                                    </FormControl>
                                  </TableCell>

                                  
                                  <TableCell>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        // justifyContent: "center",
                                        alignItems: "center",
                                        gap: "5px",
                                      }}
                                    >
                                      <div>
                                        <img
                                          style={{
                                            width: "150px",
                                            height: "150px",
                                            backgroundColor: "white",
                                          }}
                                          src={fetchImageURL(x[2].question_id, x[2].section_count)}
                                          title={x[3].question_id}
                                        />
                                      </div>
                                      <Button
                                        disabled={!x[3].question_id}
                                        size="small"
                                        style={{
                                          backgroundColor: "white",
                                          color: "rgba(46, 75, 122, 1)",
                                        }}
                                        onClick={(e) => {
                                          document.getElementById(x[3].section_count + x[3].question_id).click();
                                        }}
                                        title="Upload the image"
                                      >
                                        <FileUploadOutlinedIcon /> Upload
                                      </Button>
                                      <input
                                        type="file"
                                        //accept="image/*"
                                        id={x[3].section_count + x[3].question_id}
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                          setRowImage(e, x[3].question_id, x[3].section_count)
                                        }}
                                      />
                                    </div>
                                  </TableCell>

                                


                                  <TableCell>
                                 
                                    {console.log(x[index]?.retrieval_id?.map((itm) => itm?.issues), 'wertgert')}
                                    <p>{x[index]?.retrieval_id?.map((item, index) => (
                                      <div key={index} style={{ marginBottom: '16px' }}>
                                       
                                        <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                                          {Array.isArray(item?.issues) ? (
                                            item.issues.length > 0 ? (
                                              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                                                {item.issues.map((issue, i) => (
                                                  <li key={i} style={{ marginBottom: '4px' }}>
                                                    {issue}
                                                  </li>
                                                ))}
                                              </ul>
                                            ) : (
                                              <em style={{ color: '#757575' }}>No issues</em>
                                            )
                                          ) : (
                                            <p style={{ margin: 0, color: '#555' }}>
                                              {item?.issues || 'No issues available'}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}</p>
                                    {}
                                    <TextField title={"Additional Issues"}
                                      placeholder="Additional Issues"
                                      fullWidth multiline
                                      style={{ width: "200px" }}
                                      variant="outlined"
                                      value={x[13]}
                                      //disabled={!x[5].question_id}
                                      // id={x[index1].section + x[index].section_count + "issue"}
                                      onChange={(e) => {
                                        let localCopy = sectionRows
                                        localCopy[index1][x[index].section_count - 1][13] =
                                          e.target.value
                                        setSectionRows(localCopy)
                                        setDummy(Math.random())
                                      }}
                                    />
                                  </TableCell>

                                 
                                  <TableCell>
                                  
                                    {console.log(x[index]?.retrieval_id?.map((itm) => itm?.suggestions), 'wertgert suggestions')}
                                    <p>{x[index]?.retrieval_id?.map((item, index) => (
                                      <div style={{ marginBottom: '16px' }}>
                                       
                                        <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                                          {Array.isArray(item?.suggestions) ? (
                                            item.suggestions.length > 0 ? (
                                              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                                                {item?.suggestions.map((suggestions, i) => (
                                                  <li key={i} style={{ marginBottom: '4px' }}>
                                                    {suggestions}
                                                    {console.log(suggestions)}
                                                  </li>
                                                ))}
                                              </ul>
                                            ) : (
                                              <em style={{ color: '#757575' }}>No Suggestions</em>
                                            )
                                          ) : (
                                            <p style={{ margin: 0, color: '#555' }}>
                                              {item?.issues || 'No issues available'}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}</p>
                                    <TextField title={"Addional Suggestions"}
                                      placeholder="Additional Suggestions"
                                      fullWidth multiline
                                      style={{ width: "200px" }}
                                      variant="outlined"
                                      value={x[14]}
                                      //disabled={!x[5].question_id}
                                      // id={x[index].section + x[index].section_count + "sugg"}
                                      onChange={(e) => {
                                        let localCopy = sectionRows
                                        localCopy[index1][x[index].section_count - 1][14] =
                                          e.target.value
                                        setSectionRows(localCopy)
                                        setDummy(Math.random())
                                      }}
                                    />
                                  </TableCell>

                                  
                                  <TableCell>
                                    <div>
                                      <FormGroup style={{ fontSize: "10px" }}>
                                        <FormControlLabel
                                          control={<Checkbox
                                            checked={x[6].answer == true ? true : false}
                                            id={x[6].question_id}
                                            disabled={!x[6].question_id}
                                            onChange={(e) => {
                                              let g = x[6];
                                              g.answer = e.target.checked
                                              let localCopy = sectionRows
                                              localCopy[index1].map((item, j) => {
                                                return item[j].question_id === g.question_id ? g : item
                                              }
                                              )
                                              setSectionRows(localCopy)
                                              setDummy(Math.random())
                                            }}
                                          />}
                                          label="Critical observation"
                                        />
                                        <FormControlLabel
                                          control={<Checkbox
                                            checked={x[7].answer == true ? true : false}
                                            id={x[7].question_id}
                                            disabled={!x[7].question_id}
                                            onChange={(e) => {
                                              let g = x[7];
                                              g.answer = e.target.checked
                                              let localCopy = sectionRows
                                              localCopy[index1].map((item, j) => {
                                                return item[j].question_id === g.question_id ? g : item
                                              }
                                              )
                                              setSectionRows(localCopy)
                                              setDummy(Math.random())
                                            }} />}
                                          label="General observation"
                                        />
                                      </FormGroup>
                                    </div>
                                  </TableCell>

                                  
                                  <TableCell>
                                    {
                                      <FormControl style={{ width: "200px" }}>
                                        <InputLabel>Severity</InputLabel>
                                        <Select variant="outlined" defaultValue=""
                                          value={x[8].answer}
                                          id={x[8].question_id}
                                          disabled={!x[8].question_id}
                                          onChange={(e) => {
                                            let g = x[8];
                                            g.answer = e.target.value
                                            let localCopy = sectionRows
                                            localCopy[index1].map((item, j) => {
                                              return item.question_id === g.question_id ? g : item
                                            }
                                            )
                                            setSectionRows(localCopy)
                                            setDummy(Math.random())
                                          }}
                                        >
                                          {
                                            severity &&
                                            severity.get(x[8].question_id) &&
                                            severity.get(x[8].question_id).map((x) =>
                                              <MenuItem key={x} value={x}>{x}</MenuItem>
                                            )
                                          }
                                        </Select>
                                      </FormControl>
                                    }
                                  </TableCell>

                                 
                                  <TableCell>
                                    {
                                      <FormControl style={{ width: "200px" }}>
                                        <InputLabel>Priority</InputLabel>
                                        <Select variant="outlined" defaultValue=""
                                          value={x[9].answer}
                                          id={x[9].question_id}
                                          disabled={!x[9].question_id}
                                          onChange={(e) => {
                                            let g = x[9];
                                            g.answer = e.target.value
                                            let localCopy = sectionRows
                                            localCopy[index1].map((item, j) => {
                                              return item.question_id === g.question_id ? g : item
                                            }
                                            )
                                            setSectionRows(localCopy)
                                            setDummy(Math.random())
                                          }}
                                        >
                                          {
                                            priority &&
                                            priority.get(x[9].question_id) &&
                                            priority.get(x[9].question_id).map((x) =>
                                              <MenuItem key={x} value={x}>{x}</MenuItem>
                                            )
                                          }
                                        </Select>
                                      </FormControl>
                                    }
                                  </TableCell>

                                  
                                  <TableCell style={{}}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <VisibilityOutlinedIcon
                                        style={{ margin: "auto", cursor: "pointer" }}
                                        onClick={() => {
                                          setShowObj(x[10])
                                          handleOpenOth();
                                        }}
                                      />
                                    </Box>
                                  </TableCell>
                                </TableRow>)
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer> */}
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "120px",          // wider for checkbox + label
                                  padding: "12px 8px",
                                }}
                              >
                                Delete in Report
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "180px",          // enough for GPS
                                  padding: "12px 8px",
                                }}
                              >
                                GPS ( Lat/long)
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "140px",          // chainage
                                  padding: "12px 8px",
                                }}
                              >
                                Chainage (km)
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "160px",          // road side dropdown
                                  padding: "12px 8px",
                                }}
                              >
                                Road side
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "180px",          // photo + upload button
                                  padding: "12px 8px",
                                }}
                              >
                                Photo
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "220px",          // issue + additional text
                                  padding: "12px 8px",
                                }}
                              >
                                Issue
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "220px",          // suggestion + additional text
                                  padding: "12px 8px",
                                }}
                              >
                                Suggestion
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "160px",          // observation checkboxes
                                  padding: "12px 8px",
                                }}
                              >
                                Observation Type
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "140px",          // severity dropdown
                                  padding: "12px 8px",
                                }}
                              >
                                Severity
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "140px",          // priority dropdown
                                  padding: "12px 8px",
                                }}
                              >
                                Priority
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  minWidth: "120px",          // other entries icon
                                  padding: "12px 8px",
                                }}
                              >
                                Other Entries
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {x1.map((x, index) => {
                              return (
                                <TableRow
                                  key={sectionNames[index1] + x[0].section_count}
                                  sx={{
                                    backgroundColor: index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                  }}
                                >
                                  {/* Delete in report */}
                                  <TableCell style={{ padding: "12px 8px", textAlign: "center" }}>
                                    <FormGroup style={{ fontSize: "10px" }}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={x[11] ? true : false}
                                            onChange={(e) => {
                                              let g = x;
                                              g[11] = e.target.checked;
                                              let localCopy = sectionRows;
                                              localCopy[index1] = localCopy[index1].map((item) =>
                                                item === x ? g : item
                                              );
                                              setSectionRows(localCopy);
                                              setDummy(Math.random());
                                            }}
                                          />
                                        }
                                        label=""
                                      />
                                    </FormGroup>
                                  </TableCell>

                                  {/* GPS */}
                                  <TableCell style={{ padding: "12px 8px" }}>
                                    <TextField
                                      ref={inputRef}
                                      fullWidth
                                      multiline
                                      style={{ width: "100%", minWidth: "160px" }}
                                      variant="outlined"
                                      value={x[0].answer}
                                      id={x[0].question_id}
                                      disabled={!x[0].question_id}
                                      onChange={(e) => {
                                        let g = x[0];
                                        g.answer = e.target.value;
                                        let localCopy = [...sectionRows];
                                        localCopy[index1] = localCopy[index1].map((item) =>
                                          item.question_id === g.question_id ? g : item
                                        );
                                        setSectionRows(localCopy);
                                        // Removed setDummy here to prevent lag — add back if needed
                                      }}
                                    />
                                  </TableCell>

                                  {/* Chainage */}
                                  <TableCell style={{ padding: "12px 8px" }}>
                                    <TextField
                                      fullWidth
                                      multiline
                                      style={{ width: "100%", minWidth: "120px" }}
                                      variant="outlined"
                                      value={x[1].answer}
                                      id={x[1].question_id}
                                      disabled={!x[1].question_id}
                                      onChange={(e) => {
                                        let g = x[1];
                                        g.answer = e.target.value;
                                        let localCopy = [...sectionRows];
                                        localCopy[index1] = localCopy[index1].map((item) =>
                                          item.question_id === g.question_id ? g : item
                                        );
                                        setSectionRows(localCopy);
                                        setDummy(Math.random());
                                      }}
                                    />
                                  </TableCell>

                                  {/* Road side */}
                                  <TableCell style={{ padding: "12px 8px" }}>
                                    <FormControl style={{ width: "100%", minWidth: "140px" }}>
                                      <InputLabel>Road Side</InputLabel>
                                      <Select
                                        variant="outlined"
                                        value={x[2].answer || ""}
                                        id={x[2].question_id}
                                        disabled={!x[2].question_id}
                                        onChange={(e) => {
                                          let g = x[2];
                                          g.answer = e.target.value;
                                          let localCopy = [...sectionRows];
                                          localCopy[index1] = localCopy[index1].map((item) =>
                                            item.question_id === g.question_id ? g : item
                                          );
                                          setSectionRows(localCopy);
                                          setDummy(Math.random());
                                        }}
                                      >
                                        {roadsideArray?.get(x[2].question_id)?.map((opt) => (
                                          <MenuItem key={opt} value={opt}>
                                            {opt}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </TableCell>

                                  {/* Photo */}
                                  <TableCell style={{ padding: "12px 8px", textAlign: "center" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px",
                                      }}
                                    >
                                      <img
                                        style={{
                                          width: "140px",
                                          height: "140px",
                                          objectFit: "contain",
                                          backgroundColor: "white",
                                          border: "1px solid #ddd",
                                        }}
                                        src={fetchImageURL(x[2].question_id, x[2].section_count)}
                                        title={x[3].question_id}
                                      />
                                      <Button
                                        disabled={!x[3].question_id}
                                        size="small"
                                        style={{
                                          backgroundColor: "white",
                                          color: "rgba(46, 75, 122, 1)",
                                          fontSize: "0.8rem",
                                          padding: "4px 8px",
                                        }}
                                        onClick={() => {
                                          document.getElementById(x[3].section_count + x[3].question_id).click();
                                        }}
                                      >
                                        <FileUploadOutlinedIcon fontSize="small" /> Upload
                                      </Button>
                                      <input
                                        type="file"
                                        id={x[3].section_count + x[3].question_id}
                                        style={{ display: "none" }}
                                        onChange={(e) => setRowImage(e, x[3].question_id, x[3].section_count)}
                                      />
                                    </div>
                                  </TableCell>

                                  {/* Issue */}
                                  <TableCell style={{ padding: "12px 8px", minWidth: "220px" }}>
                                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                      {x[index]?.retrieval_id?.map((item, idx) => (
                                        <div key={idx} style={{ marginBottom: "12px" }}>
                                          <div style={{ marginTop: "6px", paddingLeft: "12px" }}>
                                            {Array.isArray(item?.issues) ? (
                                              item.issues.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: "20px", listStyleType: "disc" }}>
                                                  {item.issues.map((issue, i) => (
                                                    <li key={i} style={{ marginBottom: "4px" }}>
                                                      {issue}
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <em style={{ color: "#757575" }}>No issues</em>
                                              )
                                            ) : (
                                              <p style={{ margin: 0, color: "#555" }}>
                                                {item?.issues || "No issues available"}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <TextField
                                      placeholder="Additional Issues"
                                      fullWidth
                                      multiline
                                      style={{ width: "100%", marginTop: "8px" }}
                                      variant="outlined"
                                      value={x[13] || ""}
                                      onChange={(e) => {
                                        let localCopy = [...sectionRows];
                                        localCopy[index1][x[index].section_count - 1][13] = e.target.value;
                                        setSectionRows(localCopy);
                                        setDummy(Math.random());
                                      }}
                                    />
                                  </TableCell>

                                  {/* Suggestion */}
                                  <TableCell style={{ padding: "12px 8px", minWidth: "220px" }}>
                                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                      {x[index]?.retrieval_id?.map((item, idx) => (
                                        <div key={idx} style={{ marginBottom: "12px" }}>
                                          <div style={{ marginTop: "6px", paddingLeft: "12px" }}>
                                            {Array.isArray(item?.suggestions) ? (
                                              item.suggestions.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: "20px", listStyleType: "disc" }}>
                                                  {item.suggestions.map((sugg, i) => (
                                                    <li key={i} style={{ marginBottom: "4px" }}>
                                                      {sugg}
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <em style={{ color: "#757575" }}>No Suggestions</em>
                                              )
                                            ) : (
                                              <p style={{ margin: 0, color: "#555" }}>
                                                {item?.suggestions || "No suggestions available"}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <TextField
                                      placeholder="Additional Suggestions"
                                      fullWidth
                                      multiline
                                      style={{ width: "100%", marginTop: "8px" }}
                                      variant="outlined"
                                      value={x[14] || ""}
                                      onChange={(e) => {
                                        let localCopy = [...sectionRows];
                                        localCopy[index1][x[index].section_count - 1][14] = e.target.value;
                                        setSectionRows(localCopy);
                                        setDummy(Math.random());
                                      }}
                                    />
                                  </TableCell>

                                  {/* Observation Type */}
                                  <TableCell style={{ padding: "12px 8px", textAlign: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={x[6].answer === true}
                                            id={x[6].question_id}
                                            disabled={!x[6].question_id}
                                            onChange={(e) => {
                                              let g = x[6];
                                              g.answer = e.target.checked;
                                              let localCopy = [...sectionRows];
                                              localCopy[index1] = localCopy[index1].map((item) =>
                                                item.question_id === g.question_id ? g : item
                                              );
                                              setSectionRows(localCopy);
                                              setDummy(Math.random());
                                            }}
                                          />
                                        }
                                        label="Critical"
                                        labelPlacement="end"
                                        style={{ margin: 0 }}
                                      />
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={x[7].answer === true}
                                            id={x[7].question_id}
                                            disabled={!x[7].question_id}
                                            onChange={(e) => {
                                              let g = x[7];
                                              g.answer = e.target.checked;
                                              let localCopy = [...sectionRows];
                                              localCopy[index1] = localCopy[index1].map((item) =>
                                                item.question_id === g.question_id ? g : item
                                              );
                                              setSectionRows(localCopy);
                                              setDummy(Math.random());
                                            }}
                                          />
                                        }
                                        label="General"
                                        labelPlacement="end"
                                        style={{ margin: 0 }}
                                      />
                                    </div>
                                  </TableCell>

                                  {/* Severity */}
                                  <TableCell style={{ padding: "12px 8px" }}>
                                    <FormControl style={{ width: "100%", minWidth: "120px" }}>
                                      <InputLabel>Severity</InputLabel>
                                      <Select
                                        variant="outlined"
                                        value={x[8].answer || ""}
                                        id={x[8].question_id}
                                        disabled={!x[8].question_id}
                                        onChange={(e) => {
                                          let g = x[8];
                                          g.answer = e.target.value;
                                          let localCopy = [...sectionRows];
                                          localCopy[index1] = localCopy[index1].map((item) =>
                                            item.question_id === g.question_id ? g : item
                                          );
                                          setSectionRows(localCopy);
                                          setDummy(Math.random());
                                        }}
                                      >
                                        {severity?.get(x[8].question_id)?.map((opt) => (
                                          <MenuItem key={opt} value={opt}>
                                            {opt}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </TableCell>

                                  {/* Priority */}
                                  <TableCell style={{ padding: "12px 8px" }}>
                                    <FormControl style={{ width: "100%", minWidth: "120px" }}>
                                      <InputLabel>Priority</InputLabel>
                                      <Select
                                        variant="outlined"
                                        value={x[9].answer || ""}
                                        id={x[9].question_id}
                                        disabled={!x[9].question_id}
                                        onChange={(e) => {
                                          let g = x[9];
                                          g.answer = e.target.value;
                                          let localCopy = [...sectionRows];
                                          localCopy[index1] = localCopy[index1].map((item) =>
                                            item.question_id === g.question_id ? g : item
                                          );
                                          setSectionRows(localCopy);
                                          setDummy(Math.random());
                                        }}
                                      >
                                        {priority?.get(x[9].question_id)?.map((opt) => (
                                          <MenuItem key={opt} value={opt}>
                                            {opt}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </TableCell>

                                  {/* Other Entries */}
                                  <TableCell style={{ padding: "12px 8px", textAlign: "center" }}>
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                      <VisibilityOutlinedIcon
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          setShowObj(x[10]);
                                          handleOpenOth();
                                        }}
                                      />
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Box display="flex" justifyContent="center" alignItems="center">
                        <Button
                          style={{
                            backgroundColor: "rgba(46, 75, 122, 1)",
                            color: "white",
                            marginTop: "15px"
                          }}
                          onClick={(e) => {
                            console.log(sectionRows)
                            handleSectionSave(sectionRows[index1])
                          }}
                        >
                          {/* Save {sectionNames[index1]} */}
                          Save this Section
                        </Button>
                      </Box>
                      <br />
                    </div>
                  </>
                )
              })}
              {sectionNames && sectionNames.length > 0 &&
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Button
                    style={{
                      backgroundColor: "rgba(46, 122, 69, 1)",
                      color: "white",
                      marginTop: "15px"
                    }}
                    onClick={(e) => {
                      handleAllSectionSave()
                    }}
                    title="Save all sections"
                  >
                    Save all sections
                  </Button>
                </Box>
              }
            </div>
          )}
          {tab == 0 && subtab == 1 && !showHFAZ && (
            <Box display="flex" justifyContent="center" alignItems="center">
              <p>Save all the sections separately and click for creating HFAZ </p>
              <span>&nbsp;</span>
              <Button
                onClick={handleOpenTwo}
                style={{
                  backgroundColor: "rgba(46, 75, 122, 1)",
                  color: "white",
                  marginTop: "15px",
                  // margin: "auto",
                }}
              >
                Proceed to Report
              </Button>
            </Box>
          )}
          {tab == 0 && subtab == 2 && (
            <div
              style={{
                marginTop: "15px",
                // height: "80vh",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                borderRadius: "10px",
                padding: "15px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <LocCap id={auditID} view={true} />
              </div>
            </div>
          )}
          {/* HFAZ */}
          {tab == 1 && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  style={{
                    marginTop: "20px",
                    fontSize: "22px",
                    fontWeight: "600",
                    color: "rgba(0, 0, 0, 1)",
                  }}
                >
                  High Frequency Accident Zone (HFAZ) Details
                </p>
                {/* <FormControl style={{ width: "200px" }}>
                  <InputLabel>Section</InputLabel>
                  <Select variant="outlined" value={hfazAuditSection} id="audSecHfaz"
                   onChange={(e,c)=>{sethfazAuditSection(e.target.value)
                                    filterHfazList(e,c)}}>
                   {
                      sectionIDList.map((x)=>{
                        return(
                          <MenuItem key={x[0]} name={x[1]} value={x[0]}>{x[1]}</MenuItem>
                        )
                      })
                    }
                  </Select>
                </FormControl> */}
              </div>
              <div
                style={{
                  border: "1px solid rgba(217, 228, 246, 1)",
                  // height: "10vh",
                  borderRadius: "10px",
                  marginTop: "20px",
                  backgroundColor: "#faf8fc",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "15px",
                    // marginTop: "20px",
                  }}
                >
                  <TextField
                    fullWidth
                    label="HFAZ Id"
                    required
                    variant="outlined"
                    value={hfazId}
                    onChange={(e) => sethfazId(e.target.value)}
                  />{" "}
                  <TextField
                    fullWidth
                    label="Start Chainage"
                    required
                    variant="outlined"
                    value={hfazStart}
                    onChange={(e) => sethfazStart(e.target.value)}
                  />{" "}
                  <TextField
                    fullWidth
                    label="End Chainage"
                    required
                    variant="outlined"
                    value={hfazEnd}
                    onChange={(e) => sethfazEnd(e.target.value)}
                  />{" "}
                  <TextField
                    fullWidth
                    label="Landmark"
                    required
                    variant="outlined"
                    value={hfazLM}
                    onChange={(e) => sethfazLM(e.target.value)}
                  />{" "}
                  <TextField
                    fullWidth
                    label="Start GPS"
                    required
                    variant="outlined"
                    value={hfazgpsStart}
                    onChange={(e) => sethfazgpsStart(e.target.value)}
                  />{" "}
                  <TextField
                    fullWidth
                    label="End GPS"
                    required
                    variant="outlined"
                    value={hfazgpsEnd}
                    onChange={(e) => sethfazgpsEnd(e.target.value)}
                  />{" "}
                  <FormControl>
                    <InputLabel>Section</InputLabel>
                    <Select variant="outlined" defaultValue=""
                      value={hfazSection}
                      onChange={(e) => sethfazSection(e.target.value)}>
                      <MenuItem value="Blackspot">Blackspot</MenuItem>
                      <MenuItem value="Emerging Blackspot">Emerging Blackspot</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Stretch Type"
                    required
                    variant="outlined"
                    value={hfazType}
                    onChange={(e) => sethfazType(e.target.value)}
                  />
                </div>
                <Box display="flex" justifyContent="end">
                  <Button
                    style={{
                      backgroundColor: "rgba(46, 75, 122, 1)",
                      color: "white",
                      marginTop: "15px",
                      // margin: "auto",
                    }}
                    onClick={() => handleAddHfaz()}
                  >
                    Add
                  </Button>
                </Box>
              </div>
              <div style={{ marginTop: "25px" }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                      >
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          HFAZ
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Start Chainage
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          End Chainage
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Start GPS
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          End GPS
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          HFAZ Type
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Landmark
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Stretch Type
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hfazList.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>{row.hfaz_id}</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row.start_chainage}
                              onChange={(e) => {
                                let g = row
                                g.start_chainage = e.target.value
                                sethfazList(
                                  hfazList.map((item) => {
                                    return item.hfaz_id === g.hfaz_id ? g : item;
                                  })
                                )
                                sethfazFullList(
                                  hfazFullList.map((item) => {
                                    return item.hfaz_id === g.hfaz_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row.end_chainage}
                              onChange={(e) => {
                                let g = row
                                g.end_chainage = e.target.value
                                sethfazList(
                                  hfazList.map((item) => {
                                    return item.hfaz_id === g.hfaz_id ? g : item;
                                  })
                                )
                                sethfazFullList(
                                  hfazFullList.map((item) => {
                                    return item.hfaz_id === g.hfaz_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row.start_gps}
                              onChange={(e) => {
                                let g = row
                                g.start_gps = e.target.value
                                sethfazList(
                                  hfazList.map((item) => {
                                    return item.hfaz_id === g.hfaz_id ? g : item;
                                  })
                                )
                                sethfazFullList(
                                  hfazFullList.map((item) => {
                                    return item.hfaz_id === g.hfaz_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth multiline
                              variant="outlined"
                              value={row.end_gps}
                              onChange={(e) => {
                                let g = row
                                g.end_gps = e.target.value
                                sethfazList(
                                  hfazList.map((item) => {
                                    return item.hfaz_id === g.hfaz_id ? g : item;
                                  })
                                )
                                sethfazFullList(
                                  hfazFullList.map((item) => {
                                    return item.hfaz_id === g.hfaz_id ? g : item;
                                  })
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>{row.hfaz_section}</TableCell>
                          <TableCell>{row.landmark}</TableCell>
                          <TableCell>{row.stretch_type}</TableCell>
                          <TableCell>
                            {
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {" "}
                                <Button
                                  style={{
                                    border: "1px solid rgba(46, 75, 122, 0.3)",
                                    color: "rgba(46, 75, 122, 1)",
                                    marginTop: "15px",
                                    // margin: "auto",
                                  }}
                                  onClick={() => handleView(row)}
                                >
                                  View
                                </Button>{" "}
                              </div>
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    style={{
                      backgroundColor: "rgba(46, 75, 122, 1)",
                      color: "white",
                      marginTop: "20px",
                      // margin: "auto",
                    }}
                    onClick={() => saveHfazEdit()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Section 1 starts here */}
          {tab == 2 && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "none" }}>{dummy}</div>
              <p style={{ fontSize: "22px", fontWeight: "600" }}>
                Road Safety Survey & Audit Report
              </p>{" "}
              {/* <p style={{ fontSize: "22px", fontWeight: "600" }}>
                Section Name
              </p>{" "} */}
              {editMode == false && <>
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      width: "100%", display: "flex",
                      gap: "10px",
                      // height: "20vh",
                      //borderRadius: "10px",
                      flexDirection: "column",
                      // justifyContent: "space-between",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20PX",
                      }}
                    >
                      <p style={{ fontSize: "22px", fontWeight: "600" }}>
                        Front Page Details
                      </p>
                      {/* <Button
                      style={{
                        backgroundColor: "rgba(46, 75, 122, 1)",
                        color: "white",
                      }}
                    >
                      Edit
                    </Button> */}
                    </div>
                    <div style={{ display: "flex" }}>
                      <div style={{
                        display: "flex"
                      }}>
                        <img
                          className="roundImage"
                          style={{
                            width: "100px",
                            height: "100px",
                            backgroundColor: "white",
                            backgroundImage: imageList &&
                              imageList["titleLeft"] && imageList["titleLeft"].url1,
                          }}
                          src={imageList && imageList["titleLeft"] &&
                            imageList["titleLeft"].url1}
                          alt={""}
                        />
                        <Button
                          onClick={(e) => {
                            document.getElementById("titleLeft").click();
                          }}
                        >
                          {" "}
                          Upload logo for left header
                        </Button>
                        <input
                          type="file"
                          //accept="image/*"
                          id={"titleLeft"}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            let image1 = e.target.files[0]
                            let url1 = URL.createObjectURL(e.target.files[0]);
                            //need to save as this 
                            let fname1 = "titleLeft.jpg"; //e.target.files[0].name;

                            imageList["titleLeft"] = { image1, url1, fname1 }
                            setDummy(Math.random())
                          }}
                        />
                      </div>
                      <div style={{
                        display: "flex"
                      }}>
                        <img
                          className="roundImage"
                          style={{
                            width: "100px",
                            height: "100px",
                            backgroundColor: "white",
                            backgroundImage: imageList &&
                              imageList["titleRight"] && imageList["titleRight"].url1,
                          }}
                          src={imageList && imageList["titleRight"] &&
                            imageList["titleRight"].url1}
                          alt={""}
                        />
                        <Button
                          onClick={(e) => {
                            document.getElementById("titleRight").click();
                          }}
                        >
                          {" "}
                          Upload logo for right header
                        </Button>
                        <input
                          type="file"
                          //accept="image/*"
                          id={"titleRight"}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            let image1 = e.target.files[0]
                            let url1 = URL.createObjectURL(e.target.files[0]);
                            //need to save as this 
                            let fname1 = "titleRight.jpg"; //e.target.files[0].name;

                            imageList["titleRight"] = { image1, url1, fname1 }
                            setDummy(Math.random())
                          }}
                        />
                      </div>
                    </div>
                    <TextField
                      fullWidth
                      id="title_report"
                      rows={7}
                      placeholder="Please enter the title of the report here"
                      value={title_report}
                      variant="outlined"
                      onChange={(e) => {
                        setreport(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <TextField
                      fullWidth
                      id="title_sub_report"
                      rows={7}
                      placeholder="Please enter the sub-title of the report here"
                      value={title_sub_report}
                      variant="outlined"
                      onChange={(e) => {
                        setsubreport(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <div style={{
                      display: "flex"
                    }}>
                      <img
                        className="roundImage"
                        style={{
                          width: "200px",
                          height: "200px",
                          backgroundColor: "white",
                          backgroundImage: imageList &&
                            imageList["titleLogo"] && imageList["titleLogo"].url1,
                        }}
                        src={imageList && imageList["titleLogo"] &&
                          imageList["titleLogo"].url1}
                        alt={""}
                      />
                      <Button
                        onClick={(e) => {
                          document.getElementById("titleLogo").click();
                        }}
                      >
                        {" "}
                        Upload logo for Front Page
                      </Button>
                      <input
                        type="file"
                        //accept="image/*"
                        id={"titleLogo"}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          let image1 = e.target.files[0]
                          let url1 = URL.createObjectURL(e.target.files[0]);
                          //need to save as this 
                          let fname1 = "titleLogo.jpg"; //e.target.files[0].name;

                          imageList["titleLogo"] = { image1, url1, fname1 }
                          setDummy(Math.random())
                        }}
                      />
                    </div>
                    <TextField
                      fullWidth
                      id="title_name"
                      rows={7}
                      placeholder="Please enter the name here"
                      value={title_name}
                      variant="outlined"
                      onChange={(e) => {
                        setname(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <TextField
                      fullWidth
                      id="title_company_name"
                      rows={7}
                      placeholder="Please enter the company name here"
                      value={title_company_name}
                      variant="outlined"
                      onChange={(e) => {
                        setcompany(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <TextField
                      fullWidth
                      id="title_address"
                      rows={7}
                      placeholder="Please enter the address here"
                      value={title_address}
                      variant="outlined"
                      onChange={(e) => {
                        setaddress(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <TextField
                      fullWidth
                      id="title_contact"
                      rows={7}
                      placeholder="Please enter the contact here"
                      value={title_contact}
                      variant="outlined"
                      onChange={(e) => {
                        setcontact(e.target.value)
                        setDummy(Math.random())
                      }}
                    />

                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      width: "100%",
                      // height: "20vh",
                      borderRadius: "10px",
                      // display: "flex",
                      // justifyContent: "space-between",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20PX",
                      }}
                    >
                      <p style={{ fontSize: "22px", fontWeight: "600" }}>
                        Executive Summary
                      </p>
                      {/* <Button
                      style={{
                        backgroundColor: "rgba(46, 75, 122, 1)",
                        color: "white",
                      }}
                    >
                      Edit
                    </Button> */}
                    </div>
                    <TextField
                      fullWidth
                      multiline
                      id="exec_summary"
                      rows={7}
                      placeholder="Please enter the executive summary here"
                      variant="outlined"
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20PX",
                    marginTop: "20PX",
                  }}
                >
                  <p style={{ fontSize: "22px", fontWeight: "600" }}>
                    1 .Background
                  </p>
                  {/* <Button
                  style={{
                    backgroundColor: "rgba(46, 75, 122, 1)",
                    color: "white",
                  }}
                >
                  Edit
                </Button> */}
                </div>
                <div
                  style={{
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    width: "100%",
                    // height: "20vh",
                    borderRadius: "10px",
                    // display: "flex",
                    // justifyContent: "space-between",
                    padding: "20px",
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={7}
                    id="bkg_summary"
                    placeholder="Background details"
                    variant="outlined"
                  />
                  {/* <div style={{ paddingLeft: "10px", marginTop: "15px" }}>
                  <TextField
                    size="small "
                    style={{ width: "250px" }}
                    variant="outlined"
                  />
                </div> */}
                  <div style={{ marginTop: "25px" }}>
                    <TableContainer component={Paper}>
                      <Table id="bgAccidentDetails">
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                          >
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Year
                            </TableCell>

                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Total Nos. of Accidents
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Fatalities
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Persons Injured
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[1, 1, 1, 1, 1].map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                backgroundColor:
                                  index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                              }}
                            >
                              <TableCell>
                                {
                                  <TextField
                                    size="small "
                                    style={{ width: "250px" }}
                                    variant="outlined"
                                  />
                                }
                              </TableCell>
                              <TableCell>
                                {
                                  <TextField
                                    size="small "
                                    style={{ width: "250px" }}
                                    variant="outlined"
                                  />
                                }
                              </TableCell>
                              <TableCell>
                                {
                                  <TextField
                                    size="small "
                                    style={{ width: "250px" }}
                                    variant="outlined"
                                  />
                                }
                              </TableCell>
                              <TableCell>
                                {
                                  <TextField
                                    size="small "
                                    style={{ width: "250px" }}
                                    variant="outlined"
                                  />
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                  <br />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    1.1 Project Details
                  </p>
                  <TextField
                    // style={{ marginTop: "25px" }}
                    fullWidth
                    size="small "
                    style={{
                      // width: "250px",
                      marginTop: "25px",
                      display: "block",
                      // paddingLeft: "10px",
                    }}
                    multiline
                    rows={3}
                    id="proj_details"
                    placeholder="The Road Safety Survey & Audit is undertaken for reducing road accidents and fatalities in the State of <State Name> by <Organisation Name> with the help of the Ministry of Road Transport and Highways (MoRTH), NHAI, and the State Government."
                    variant="outlined"
                  />
                  <br />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    1.2 Audit Team
                  </p>
                  <div style={{ marginTop: "25px" }}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                          >
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Sl. No.
                            </TableCell>

                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Name
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Designation
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Email id
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {teamNames.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                backgroundColor:
                                  index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                              }}
                            >
                              <TableCell>
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                {
                                  row.auditor
                                }
                              </TableCell>
                              <TableCell>
                                {
                                  row.designation
                                }
                              </TableCell>
                              <TableCell>
                                {
                                  row.email
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <br />
                    <p style={{ fontSize: "18px", fontWeight: "600" }}>
                      1.3 Salient Features of Road Stretch
                    </p>
                  </div>
                  <br />
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    Table 2: Stretch Details {salient.road_number}
                    {/* Nothing to post from this table */}
                  </p>
                  <p style={{
                    display: "none"
                  }}>{dummy}</p>
                  <TableContainer component={Paper} style={{ marginTop: "25px" }}>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                        >
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            General Details
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Name of the Road</p>
                              <p>{salient.name_of_road}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Number of Road</p>
                              <p>{salient.road_number}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>District</p>
                              <p>{salient.district}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Section of Road Audited</p>
                              <p>{salient.stretch_name}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Type of road</p>
                              <p>{salient.road_type}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Road owning Agency</p>
                              <p>{salient.road_owning_agency}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Carriageway Width (m)</p>
                              <p>{salient.carriageway_width}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Shoulder Type</p>
                              <p>{salient.shoulder_type}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 !== 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Start Chainage (km)</p>
                              <p>{salient.chainage_start}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 !== 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>End Chainage (km)</p>
                              <p>{salient.chainage_end}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 == 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Length of Road Audited (km)</p>
                              <p>{salient.stretch_length}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 !== 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Land Use Pattern</p>
                              <p>{salient.landuse_pattern && salient.landuse_pattern[0]}</p>
                            </div>
                          </TableCell>
                        </TableRow> */}
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 == 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Type of Terrain</p>
                              <p>{salient.terrain_type}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 !== 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Pavement Type</p>
                              <p>{salient.pavement_type}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 == 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <img
                                  src={fetchImageURLSalient("start")} alt="chainage &start"
                                  style={{ width: "375PX", height: "280PX" }}
                                />
                                <p style={{ fontSize: "14px", fontWeight: 500 }}>
                                  {salient.chainage_start}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <img
                                  src={fetchImageURLSalient("end")} alt="chainage &end"
                                  style={{ width: "375PX", height: "280PX" }}
                                />
                                <p style={{ fontSize: "14px", fontWeight: 500 }}>
                                  {salient.chainage_end}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: "rgba(178, 205, 249, 1)",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                              }}
                            >
                              <p>Exhibit 1. {salient.location_start}(Start location)</p>
                              <p>Exhibit 2. {salient.location_end}(End location)</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <br />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    1.4 Accident Data (Location Specific)
                  </p>
                  <TextField
                    fullWidth
                    size="small "
                    style={{
                      marginTop: "25px",
                      display: "block",
                    }}
                    multiline
                    rows={3}
                    id="accident_data"
                    placeholder="The Road Safety Survey & Audit is undertaken for reducing road accidents and fatalities in the State of <State Name> by <Organisation Name> with the help of the Ministry of Road Transport and Highways (MoRTH), NHAI, and the State Government."
                    variant="outlined"
                  />
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "600",
                      marginTop: "25px",
                    }}
                  >
                    Table 3: Summary of Accident Statistics
                  </p>{" "}
                  <TableContainer component={Paper} style={{ marginTop: "25px" }}>
                    <Table id="summaryAccidentStats">
                      {/* <TableHead></TableHead> */}
                      <TableBody>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>
                                Nos. of Blackspots as per 2015 MoRTH definition
                              </p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="bs_report"
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Nos. of Emerging Blackspots</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="ebs_report"
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Nos. of Blackspots as per IRC:131-2022</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="bs_irc_report"
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Vehicle Count involved in Crashes</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="veh_count_report"
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Passenger Count involved in Crashes</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="pass_count_report"
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Pedestrian Count involved in Crashes</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="ped_count_report"
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <br />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    1.5 Opportunities for Improvement
                  </p>
                  <TextField
                    fullWidth
                    size="small "
                    style={{
                      marginTop: "25px",
                      display: "block",
                    }}
                    multiline
                    rows={3}
                    id="opportunities"
                    placeholder="type here for the Opportunities for Improvement"
                    variant="outlined"
                  />
                </div>
              </>}
              {editMode == true && <>
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      width: "100%", display: "flex", gap: "10px",
                      // height: "20vh",
                      borderRadius: "10px", flexDirection: "column",
                      // justifyContent: "space-between",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20PX",
                      }}
                    >
                      <p style={{ fontSize: "22px", fontWeight: "600" }}>
                        Front Page Details
                      </p>
                      {/* <Button
                      style={{
                        backgroundColor: "rgba(46, 75, 122, 1)",
                        color: "white",
                      }}
                    >
                      Edit
                    </Button> */}
                    </div>
                    <div style={{ display: "flex" }}>
                      <div style={{
                        display: "flex"
                      }}>
                        <img
                          style={{
                            width: "100px",
                            height: "100px",
                            backgroundColor: "white",
                            backgroundImage: imageList &&
                              imageList["titleLeft"] && imageList["titleLeft"].url1,
                          }}
                          className="roundImage"
                          src={imageList && imageList["titleLeft"] &&
                            imageList["titleLeft"].url1}
                          alt={""}
                        />
                        <Button
                          onClick={(e) => {
                            document.getElementById("titleLeft").click();
                          }}
                        >
                          {" "}
                          Upload logo for left header
                        </Button>
                        <input
                          type="file"
                          //accept="image/*"
                          id={"titleLeft"}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            let image1 = e.target.files[0]
                            let url1 = URL.createObjectURL(e.target.files[0]);
                            //need to save as this 
                            let fname1 = "titleLeft.jpg"; //e.target.files[0].name;

                            imageList["titleLeft"] = { image1, url1, fname1 }
                            setDummy(Math.random())
                          }}
                        />
                      </div>
                      <div style={{
                        display: "flex"
                      }}>
                        <img
                          style={{
                            width: "100px",
                            height: "100px",
                            backgroundColor: "white",
                            backgroundImage: imageList &&
                              imageList["titleRight"] && imageList["titleRight"].url1,
                          }}
                          className="roundImage"
                          src={imageList && imageList["titleRight"] &&
                            imageList["titleRight"].url1}
                          alt={""}
                        />
                        <Button
                          onClick={(e) => {
                            document.getElementById("titleRight").click();
                          }}
                        >
                          {" "}
                          Upload logo for right header
                        </Button>
                        <input
                          type="file"
                          //accept="image/*"
                          id={"titleRight"}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            let image1 = e.target.files[0]
                            let url1 = URL.createObjectURL(e.target.files[0]);
                            //need to save as this 
                            let fname1 = "titleRight.jpg"; //e.target.files[0].name;

                            imageList["titleRight"] = { image1, url1, fname1 }
                            setDummy(Math.random())
                          }}
                        />
                      </div>
                    </div>
                    <TextField
                      fullWidth
                      id="title_report"
                      rows={7}
                      placeholder="Please enter the title of the report here"
                      value={title_report}
                      variant="outlined"
                      onChange={(e) => {
                        setreport(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <TextField
                      fullWidth
                      id="title_sub_report"
                      rows={7}
                      placeholder="Please enter the sub-title of the report here"
                      value={title_sub_report}
                      variant="outlined"
                      onChange={(e) => {
                        setsubreport(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <div style={{
                      display: "flex"
                    }}>
                      <img
                        style={{
                          width: "200px",
                          height: "200px",
                          backgroundColor: "white",
                          backgroundImage: imageList &&
                            imageList["titleLogo"] && imageList["titleLogo"].url1,
                        }}
                        className="roundImage"
                        src={imageList && imageList["titleLogo"] &&
                          imageList["titleLogo"].url1}
                        alt={""}
                      />
                      <Button
                        onClick={(e) => {
                          document.getElementById("titleLogo").click();
                        }}
                      >
                        {" "}
                        Upload logo for Front Page
                      </Button>
                      <input
                        type="file"
                        //accept="image/*"
                        id={"titleLogo"}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          let image1 = e.target.files[0]
                          let url1 = URL.createObjectURL(e.target.files[0]);
                          //need to save as this 
                          let fname1 = "titleLogo.jpg"; //e.target.files[0].name;

                          imageList["titleLogo"] = { image1, url1, fname1 }
                          setDummy(Math.random())
                        }}
                      />
                    </div>
                    <TextField
                      fullWidth
                      id="title_name"
                      rows={7}
                      placeholder="Please enter the name here"
                      value={title_name}
                      variant="outlined"
                      onChange={(e) => {
                        setname(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <TextField
                      fullWidth
                      id="title_company_name"
                      rows={7}
                      placeholder="Please enter the company name here"
                      value={title_company_name}
                      variant="outlined"
                      onChange={(e) => {
                        setcompany(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <TextField
                      fullWidth
                      id="title_address"
                      rows={7}
                      placeholder="Please enter the address here"
                      value={title_address}
                      variant="outlined"
                      onChange={(e) => {
                        setaddress(e.target.value)
                        setDummy(Math.random())
                      }}
                    />
                    <TextField
                      fullWidth
                      id="title_contact"
                      rows={7}
                      placeholder="Please enter the contact here"
                      value={title_contact}
                      variant="outlined"
                      onChange={(e) => {
                        setcontact(e.target.value)
                        setDummy(Math.random())
                      }}
                    />

                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      width: "100%",
                      // height: "20vh",
                      borderRadius: "10px",
                      // display: "flex",
                      // justifyContent: "space-between",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20PX",
                      }}
                    >
                      <p style={{ fontSize: "22px", fontWeight: "600" }}>
                        Executive Summary
                      </p>
                      {/* <Button
                        style={{
                          backgroundColor: "rgba(46, 75, 122, 1)",
                          color: "white",
                        }}
                      >
                        Edit
                      </Button> */}
                    </div>
                    <TextField
                      fullWidth
                      multiline
                      id="exec_summary"
                      rows={7}
                      value={contentReport.background.exec_summary}
                      variant="outlined"
                      onChange={(e) => {
                        contentReport.background.exec_summary
                          = e.target.value
                        setDummy(Math.random())
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20PX",
                    marginTop: "20PX",
                  }}
                >
                  <p style={{ fontSize: "22px", fontWeight: "600" }}>
                    1 .Background
                  </p>
                  {/* <Button
                    style={{
                      backgroundColor: "rgba(46, 75, 122, 1)",
                      color: "white",
                    }}
                  >
                    Edit
                  </Button> */}
                </div>
                <div
                  style={{
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    width: "100%",
                    // height: "20vh",
                    borderRadius: "10px",
                    // display: "flex",
                    // justifyContent: "space-between",
                    padding: "20px",
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={7}
                    id="bkg_summary"
                    value={contentReport.background.bkg_summary}
                    variant="outlined"
                    onChange={(e) => {
                      contentReport.background.bkg_summary = e.target.value
                      setDummy(Math.random())
                    }}
                  />
                  {/* <div style={{ paddingLeft: "10px", marginTop: "15px" }}>
                    <TextField
                      size="small "
                      style={{ width: "250px" }}
                      variant="outlined"
                    />
                  </div> */}
                  <div style={{ marginTop: "25px" }}>
                    <TableContainer component={Paper}>
                      <Table id="bgAccidentDetails">
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                          >
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Year
                            </TableCell>

                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Total Nos. of Accidents
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Fatalities
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Persons Injured
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.values(contentReport.background.bgAccidentDetails).map((row, index) => (
                            index < 5 &&
                            <TableRow
                              key={index}
                              sx={{
                                backgroundColor: index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                              }}
                            >
                              <TableCell style={{ textAlign: "center" }}>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  value={row[0]}
                                  onChange={(e) => {
                                    Object.values(contentReport.background.bgAccidentDetails)[index][0]
                                      = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  value={row[1]}
                                  onChange={(e) => {
                                    Object.values(contentReport.background.bgAccidentDetails)[index][1]
                                      = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  value={row[2]}
                                  onChange={(e) => {
                                    Object.values(contentReport.background.bgAccidentDetails)[index][2]
                                      = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  value={row[3]}
                                  onChange={(e) => {
                                    Object.values(contentReport.background.bgAccidentDetails)[index][3]
                                      = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                  <br />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    1.1 Project Details
                  </p>
                  <TextField
                    // style={{ marginTop: "25px" }}
                    fullWidth
                    size="small "
                    style={{
                      // width: "250px",
                      marginTop: "25px",
                      display: "block",
                      // paddingLeft: "10px",
                    }}
                    multiline
                    rows={3}
                    id="proj_details"
                    value={contentReport.background.proj_details}
                    variant="outlined"
                    onChange={(e) => {
                      contentReport.background.proj_details = e.target.value
                      setDummy(Math.random())
                    }}
                  />
                  <br />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    1.2 Audit Team
                  </p>
                  <div style={{ marginTop: "25px" }}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                          >
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Sl. No.
                            </TableCell>

                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Name
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Designation
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Email id
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {teamNames.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                backgroundColor:
                                  index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                              }}
                            >
                              <TableCell>
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                {
                                  row.auditor
                                }
                              </TableCell>
                              <TableCell>
                                {
                                  row.designation
                                }
                              </TableCell>
                              <TableCell>
                                {
                                  row.email
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <br />
                    <p style={{ fontSize: "18px", fontWeight: "600" }}>
                      1.3 Salient Features of Road Stretch
                    </p>
                  </div>
                  <br />
                  {salient != [] &&
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      Table 2: Stretch Details {salient.road_number}
                      {/* Nothing to post from this table */}
                    </p>}
                  {salient != [] &&
                    <TableContainer component={Paper} style={{ marginTop: "25px" }}>
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                          >
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              General Details
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Name of the Road</p>
                                <p>{salient.name_of_road}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Number of Road</p>
                                <p>{salient.road_number}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>District</p>
                                <p>{salient.district}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Section of Road Audited</p>
                                <p>{""}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Type of road</p>
                                <p>{""}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Road owning Agency</p>
                                <p>{salient.road_owning_agency}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Carriageway Width (m)</p>
                                <p>{""}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Shoulder Type</p>
                                <p>{""}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 !== 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Start Chainage (km)</p>
                                <p>{salient.chainage_start}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 !== 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>End Chainage (km)</p>
                                <p>{salient.chainage_end}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 == 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Length of Road Audited (km)</p>
                                <p>{salient.stretch_length}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 !== 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Land Use Pattern</p>
                                <p>{""}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 == 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Type of Terrain</p>
                                <p>{""}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 !== 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p>Pavement Type</p>
                                <p>{""}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: 2 % 2 == 0 ? "#f2f4f7" : "#ffffff",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-around",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                  }}
                                >
                                  <img
                                    src={fetchImageURLSalient("start")} alt="chainage start"
                                    style={{ width: "375PX", height: "280PX" }}
                                  />
                                  <p style={{ fontSize: "14px", fontWeight: 500 }}>
                                    {salient.chainage_start}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                  }}
                                >
                                  <img
                                    src={fetchImageURLSalient("end")} alt="chainage end"
                                    style={{ width: "375PX", height: "280PX" }}
                                  />
                                  <p style={{ fontSize: "14px", fontWeight: 500 }}>
                                    {salient.chainage_end}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            // key={index}
                            sx={{
                              backgroundColor: "rgba(178, 205, 249, 1)",
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-around",
                                }}
                              >
                                <p>Exhibit 1. Start Location of Audit</p>
                                <p>Exhibit 2. End Location of Audit</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>}
                  <br />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    1.4 Accident Data (Location Specific)
                  </p>
                  <TextField
                    fullWidth
                    size="small "
                    style={{
                      marginTop: "25px",
                      display: "block",
                    }}
                    multiline
                    rows={3}
                    id="accident_data"
                    value={contentReport.background.acc_summary}
                    variant="outlined"
                    onChange={(e) => {
                      contentReport.background.acc_summary = e.target.value
                      setDummy(Math.random())
                    }}
                  />
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "600",
                      marginTop: "25px",
                    }}
                  >
                    Table 3: Summary of Accident Statistics
                  </p>{" "}
                  <TableContainer component={Paper} style={{ marginTop: "25px" }}>
                    <Table id="summaryAccidentStats">
                      {/* <TableHead></TableHead> */}
                      <TableBody>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>
                                Nos. of Blackspots as per 2015 MoRTH definition
                              </p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="bs_report"
                                  value={contentReport.background.acc_data_table.bs}
                                  onChange={(e) => {
                                    contentReport.background.acc_data_table.bs = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Nos. of Emerging Blackspots</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="ebs_report"
                                  value={contentReport.background.acc_data_table.ebs}
                                  onChange={(e) => {
                                    contentReport.background.acc_data_table.ebs = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Nos. of Blackspots as per IRC:131-2022</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="bs_irc_report"
                                  value={contentReport.background.acc_data_table.bs_irc}
                                  onChange={(e) => {
                                    contentReport.background.acc_data_table.bs_irc = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Vehicle Count involved in Crashes</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="veh_count_report"
                                  value={contentReport.background.acc_data_table.veh_count_report}
                                  onChange={(e) => {
                                    contentReport.background.acc_data_table.veh_count_report = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Passenger Count involved in Crashes</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="pass_count_report"
                                  value={contentReport.background.acc_data_table.pass_count_report}
                                  onChange={(e) => {
                                    contentReport.background.acc_data_table.pass_count_report = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          // key={index}
                          sx={{
                            backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <p>Pedestrian Count involved in Crashes</p>
                              <p>
                                <TextField
                                  size="small "
                                  style={{ width: "250px" }}
                                  variant="outlined"
                                  id="ped_count_report"
                                  value={contentReport.background.acc_data_table.ped_count_report}
                                  onChange={(e) => {
                                    contentReport.background.acc_data_table.ped_count_report = e.target.value
                                    setDummy(Math.random())
                                  }}
                                />
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <br />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    1.5 Opportunities for Improvement
                  </p>
                  <TextField
                    fullWidth
                    size="small "
                    style={{
                      marginTop: "25px",
                      display: "block",
                    }}
                    multiline
                    rows={3}
                    id="opportunities"
                    value={contentReport.background.opportunities}
                    onChange={(e) => {
                      contentReport.background.opportunities = e.target.value
                      setDummy(Math.random())
                    }}
                    variant="outlined"
                  />
                </div>
              </>}
              {/* Section 1 ends here */}

              {/* Section 2 starts here */}
              {hfazReport.length > 0 && hfazReport != {} &&
                <>
                  <p
                    style={{
                      fontSize: "22px",
                      fontWeight: "600",
                      marginTop: "20px",
                    }}
                  >
                    2 .High Frequency Accident Zone (HFAZ)
                  </p>
                  <div
                    style={{
                      marginTop: "20px",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      width: "100%",
                      borderRadius: "10px",
                      padding: "20px",
                    }}
                  >
                    <p
                      style={{
                        color: "rgba(46, 75, 122, 1)",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      Table 4: HFAZ Details (Chainage, GPS Coordinates, Landmark and
                      Type)
                    </p>
                    <TableContainer component={Paper} style={{ marginTop: "25px" }}>
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                          >
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              HFAZ No.
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Chainage Start
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Chainage End
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              GPS Start
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              GPS End
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              HFAZ Type
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Stretch Type
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Landmark
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {hfazReport.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                backgroundColor:
                                  index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                              }}
                            >
                              <TableCell>{row.hfaz_id}</TableCell>
                              <TableCell>
                                {row.start_chainage}
                              </TableCell>
                              <TableCell>
                                {row.end_chainage}
                              </TableCell>
                              <TableCell>
                                {row.start_gps}
                              </TableCell>
                              <TableCell>
                                {row.end_gps}
                              </TableCell>
                              <TableCell>
                                {row.hfaz_section}
                              </TableCell>
                              <TableCell>
                                {row.stretch_type}
                              </TableCell>
                              <TableCell>
                                {row.land_mark}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {hfazReport.map((row, index) => (
                      <>
                        <p
                          style={{
                            color: "black",
                            fontSize: "20px",
                            fontWeight: "600",
                            marginTop: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          {index + 1} High Frequency Accident Zone{" "}
                          {row.hfaz_section}{" "}
                          {row.hfaz_id}:{" "}{row.landmark}
                        </p>
                        <div
                          style={{
                            border: "1px solid rgba(127, 163, 222, 0.3)",
                            width: "100%",
                            marginTop: "20px",
                          }}
                        >
                          <div style={{ display: "flex" }}>
                            <table
                              style={{
                                border: "0.91px solid rgba(127, 163, 222, 0.3)",
                              }}
                              className="table_preview_report"
                            >
                              <tr className="table_row_rsa">
                                <td rowspan="2" className="table_row_td">
                                  GPS
                                </td>
                                <td className="table_row_td">Start</td>
                                <td className="table_row_td">{row.start_gps}</td>
                              </tr>
                              <tr className="table_row_rsa">
                                <td className="table_row_td">End</td>
                                <td className="table_row_td">{row.end_gps}</td>
                              </tr>
                              <tr className="table_row_rsa">
                                <td colspan="1" className="table_row_td">
                                  Risk (Severity)
                                </td>
                                <td colspan="2" className="table_row_td">
                                  <TextField
                                    size="small"
                                    style={{
                                      width: "250px",
                                    }}
                                    label="Severity" id={index + "hfazSeverity"}
                                    variant="outlined"
                                  />
                                </td>
                              </tr>
                            </table>
                            {/* table teo */}
                            <table
                              style={{
                                border: "0.91px solid rgba(127, 163, 222, 0.3)",
                              }}
                              className="table_preview_report"
                            >
                              <tr className="table_row_rsa">
                                <td rowspan="2" className="table_row_td">
                                  Chainage
                                </td>
                                <td className="table_row_td">Start</td>
                                <td className="table_row_td">
                                  {row.start_chainage.replace(".", "+")}</td>
                              </tr>
                              <tr className="table_row_rsa">
                                <td className="table_row_td">End</td>
                                <td className="table_row_td">
                                  {row.end_chainage.replace(".", "+")}</td>
                              </tr>
                              <tr className="table_row_rsa">
                                <td colspan="1" className="table_row_td">
                                  Priority
                                </td>
                                <td colspan="2" className="table_row_td">
                                  <TextField
                                    size="small"
                                    style={{
                                      width: "250px",
                                    }}
                                    id={index + "hfazPriority"}
                                    label="Priority"
                                    variant="outlined"
                                  />
                                </td>
                              </tr>
                            </table>
                          </div>
                          <div style={{ padding: "20px" }}>
                            <p
                              style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              Description:{" "}
                              <TextField
                                id={index + "hfazDescription"}
                                size="small"
                                style={{
                                  width: "450px",
                                }}
                                label="Description about the stretch"
                                variant="outlined"
                              />
                            </p>
                            <p
                              style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "20px",
                              }}
                            >
                              Accident data:
                            </p>
                            <TableContainer
                              component={Paper}
                              style={{ marginTop: "25px" }}
                            >
                              {/** hfaz acc data table */}
                              <Table id={index + "hfazAccDataTable"}>
                                <TableHead>
                                  <TableRow
                                    sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                                  >
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      Year
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        label="Year 1"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        label="Year 2"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        label="Year 3"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow
                                    // key={index}
                                    sx={{
                                      backgroundColor:
                                        1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                    }}
                                  >
                                    <TableCell>No. of Accidents</TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                    >
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                  </TableRow>
                                  <TableRow
                                    // key={index}
                                    sx={{
                                      backgroundColor:
                                        2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                    }}
                                  >
                                    <TableCell>No. of Fatalities</TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        style={{
                                          width: "250px",
                                          backgroundColor: "white",
                                        }}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {/* issues table */}
                            <p
                              style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "20px",
                              }}
                            >
                              Issues Table:
                            </p>
                            <TableContainer
                              component={Paper}
                              style={{ marginTop: "25px" }}
                            >
                              <Table>
                                <TableHead>
                                  <TableRow
                                    sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                                  >
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      Section
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      Issues
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      Section
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      Issues
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {
                                    hfazIssuesPerHfaz && hfazIssuesPerHfaz[row.hfaz_id] &&
                                    Object.entries(hfazIssuesPerHfaz[row.hfaz_id]).map(([k, v]) =>

                                      v.map((i, j) => (
                                        j < (v.length / 2) && <TableRow
                                          // key={index}
                                          sx={{
                                            backgroundColor:
                                              j % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                          }}
                                        >
                                          <TableCell>{k}
                                          </TableCell>
                                          <TableCell>{j == 1 ? v[2] : v[j * j]}
                                          </TableCell>
                                          <TableCell>{k}
                                          </TableCell>
                                          <TableCell>{j == 1 ? v[3] : v[(j * j) + 1]}
                                          </TableCell>
                                        </TableRow>
                                      )))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </div>
                        </div>
                        {/* /** all sections per hfaz_id */}

                        {hfazViewRowsReports && hfazViewRowsReports[row.hfaz_id] &&
                          hfazViewRowsReports[row.hfaz_id].map((ii, j) => (
                            //{[1,1].map(()=>(
                            <><p
                              style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "20PX",
                              }}
                            >
                              {index + 1}.1:{hfazViewNamesReports[row.hfaz_id][j]}
                            </p>
                              {subSection[hfazViewNamesReports[row.hfaz_id][j]] &&
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginTop: "20PX",
                                  }}
                                >
                                  {index + 1}.1.1: {subSection[hfazViewNamesReports[row.hfaz_id][j]]}
                                </p>
                              }
                              <TableContainer component={Paper} style={{ marginTop: "25px" }}>
                                <Table id={index + "hfazSectionTable"}>
                                  <TableHead>
                                    <TableRow
                                      sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                                    >
                                      <TableCell
                                        sx={{
                                          color: "white",
                                          fontWeight: "bold",
                                          textAlign: "center",
                                        }}
                                      >
                                        No
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          color: "white",
                                          fontWeight: "bold",
                                          textAlign: "center",
                                        }}
                                      >
                                        Location
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          color: "white",
                                          fontWeight: "bold",
                                          textAlign: "center",
                                        }}
                                      >
                                        Image
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          color: "white",
                                          fontWeight: "bold",
                                          textAlign: "center",
                                        }}
                                      >
                                        Issue
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          color: "white",
                                          fontWeight: "bold",
                                          textAlign: "center",
                                        }}
                                      >
                                        Suggestion
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {ii.map((row1, index1) => (
                                      <TableRow
                                        key={index1}
                                        sx={{
                                          backgroundColor:
                                            index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                        }}
                                      >
                                        <TableCell>{index1 + 1}</TableCell>
                                        <TableCell>
                                          {
                                            <div
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "10px",
                                              }}
                                            >
                                              <span>{row1[1] && row1[1].answer}</span>
                                              <span>{row1[2] && row1[2].answer}</span>
                                              <span>{row1[0] && row1[0].answer}</span>
                                            </div>
                                          }
                                        </TableCell>
                                        <TableCell>
                                          <img
                                            src={row1[3] && fetchImageURL(row1[3].question_id, row1[3].section_count)}
                                            title={row1[3] && row1[3].question_id}
                                            //src="#" alt={row1[3].answer}
                                            style={{ width: "205px", height: "136px" }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {row1[4] && row1[4].answer}
                                        </TableCell>
                                        <TableCell>
                                          {row1[5] && row1[5].answer}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>

                            </>))}
                      </>))}

                    {/* /** all sections per hfaz_id */}

                  </div>
                </>
              }
              {/* Section 2 ends here */}

              {criticalSection.length > 0 && <p
                style={{ fontSize: "24px", fontWeight: 600, marginTop: "25px" }}
              >
                Critical Observation
              </p>}
              {criticalSection != [] && console.log(criticalSection)}
              {criticalSection && criticalSection.map((i1, j1) => (
                <>
                  <p style={{
                    display: "none"
                  }}>{dummy}</p>
                  {/* Critical observation per section starts here */}
                  <div
                    style={{
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      width: "100%",
                      borderRadius: "10px",
                      padding: "20px",
                      marginTop: "20px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "20PX",
                      }}
                    >
                      {j1 + 1}:{criticalNames[j1]}
                      <br />
                      {subSection[criticalNames[j1]] &&
                        <span>{j1 + 1}.1.1: {subSection[criticalNames[j1]]}</span>}
                    </p>
                    <TableContainer component={Paper} style={{ marginTop: "25px" }}>
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                          >
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              No
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Location
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Image
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Issue
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Suggestion
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {i1.map((row1, index) => (

                            <TableRow
                              key={index}
                              sx={{
                                backgroundColor:
                                  index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                              }}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                {
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <span>{row1[1] && row1[1].answer}</span>
                                    <span>{row1[2] && row1[2].answer}</span>
                                    <span>{row1[0] && row1[0].answer}</span>
                                  </div>
                                }
                              </TableCell>
                              <TableCell>
                                <img
                                  src={row1[3] &&
                                    fetchImageURL(row1[3].question_id, row1[3].section_count)}
                                  title={row1[3] && row1[3].question_id}
                                  //src="#" alt={row1[3].answer}
                                  style={{ width: "205px", height: "136px" }}
                                />
                              </TableCell>
                              {/* <TableCell>{console.log(row1)}
                                {row1.retrieval_id[0].issues}
                              </TableCell> */}





                              <TableCell>
                                {/* <span>{x[5]}</span><br /> */}
                                {console.log(row1[0]?.retrieval_id?.map((itm) => itm?.issues), 'wertgert report')}
                                <p>{row1[0]?.retrieval_id?.map((item, index) => (
                                  <div key={index} style={{ marginBottom: '16px' }}>
                                    {/* Show retrieval_id */}
                                    {/* <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                          {item?.retrieval_id || '—'}
                                        </div> */}

                                    {/* Map over issues array */}
                                    <div style={{ marginTop: '8px', paddingLeft: '16px' }}>

                                      {console.log(row1[index])}
                                      {Array.isArray(item?.issues) ? (
                                        item.issues.length > 0 ? (
                                          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                                            {item.issues.map((issue, i) => (
                                              <li key={i} style={{ marginBottom: '4px' }}>
                                                {issue}

                                              </li>
                                            ))}

                                          </ul>



                                        ) : (
                                          <em style={{ color: '#757575' }}>No issues</em>
                                        )
                                      ) : (
                                        <p style={{ margin: 0, color: '#555' }}>
                                          {item?.issues || 'No issues available'}
                                        </p>
                                      )}


                                    </div>
                                  </div>
                                ))}</p>


                                {/* {row1[index]?.new_issue != null && <p>Additional Issues</p>} */}
                                {row1[0]?.new_issue != null && <p>{row1[0]?.new_issue?.map((item, index) => (
                                  <div key={index} style={{ marginBottom: '16px' }}>
                                    {/* Show retrieval_id */}
                                    {/* <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                          {item?.retrieval_id || '—'}
                                        </div> */}

                                    {/* Map over issues array */}
                                    <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                                      <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                                        <li key={0} style={{ marginBottom: '4px' }}>
                                          {item}
                                        </li>

                                      </ul>

                                    </div>
                                  </div>
                                ))}</p>}


                              </TableCell>

                              <TableCell>
                                {/* <span>{x[5]}</span><br /> */}
                                {console.log(row1[index]?.retrieval_id?.map((itm) => itm?.suggestions), 'wertgert suggestions')}
                                <p>{row1[0]?.retrieval_id?.map((item, index) => (
                                  <div key={0} style={{ marginBottom: '16px' }}>
                                    {/* Show retrieval_id */}
                                    {/* <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                          {item?.retrieval_id || '—'}
                                        </div> */}

                                    {/* Map over issues array */}
                                    <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                                      {Array.isArray(item?.suggestions) ? (
                                        item.suggestions.length > 0 ? (
                                          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                                            {item.suggestions.map((suggestions, i) => (
                                              <li key={i} style={{ marginBottom: '4px' }}>
                                                {suggestions}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <em style={{ color: '#757575' }}>No Suggestions</em>
                                        )
                                      ) : (
                                        <p style={{ margin: 0, color: '#555' }}>
                                          {item?.issues || 'No issues available'}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}</p>

                                {/* {row1[index]?.new_suggestion != null && <p>Additional Suggesstions</p>} */}
                                {row1[0]?.new_suggestion != null && <p>{row1[0]?.new_suggestion?.map((item, index) => (
                                  <div key={0} style={{ marginBottom: '16px' }}>
                                    {/* Show retrieval_id */}
                                    {/* <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                          {item?.retrieval_id || '—'}
                                        </div> */}

                                    {/* Map over issues array */}
                                    <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                                      <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                                        <li key={index} style={{ marginBottom: '4px' }}>
                                          {item}
                                        </li>

                                      </ul>

                                    </div>
                                  </div>
                                ))}</p>}

                              </TableCell>

                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </>))}


              {generalSection.length > 0 && <p
                style={{ fontSize: "24px", fontWeight: 600, marginTop: "25px" }}
              >
                General Observation
              </p>}
              {/* <p>dont touch start but old response format</p>
              {generalSection.map((i1,j1) =>{
                //console.log(i1)
                //console.log(j1)
                console.log(j1 + generalNames[j1])
                return(<>
                {j1+1} : {generalNames[j1]}
                {i1.map((i2,j2)=>{
                  //console.log(Object.keys(i2)) //issue list
                  //console.log(j2) //loop count
                  {Object.keys(i2).map((i3,j3)=>{
                    console.log(i3); //issue name
                    <span>i3 + issue name</span>
                    //console.log(Object.values(i2))
                    {Object.values(i2)[j3].map((i4,j4)=>{
                      //console.log(i4)
                      {Object.values(i4).map((i5,j5)=>{
                        //console.log(i5);
                        console.log(Object.keys(i4)[j5]) //travel name
                        {Object.values(i5).map((i6,j6)=>{
                          //console.log(i6)
                          console.log(Object.values(i6))                          
                        })}
                      })}
                    })
                    }
                  })}
                })
                }
                </>)})}
              <p>dont touch end</p>*/}

              {/* {generalSection.map((i1,j1) =>{
                //console.log(i1)
                //console.log(j1)
                console.log(generalNames[j1])
                return(<>
                <br/>
                {j1+1} : {generalNames[j1]}
                {i1.map((i2,j2)=>{
                  //console.log(Object.keys(i2)) //issue list
                  //console.log(j2) //loop count
                  return(<><br/>
                  {Object.keys(i2).map((i3,j3)=>(
                    //issue name
                    <>
                    <span>{i3}</span>
                    {
                      Object.values(i2)[j3].map((i4,j4)=>(
                      //console.log(i4)
                      
                        Object.values(i4).map((i5,j5)=>(
                        //console.log(i5);
                        //console.log(Object.keys(i5)) //travel list
                        <>
                        <p>{Object.keys(i4)[j5]}</p>{
                        Object.values(i5).map((i6,j6)=>(
                          <p>{i6.chainage + i6.gps_location}</p>
                          //console.log(i6)
                          //console.log(Object.values(i6))
                          // Object.values(i6).map((i7,j7)=>(
                          //   <p>{i7[0] + i7[1]}</p>
                          // ))
                        ))}</>
                      ))
                    ))
                    }
                    </>
                ))}</>)
                })
                }
                </>)})} */}

              <br />

              {generalSection.length > 0 && generalSection.map((i2, j1) => {
                return (<>
                  <br />
                  {j1 + 1}: {generalNames[j1]}

                  {/* {i1.map((i2, j2) => (
                    <> */}
                  {Object.keys(i2).map((i3, j3) => (
                    <>
                      <table className="table_general_observation">
                        <tr className="tr_general_observation">
                          <th className="th_general_observation">S.No</th>
                          <th className="th_general_observation">
                            Safety Concerns & Audit Findings
                          </th>
                          <th className="th_general_observation">Suggestions</th>
                        </tr>
                        <tr className="tr_general_observation">
                          <td className="th_general_observation">1</td>
                          <td className="th_general_observation">
                            {getIssueHere(i2, i3, j3)}
                          </td>
                          <td className="th_general_observation" rowSpan={2}>
                            {getSuggestionHere(i2, i3, j3)}
                          </td>
                        </tr>
                        <tr className="tr_general_observation">
                          <td className="th_general_observation">2</td>
                          <td className="th_general_observation">
                            <p
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "16px",
                              }}
                            >
                              Total Number of Points/ Locations:
                              {i2[i3].length}
                            </p>
                          </td>
                        </tr>
                        <tr className="tr_general_observation">
                          <td className="th_general_observation" colSpan={3}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              {generalNames[j1] + " : " + i3}
                            </div>
                            {/* Table to populate chainage values */}
                            <TableContainer
                              component={Paper}
                              style={{ marginTop: "25px" }}
                            >
                              <Table>
                                <TableHead>
                                  <TableRow
                                    sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                                  >
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      Chainage
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      Lat/ Long
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                {Object.values(i2[i3]).map((i4, j) => (
                                  <TableBody>
                                    <TableRow
                                      // key={index}
                                      sx={{
                                        backgroundColor:
                                          1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                      }}
                                    >
                                      <TableCell>
                                        {i4.chainage}
                                      </TableCell>
                                      <TableCell>
                                        {i4.gps_location}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                ))}
                              </Table>
                            </TableContainer>
                          </td>
                        </tr>



                        {/* <tr className="tr_general_observation">
                              <td className="th_general_observation" colSpan={3}>
                                <div style={{ display: "none", gap: "10px" }}>
                                  {i3} //issue name not needed
                                </div>
                                {
                                  Object.values(i2)[j3].map((i4, j4) => (
                                    Object.values(i4).map((i5, j5) => (
                                      <>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                          Road Side:{Object.keys(i4)[j5]}
                                        </div>
                                        {
                                          Object.values(i5).map((i6, j6) => (
                                            <>
                                              <TableContainer
                                                component={Paper}
                                                style={{ marginTop: "25px" }}
                                              >
                                                <Table>
                                                  <TableHead>
                                                    <TableRow
                                                      sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}
                                                    >
                                                      <TableCell
                                                        sx={{
                                                          color: "white",
                                                          fontWeight: "bold",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Chainage
                                                      </TableCell>
                                                      <TableCell
                                                        sx={{
                                                          color: "white",
                                                          fontWeight: "bold",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Lat/ Long
                                                      </TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    <TableRow
                                                      // key={index}
                                                      sx={{
                                                        backgroundColor:
                                                          1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                                      }}
                                                    >
                                                      <TableCell>
                                                        {i6.chainage}
                                                      </TableCell>
                                                      <TableCell>
                                                        {i6.gps_location}
                                                      </TableCell>
                                                    </TableRow>
                                                  </TableBody>
                                                </Table>
                                              </TableContainer>
                                              <br />
                                            </>
                                          ))}</>
                                    ))
                                  ))
                                }
                              </td>
                            </tr> */}

                      </table>
                    </>
                  ))}
                  {/* </>
                  )) 
                  }*/}
                </>)
              })}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "25px",
                }}
              >
                <Button
                  style={{
                    backgroundColor: "rgba(46, 75, 122, 1)",
                    color: "white",
                  }}
                  onClick={() => titleValidations()}
                >
                  Save Report
                </Button>
                {/* <input
                      type="file"
                      //accept="kml"
                      id="addUpload"
                      onChange={(e) => uploadImage(e)}
                /> */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ?modal */}
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
                Report Confirmation
              </Typography>
            </div>
            <small>
              Are you want to create a separate section for high frequency
              accident zone (HFAZ)
            </small>
            <div
              style={{ display: "flex", justifyContent: "end", gap: "10px" }}
            >
              <Button
                variant="contained"
                color="primary"
                size="mediyum"
                style={{
                  backgroundColor: "rgb(46, 75, 122)",
                  color: "white",
                  marginTop: "15px",
                }}
                onClick={() => {
                  handleCloseTwo();
                  setHfazAPI(true)
                  setTab(1)
                  showHFAZ(true)
                }}
              >
                Yes
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="mediyum"
                style={{
                  backgroundColor: "white",
                  color: "rgb(46, 75, 122)",
                  marginTop: "15px",
                }}
                onClick={() => {
                  document.getElementById("report_preview_button").click()
                  handleCloseTwo();
                }}
              >
                No
              </Button>
            </div>
          </Box>
        </Modal>
      </div>

      {/** modal to show other Objects */}
      <Modal
        open={openOther}
        //onClose={handleCloseOth}
        disableEscapeKeyDown
        disableBackdropClick
      >
        <Box
          style={style}
          sx={{
            backgroundColor: "white",
            padding: "20PX",
            height: "auto !important",
          }}
        >
          <p
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Other Entries
          </p>
          <div
            style={{
              marginTop: "15px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                border: "1px solid rgba(127, 163, 222, 0.3)",
                width: "95%",
                // height: "40vh",
                borderRadius: "10px",
                padding: "15px",
                fontSize: "14px",
                color: "rgba(46, 75, 122, 0.8)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {
                showObj.map((x) => {
                  return (
                    <p> {x.question}: {x.answer} </p>
                  )
                })
              }
            </div>
          </div>
          <Box style={{ display: "flex", justifyContent: "end" }}>
            <Button variant="contained" onClick={() => handleCloseOth()}>Close</Button>
          </Box>
        </Box>
      </Modal>

      {/** modal to show hfaz view => all section tables */}
      <Modal
        open={openHfazView}
        //onClose={handleCloseHfaz}
        disableEscapeKeyDown
        disableBackdropClick
      >
        <Box
          style={style1}
          sx={{
            backgroundColor: "white",
            padding: "20PX",
            height: "auto !important",
            maxHeight: "600px",
            maxWidth: "90%"
          }}
        >
          <p
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Hfaz view Data
          </p>
          {/* Table here */}
          {hfazViewRows.map((x1, index1) => {
            return (<>
              {hfazViewNames[index1]}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        GPS ( Lat/long)
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Chainage (km)
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Road side
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Photo
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Issue
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Suggestion
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Observation Type
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Severity
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Priority
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {x1.map((x, index) => {
                      return (
                        <TableRow
                          key={hfazViewNames[index1] + Math.random()}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                          }}
                        >
                          {/* gps */}
                          <TableCell>
                            {x[0].answer}
                          </TableCell>

                          {/* chainage */}
                          <TableCell>
                            {x[1].answer}
                          </TableCell>

                          {/* road side */}
                          <TableCell>
                            {x[2].answer}
                          </TableCell>

                          {/* photo */}
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                // justifyContent: "center",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <div>
                                <img
                                  style={{
                                    width: "150px",
                                    height: "150px",
                                    backgroundColor: "white",
                                  }}
                                  src={fetchImageURL(x[3].question_id, x[3].section_count)}
                                  title={x[3].question_id}
                                />
                              </div>
                            </div>
                          </TableCell>

                          {/* issue */}
                          <TableCell>
                            {x[4].answer}
                          </TableCell>

                          {/* suggestion */}
                          <TableCell>
                            {x[5].answer}
                          </TableCell>

                          {/* observation x[index][6].answer and x[index][7].answer */}
                          <TableCell>
                            <div>
                              <FormGroup style={{ fontSize: "10px" }}>
                                <FormControlLabel
                                  control={<Checkbox
                                    checked={x[6].answer == true ? true : false}
                                    id={x[6].question_id}
                                    disabled
                                  />}
                                  label="Critical observation"
                                />
                                <FormControlLabel
                                  control={<Checkbox
                                    checked={x[7].answer == true ? true : false}
                                    id={x[7].question_id}
                                    disabled />}
                                  label="General observation"
                                />
                              </FormGroup>
                            </div>
                          </TableCell>

                          {/* severity */}
                          <TableCell>
                            {x[8].answer}
                          </TableCell>

                          {/* priority */}
                          <TableCell>
                            {x[9].answer}
                          </TableCell>
                        </TableRow>)
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
            )
          })}
          <div
            style={{
              marginTop: "15px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" onClick={handleCloseHfaz}>Close</Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default AuditorData;
