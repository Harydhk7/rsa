import React, { useEffect, useState, useRef } from "react";
import AEHeader from "../AEHeader/AEHeader";
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
import AE_FinalReport from "./AE_FinalReport";
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

function AE_DataAnalysis() {
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

    // CHECK HERE FOR THE IMAGE UPDATION
    let image = fetchImage(sdata[5].q_id, 1)

       
    if (image && isUploadClicked ===  true) {
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


       
    if (image && isUploadClicked ===  true) {
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
                if (index1 == 0) l6 = element.suggestion;
                else l6 = l6 + " , " + element.suggestion;
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

        // 15 ae approval
        m1 = -1;
        t1 = element[0].ae_approval;
        let t2 = false;
        if (t1 == "approve") {
          m1 = 0; t2 = true;
          l11.push(t2)
        }
        if (m1 == -1) l11.push("")

        // 16 ae comments
        m1 = -1;
        t1 = element[0].ae_comments;
        if (t1) {
          m1 = 0;
          l11.push(t1)
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
          genReport()
        } else {
          setIsload(false);
        }
      })
      .catch((error) => {
        setIsload(false);
      });
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
          setCriticalNames(a[1])
          setCriticalSection(a[0])
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


        //5. risk, severity
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("severity")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push("")

        // 6. priority
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("priority")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push("")

        //7. ae reponse
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question) {
            let t1 = element[index]
            if (t1.ae_approval && t1.ae_status) {
              m1 = index;
              l11.push(t1.ae_approval + "$" + t1.ae_status);
              break;
            }
          }
        }
        if (m1 == -1) l11.push("")
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
      for (let index = 0; index < element.length; index++) {
        const data = element[index];
        if (data && data != {}) {
          if (sectionRowId == "") sectionRowId = data.section_id
          if (sectionRowNo == "") sectionRowNo = data.section_count
        }
      }
      setIsload(true);

      let n1 = ""
      try {
        n1 = document.getElementById(element[0].section +
          element[0].section_count + "ae_approval").checked
        n1 = (n1 == true) ? "approve" : "reject";
      } catch (error) {
        n1 = ""
      }
      let n11 = ""
      try {
        n11 = document.getElementById(element[0].section +
          element[0].section_count + "ae_comments").value
      } catch (error) {
        n11 = ""
      }


      let fD = {
        "audit_id": auditID,
        "userid": localStorage.getItem("rsaLogged"),
        "section_id": sectionRowId,
        "sec_count": sectionRowNo,
        "approval": n1,
        "comments": n11
      }

      setIsload(true);
      AxiosApp.post(url1 + "ae_approval", fD)
        .then((response) => {
          setIsload(false);
          if (response.data.statusCode == "200") {
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
  const handleSectionSaveOLD = (sectionToSave) => {
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
            formData.append(data.question_id + ".jpg", image);
            a1[data.question_id] = "Image"
            a1["file_name"] = [data.question_id + ".jpg"]
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
      formData.append("live_gps", gpsLive)
      setIsload(true);
      AxiosApp.post(url1 + "answer_edit", formData, config)
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
      <AEHeader /> <p style={{
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
          {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p
              style={{
                fontSize: "26px",
                fontWeight: "600",
                color: "rgba(46, 75, 122, 1)",
              }}
            >
              Data Analysis
            </p>{" "}
          </div> */}
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
                Audit Data Response
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
                  // loadAnsImages();
                  // populateTeamDetails();
                  // populateSalientReport();
                  // loadHfazTableReport();
                  // getAllSubSection();
                  // loadCriticalSection();
                  // loadGeneralSection();
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
                  {/* <Button
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
                  </Button> */}
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
                            {row[1].answer}
                            {/* {<FormControl style={{ width: "200px" }}>
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
                            </FormControl>} */}
                          </TableCell>
                          <TableCell>
                            {/* start location */}
                            {row[2].answer}
                            {/* <TextField
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
                            />*/}
                          </TableCell>
                          <TableCell>
                            {/* gps  */}
                            {row[3].answer}
                            {/* <TextField
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
                            /> */}
                          </TableCell>
                          <TableCell>
                            {/* chainage */}
                            {row[4].answer}
                            {/* <TextField
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
                            /> */}
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
                              {/* <Button
                                disabled={!row[5].q_id}
                                size="small"
                                style={{
                                  backgroundColor: "white",
                                  color: "rgba(46, 75, 122, 1)",
                                }}
                                onClick={(e) => {
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
                              /> */}
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
                            {row[1].answer}
                            {/* <TextField
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
                            /> */}
                          </TableCell>
                          <TableCell>
                            {/* gps  */}
                            {row[2].answer}
                            {/* <TextField
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
                            /> */}
                          </TableCell>
                          <TableCell>
                            {/* chainage */}
                            {row[3].answer}
                            {/* <TextField
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
                            /> */}
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
                                {/* <Button
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
                                /> */}
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
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                AE Approval
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                AE Comments
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
                                  {/** delete in report x[11]*/}
                                  <TableCell>
                                    <FormGroup style={{ fontSize: "10px" }}>
                                      <FormControlLabel
                                        control={<Checkbox
                                          checked={x[11] ? true : false}
                                          disabled
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
                                  {/* gps */}
                                  <TableCell>
                                    {x[0].answer}
                                    {/* <TextField
                                      ref={inputRef}
                                      fullWidth multiline
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
                                    /> */}
                                  </TableCell>

                                  {/* chainage */}
                                  <TableCell>
                                    {x[1].answer}
                                    {/* <TextField
                                      fullWidth multiline
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
                                    /> */}
                                  </TableCell>

                                  {/* road side */}
                                  <TableCell>
                                    {x[2].answer}
                                    {/* <FormControl style={{ width: "200px" }}>
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
                                    </FormControl> */}
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
                                          src={fetchImageURL(x[2].question_id, x[2].section_count)}
                                          title={x[3].question_id}
                                        />
                                      </div>
                                      {/* <Button
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
                                      /> */}
                                    </div>
                                  </TableCell>

                                  {/* issue */}
                                  <TableCell>
                                    <span>{x[4].answer}</span><br />
                                    <span>{x[12]}</span><br />
                                    {/* <TextField title={"Addional Issues"}
                                      fullWidth multiline
                                      variant="outlined"
                                      value={x[12]}
                                      //disabled={!x[4].question_id}
                                      id={x[0].section + x[0].section_count + "issue"}
                                      onChange={(e) => {
                                        let localCopy = sectionRows
                                        localCopy[index1][x[0].section_count - 1][12] =
                                          e.target.value
                                        setSectionRows(localCopy)
                                        setDummy(Math.random())
                                      }}
                                    /> */}
                                  </TableCell>

                                  {/* suggestion */}
                                  <TableCell>
                                    <span>{x[5]}</span><br />
                                    <span>{x[13]}</span><br />
                                    {/* <TextField title={"Addional Suggestions"}
                                      fullWidth multiline
                                      variant="outlined"
                                      value={x[13]}
                                      //disabled={!x[5].question_id}
                                      id={x[0].section + x[0].section_count + "sugg"}
                                      onChange={(e) => {
                                        let localCopy = sectionRows
                                        localCopy[index1][x[0].section_count - 1][13] =
                                          e.target.value
                                        setSectionRows(localCopy)
                                        setDummy(Math.random())
                                      }}
                                    /> */}
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
                                            //disabled={!x[6].question_id}
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
                                            //disabled={!x[7].question_id}
                                            disabled
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

                                  {/* severity */}
                                  <TableCell>
                                    {x[8].answer}
                                    {/* {
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
                                    } */}
                                  </TableCell>

                                  {/* priority */}
                                  <TableCell>
                                    {x[9].answer}
                                    {/* {
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
                                    } */}
                                  </TableCell>

                                  {/* other  x[10]*/}
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

                                  { /** ae approval */}
                                  <TableCell>
                                    <FormControlLabel
                                      control={<Checkbox
                                        checked={x[14] ? true : false}
                                        id={x[0].section + x[0].section_count + "ae_approval"}
                                        //disabled={!x[6].question_id}
                                        onChange={(e) => {
                                          let localCopy = sectionRows
                                          localCopy[index1][x[0].section_count - 1][14] =
                                            e.target.checked
                                          setSectionRows(localCopy)
                                          setDummy(Math.random())
                                        }}
                                      />}
                                      label="Approve"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField title={"Comments"}
                                      fullWidth multiline
                                      variant="outlined"
                                      value={x[15]}
                                      //disabled={!x[5].question_id}
                                      id={x[0].section + x[0].section_count + "ae_comments"}
                                      onChange={(e) => {
                                        let localCopy = sectionRows
                                        localCopy[index1][x[0].section_count - 1][15] =
                                          e.target.value
                                        setSectionRows(localCopy)
                                        setDummy(Math.random())
                                      }} />
                                  </TableCell>
                                </TableRow>)
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
          {/* {tab == 0 && subtab == 1 && !showHFAZ && (
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
          )} */}
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
            <AE_FinalReport aid={auditID} atid={auditTypeID} />
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

export default AE_DataAnalysis;
