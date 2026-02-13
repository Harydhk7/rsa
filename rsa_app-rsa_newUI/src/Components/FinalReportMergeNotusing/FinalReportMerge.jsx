import React, { useEffect, useState, useRef } from "react";
// import "./FinalReportMerge.css";
import AxiosApp from "../../common/AxiosApp";
import { url1 } from "../../App";
import { useReactToPrint } from "react-to-print";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
//import Html2Pdf from "html2pdf.js"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import iitmlogo from "../../Assets/iitlogo.png";
import JSZip from 'jszip';
import noImage from '../../Assets/noImage.png';
var imageFileSource = new Map()
var imageSource = new Map()
var contentReport1 = {
background: {"exec_summary":"executive summary",
  "bkg_summary":"background details",
  "proj_details":"project details type here",
  "bgAccidentDetails":
  {"row1":["2010","8","88","888"],
    "row2":["2011","8","9","9"],
    "row3":["2012","44","66","77"],
    "row4":["2019","87","77","55"],
    "row5":["2020","67","8",""],
    "col_names":["year","total_acc","fatalities","injured"]},
  "acc_summary":"ksdjfhksdjfhksjdhfksjdhfksjdhfkjsdf",
  "acc_data_table":{"bs":"89","ebs":"99","bs_irc":"77",
    "veh_count_report":"44","pass_count_report":"66","ped_count_report":"45"},
    "opportunities":"any opportunities for improvement",
    "hfazDetails":
    {"HFAZ0193":{"description":"HFAZ0193: sda","severity":"high","priority":"high1",
      "accTable":[["Year","2010","2011"],["No. of Accidents","7","77"],
      ["No. of Fatalities","8","9"]]},
    "HFAZ0008":{"description":"HFAZ0008: sda","severity":"sev1","priority":"p1",
      "accTable":[["Year","2010","2011"],["No. of Accidents","1","2"],
      ["No. of Fatalities","4","5"]]}}},
hfaz_data: ["HFAZ0193","HFAZ0008"],
audit_id: "Audit06595",
auditor_id: "user17237"}

var contentReport = {};
var auditID = "";
var auditTypeID = "";

function FinalReportMerge() {
  const pdfRef = useRef(); // Initialize ref
  const navigate = useNavigate();
  const {state} = useLocation();
  auditID = state.sid;
  
  const [filename, setFilename] = useState("");
  const [fileImage, setFileImage] = useState("");
  const [fileURL, setFileURL] = useState(""); 
   //get the suggestion to print
   const getSuggestionHere = (object, issue, index) => {
    let l1 = "";
    let l11 = ""
    try {
      l1 = object[issue][0].issues;
      if (l1.length > 0) {
        for (let index = 0; index < l1.length; index++) {
          const element = l1[index];
          if(index == 0){
            l11 = element.suggestion
          } else {
            l11 = l11 + ","+ element.suggestion
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
          if(index == 0){
            l11 = element.issue
          } else {
            l11 = l11 + ","+ element.issue
          }
        }
      }
    } catch (error) {

    }
    return l11;
  }
  const uploadImage = (e) => {
    setFileImage(e.target.files[0]);
    setFileURL(URL.createObjectURL(e.target.files[0]));
    setFilename(e.target.files[0].name);
  };
  const submitPDF = (x,y) =>{
    let f1 = new FormData();
    f1.append("audit_id",auditID)
    f1.append("approval","submit")
    f1.append("file_name",y)
    f1.append("submitted_on",new Date().toISOString().slice(0, 10).split('-').reverse().join('-'))
    f1.append(y,x)
    const config = {     
      headers: { 'content-type': 'multipart/form-data' }
    }
    AxiosApp.post(url1 + "report_approval", f1)
    .then((response) => {
        if (response.data.statusCode == "200") {
        console.log(response.data);
        navigate(-1)
        }
    })
    .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
        navigate(-1)
    }); 

  }
  //not called
  const generatePDF = useReactToPrint({
    content: () => pdfRef.current,
    copyStyles: true,
    onPrintError: (error,c) => console.log(c,error),
		print: async (printIframe) => {
      const document = printIframe.contentDocument;
			if (document) {
        const html = document.getElementsByTagName("html")[0];
        const options = {
          //margin: 5,
          filename: auditID+"_reportJANU"+".pdf",
          //jdPDF: { unit: "mm", format: "a4"}
        };
        // await new Html2Pdf().set(options).from(html).save()

        // await new Html2Pdf().set(options).from(html).outputPdf().then((pdfObj)=> {
        //   // You have access to the jsPDF object and can use it as desired.
        //  //console.log(pdfObj);
        //  const myFile = new File([pdfObj], options.filename, {
        //   type: "application/pdf",
        //   });
        //   console.log(myFile);
          
        //  setFileImage(myFile)
        //  setFilename(auditID+"_report"+".pdf")
        //  submitPDF(myFile,options.filename)
        // });
        // await new Html2Pdf().set(options).from(html).toPdf().output('datauristring').then(function (pdfAsString) {
        //   // The PDF has been converted to a Data URI string and passed to this function.
        //   // Use pdfAsString however you like (send as email, etc)! For instance:
        //   //console.log(pdfAsString);
        //   fetch(pdfAsString)
        //   .then(res => res.blob())
        //   .then(res1 =>{
        //     //console.log(res1);
        //     submitPDF(res1,options.filename)
        //   })
        // });

			}      
		},
    pageStyle: `
      @page {
          @bottom-center {
              content: "RSSA Report"+"ljpikjoi";
          }
  }`,
  });
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
  
  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [dummy, setDummy] = useState(0)
  
  const [teamNames, setTeamNames] = useState([])
  const [salient, setSalient] = useState([]);
  
  //for hfaz view modal

  const [hfazReport, setHfazReport] = useState([])
  const [hfazSectionReport, setHfazSectionReport] = useState([])
  const [hfazIssuesPerHfaz,sethfazIssuesPerHfaz] = useState([])
  const [hfazViewRows,sethfazViewRows]= useState([])
  const [hfazViewNames, sethfazViewNames]= useState([])
  const [openHfazView,setopenHfazView]= useState(false)
  const [hfazViewNamesReports, sethfazViewNamesReports] = useState([])
  const [hfazViewRowsReports, sethfazViewRowsReports] = useState([])
  const [hfazIssueList, sethfazIssueList] = useState([])

  const [subSection, setSubsection] = useState([])
  const [criticalSection, setCriticalSection] = useState([])
  const [criticalNames,setCriticalNames] = useState([])
  const [generalNames, setGeneralNames] = useState([])
  const [generalSection, setGeneralSection] = useState([])
  useEffect(()=>{
    loadAnsImages();
    populateTeamDetails();
    populateSalientReport();
    loadHfazTableReport();
    getAllSubSection();
    loadCriticalSection();
    loadGeneralSection();
    loadEditableDatas();
  },[])
  const loadAnsImages = () => {
    let config = {
      "audit_id": auditID
    }
    window.setTimeout(function(){
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
                });
            })
            console.log(imageSource)
            console.log(imageFileSource);
            setDummy(Math.random())
          })
          .catch(e => { console.log(e); setIsload(false); })
      })
      .catch(error => { setIsload(false); console.error(error) });
    },20000)
  }
  const loadEditableDatas = () =>{        
    let l1 = { 
        "audit_id":auditID
    } 
    AxiosApp.post(url1 + "report_rsa_data", l1)
    .then((response) => {
        if (response.data.statusCode == "200") {
        console.log(response.data);
        //uncomment once u have all BE data
        contentReport = response.data.background[0];
        setDummy(Math.random())
        }
    })
    .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
    }); 
  }
  const loadHfazTableReport = () =>{
    let l1 = { 
      "hfaz_id":"",
      "audit_id":auditID
    } 
    AxiosApp.post(url1 + "hfaz_report", l1)
    .then((response) => {
      if (response.data.statusCode == "200") {
        console.log(response.data);
        let l1 = response.data.details;  
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
  const loadIssuesPerHfaz = () =>{
    let l1 =  
    { "audit_id":auditID } 
    AxiosApp.post(url1 + "report_issue",l1)
    .then((response) => {
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
  const populateTeamDetails = () =>{
    let l1 =  
    { "audit_type_id":auditID } 
    AxiosApp.post(url1 + "team_details",l1)
    .then((response) => {
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
  const handleHfazSections = (r1) =>{
    if(r1 == null) return;
    let l1 = {  "hfaz_id": r1.hfaz_id}
    AxiosApp.post(url1 + "hfaz_view",l1)
    .then((response) => {
      if (response.data.statusCode == "200" && Object.keys(response.data.details).length > 0) { 
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
  const fillHfazViewTablesReports = (l1) =>{

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
    let s1 = {...hfazViewNamesReports};
    
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
              if(element[index] && element[index].question && 
                element[index].question.includes("GPS")){
                m1 = index; l11.push(element[index]);
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            //2.chainage
            m1 = -1;            
            for (let index = 0; index < element.length; index++) {
              if(element[index] && element[index].question && 
                element[index].question.includes("Chainage")){
                m1 = index; l11.push(element[index]);
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            //3.roadside
            m1 = -1;            
            for (let index = 0; index < element.length; index++) {
              if(element[index] && element[index].question && 
                element[index].question.includes("Road Side")){
                m1 = index; l11.push(element[index]);
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            //4.photo
            m1 = -1;            
            for (let index = 0; index < element.length; index++) {
              if(element[index] && element[index].question && 
                element[index].question.toLowerCase().includes("photo")){
                m1 = index; l11.push(element[index]);
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            //5.Issues
            m1 = -1;            
            for (let index = 0; index < element.length; index++) {
              if(element[index] && element[index].question && 
                element[index].question.includes("Issues")){
                m1 = index; l11.push(element[index]);
                //issuenames.push(element[index].answer)
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            //6.Suggestion
            m1 = -1;            
            for (let index = 0; index < element.length; index++) {
              if(element[index] && element[index].retrieval_id){
                m1 = index; l11.push(element[index]);
                break;
              }              
            } 
        //issueLocal[index] = issuenames;         
        local[index][perSectionCounter] = l11;
        perSectionCounter = perSectionCounter +1;
      }
    }
    console.log(local)
    return [local,Object.keys(l1)]
  }
  const fetchImageURLSalient = (mode) =>{
    let returnArray = noImage;
    let search1 = ""
    if(!mode) return returnArray;
    else {
      search1 = (mode == "start")?".A.":".B.";
      for (let [key, value] of imageSource) {
        if (key.search(search1) != -1) {
          returnArray = value;
          break;
        }
      }
      return returnArray;
    }
  }
  const fetchImageURL = (l1,rowNo,auditid) =>{
    if(!(l1 && rowNo)) 
    {
      return(noImage)
    }
    let returnArray = noImage;
    console.log("search"+l1)
    let aId = auditid ? auditid:auditID
    //send blob from here?
    //imageSource, find the search
    let search1 = aId + "/"+rowNo+"/"+l1;
    for (let [key, value] of imageSource) {    
    if(key.search(search1) != -1){
      returnArray = value;
      break;
    }
    }
    return returnArray;
  }
  const getAllSubSection = () =>{
    let l1 =  
    { "audit_id":auditID } 
    AxiosApp.post(url1 + "sub_section",l1)
    .then((response) => {
      if (response.data.statusCode == "200") {         
        setSubsection(response.data.details)          
      }
    })
    .catch((error) => {
    });
  }
  const loadCriticalSection = () =>{
    let l1 = { 
      "audit_id":auditID
    } 
    AxiosApp.post(url1 + "critical_observation", l1)
    .then((response) => {
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
  const loadGeneralSection = () =>{
    let l1 = { 
      "audit_id":auditID
    } 
    AxiosApp.post(url1 + "general_observation", l1)
    .then((response) => {
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
  const fillCriticalSection = (l1) =>{

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
    let s1 = {...criticalNames};
    
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
              if(element[index] && element[index].question && 
                element[index].question.includes("GPS")){
                m1 = index; l11.push(element[index]);
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            //2.chainage
            m1 = -1;            
            for (let index = 0; index < element.length; index++) {
              if(element[index] && element[index].question && 
                element[index].question.includes("Chainage")){
                m1 = index; l11.push(element[index]);
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            //3.roadside
            m1 = -1;            
            for (let index = 0; index < element.length; index++) {
              if(element[index] && element[index].question && 
                element[index].question.includes("Road Side")){
                m1 = index; l11.push(element[index]);
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            //4.photo
            m1 = -1;            
            for (let index = 0; index < element.length; index++) {
              if(element[index] && element[index].question && 
                element[index].question.toLowerCase().includes("photo")){
                m1 = index; l11.push(element[index]);
                break;
              }              
            }
            if(m1 == -1) l11.push({})
            
            /**
             * issues and suggestions, take from the retrieval_id
             * take from first element, coz it will be repeated for each question
             */
            let t1 = element[0].retrieval_id; //array of objects
            let t2 = [];
            let t3 = [];
            for (let index = 0; index < t1.length; index++) {
              const element = t1[index];
              t2.push(element['issue'])
              t3.push(element['suggestion'])
            }
            //issues
            l11.push(t2)

            //suggestion
            l11.push(t3)      
        local[index][perSectionCounter] = l11;
        perSectionCounter = perSectionCounter +1;
      }
    }
    console.log(local)
    return [local,Object.keys(l1)]
  }
  return (    <>
    {Object.keys(contentReport).length == 0 && (
      <div>
      Loading....
      </div>
      )}
    {Object.keys(contentReport).length > 0 && (
    <div id="rsa_report_id" style={{ padding: "20px" }}>
      {/* Close button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            right: "20px",
            top: "10px",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
        >
          <CloseIcon />
        </div>
      </div>

      {/* Printable Content */}
      <div ref={pdfRef} className="pdf-container">
        {/* page one */}
        <div className="page_title_rsa_print">
          <h1
            style={{
              textAlign: "center",
              fontSize: "40px",
              fontWeight: "600",
              marginTop: "40px",
            }}
          >
            Road Safety Survey & Audit Report
          </h1>
          <p
            style={{
              fontSize: "24px",
              fontWeight: 600,
              textAlign: "center",
              marginTop: "70px",
            }}
          >
            {salient.stretch_name}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "90px",
            }}
          >
            <img src={iitmlogo} style={{ width: "405px", height: "405px" }} />
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: "100px",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              gap: "10px",
              fontSize: "16px",
              lineHeight: "28px",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            <p>Prof Venkatesh Balasubramanian, PhD</p>
            <p>RBG Labs, Department of Engineering Design</p>
            <p>IIT Madras, Chennai 600036</p>
            <p>Email: chanakya@iitm.ac.in</p>
          </div>
        </div>

        {/* pager two */}
        <div className="tableofcontent_rsa" style={{ marginTop: "100px" }}>
          <div
            style={{
              //   height: "10vh",
              backgroundColor: "rgba(231, 238, 243, 1)",
              textAlign: "center",
              padding: "10px",
              color: "rgba(15, 82, 134, 1)",
              fontWeight: 700,
              fontSize: "15px",
              //   lineHeight: "12px",
            }}
          >
            <p>Road Safety Survey & Audit Report</p>
            <p> CoERS, IIT Madras</p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "50px",
            }}
          >
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                lineHeight: "28px",
              }}
            >
              Table of Contents
            </p>
            <p
              style={{
                fontSize: "24px",
                fontWeight: "400",
                // lineHeight: "28px",
              }}
            >              
            </p>
            {/* {Array.from({ length: 100 }, (_, i) => i + 1).map((itm, idx) => (
              <p style={{ fontSize: "16px", fontWeight: 500 }}>{idx}.section</p>
            ))} */}
          </div>
        </div>

        {/* page three */}
        <div style={{ marginTop: "20px", pageBreakBefore: "always" }}>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "400",
              // lineHeight: "28px",
            }}
          >
            Executive Summary
          </p>
          <div style={{ marginTop: "20px" }}>
            <p
              style={{
                marginTop: "20px",
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "18px",
                whiteSpace:'pre-wrap'
              }}
            >
             {contentReport.background.exec_summary}
            </p>
          </div>
        </div>

        {/* page four */}
        <div style={{ marginTop: "20px", pageBreakBefore: "always" }}>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "600",
              // lineHeight: "28px",
            }}
          >
            1.Background
          </p>
          <p
            style={{
              marginTop: "20px",
              fontSize: "15px",
              fontWeight: "400",
              lineHeight: "18px",
              whiteSpace:'pre-wrap'
            }}
          >
            {contentReport.background.bkg_summary}
          </p>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(46, 75, 122, 1)",
              fontWeight: 600,
              marginTop: "30px",
            }}
          >
            Table 1: Accident Data (
              {Object.values(contentReport.background.bgAccidentDetails)[0][0]}
              -
              {Object.values(contentReport.background.bgAccidentDetails)[4][0]}
            )
          </p>
          <TableContainer style={{ marginTop: "25px" }} component={Paper}>
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
                    Year
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Total Nos. of Accidents
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Fatalities
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
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
                      {row[0]}
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {row[1]}
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {row[2]}
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {row[3]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(46, 75, 122, 1)",
              fontWeight: 600,
              marginTop: "10px",
            }}
          >
            (Source: Road Accidents in India, MoRTH, 2023)
          </p>
          <div className="stretch_details_rsa">
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                // lineHeight: "28px",
                marginTop: "30px",
              }}
            >
              1.1.  Project Details
            </p>
            <p
              style={{
                marginTop: "20px",
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "18px",
              }}
            >
              {contentReport.background.proj_details}
            </p>
          </div>
          <div className="stretch_details_rsa">
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                // lineHeight: "28px",
                marginTop: "30px",
              }}
            >
              1.2. Audit Team
            </p>
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
                                          {index+1}
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
          </div>
          <div className="stretch_details_rsa">
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                // lineHeight: "28px",
                marginTop: "30px",
              }}
            >
              1.3. Salient Features of Road Stretch
            </p>
            <p
              style={{
                textAlign: "center",
                fontWeight: "500",
                fontSize: "14px",
                marginTop: "20px",
              }}
            >
              Table 2: Stretch Details ({salient.road_number})
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
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
                </TableContainer>
            </div>
          </div>
          <div className="stretch_details_rsa">
            {" "}
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                // lineHeight: "28px",
                marginTop: "30px",
              }}
            >
              1.4. Accident Data (Location Specific)
            </p>
            <p
              style={{
                marginTop: "20px",
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "18px",
              }}
            >
              {contentReport.acc_summary}
            </p>
            <TableContainer
              //   component={Paper}
              style={{ marginTop: "25px", width: "100%" }}
            >
              <Table style={{ width: "100%" }}>
                <TableBody>
                  <TableRow
                    // key={index}
                    sx={{
                      backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                    }}
                  >
                    <TableCell className="general_details_tbale_rsa">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>Nos. of Blackspots as per 2015 MoRTH definition</p>
                        <p>{contentReport.background.acc_data_table.bs}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    // key={index}
                    sx={{
                      backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                    }}
                  >
                    <TableCell className="general_details_tbale_rsa">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>Nos. of Emerging Blackspots </p>
                        <p>{contentReport.background.acc_data_table.ebs}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    // key={index}
                    sx={{
                      backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                    }}
                  >
                    <TableCell className="general_details_tbale_rsa">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>Nos. of Blackspots as per IRC:131-2022</p>
                        <p>{contentReport.background.acc_data_table.bs_irc}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    // key={index}
                    sx={{
                      backgroundColor: 2 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                    }}
                  >
                    <TableCell className="general_details_tbale_rsa">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>Vehicle Count involved in Crashes</p>
                        <p>{contentReport.background.acc_data_table.veh_count_report}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    // key={index}
                    sx={{
                      backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                    }}
                  >
                    <TableCell className="general_details_tbale_rsa">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>Passenger Count involved in Crashes</p>
                        <p>{contentReport.background.acc_data_table.pass_count_report}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    // key={index}
                    sx={{
                      backgroundColor: 1 % 2 === 0 ? "#f2f4f7" : "#ffffff",
                    }}
                  >
                    <TableCell className="general_details_tbale_rsa">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>Pedestrian Count involved in Crashes</p>
                        <p>{contentReport.background.acc_data_table.ped_count_report}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div className="stretch_details_rsa">
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                // lineHeight: "28px",
                marginTop: "30px",
              }}
            >
              1.5. Opportunities for Improvements
            </p>
            <p
              style={{
                marginTop: "20px",
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "18px",
                 whiteSpace:'pre-wrap'
              }}
            >
              {contentReport.background.opportunities}
            </p>
          </div>
          {/* High Frequency Accident Zone (HFAZ) */}
          <div
            className="hfaztitle landscape-section"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "670px",
            }}
          >
            <p
              style={{
                fontSize: "38px",
                fontWeight: "600",
                lineHeight: "48px",
              }}
            >
              High Frequency Accident Zone (HFAZ)
            </p>
          </div>

          <div className="hfaztabone landscape-section">
            <p>High Frequency Accident Zone (HFAZ)</p>
            <p
              style={{
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "600",
                color: "rgba(46, 75, 122, 1)",
                marginTop: "20px",
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
                        {""}
                      </TableCell>
                      <TableCell>
                        {""}
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
          </div>
          <div className="hfaxtabtwo landscape-section">
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
              {index+1} High Frequency Accident Zone{" "}
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
                      {Object.values(contentReport.background.hfazDetails)[index].severity}
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
                    <td className="table_row_td">{row.start_chainage}</td>
                  </tr>
                  <tr className="table_row_rsa">
                    <td className="table_row_td">End</td>
                    <td className="table_row_td">{row.end_chainage}</td>
                  </tr>
                  <tr className="table_row_rsa">
                    <td colspan="1" className="table_row_td">
                      Priority
                    </td>
                    <td colspan="2" className="table_row_td">
                      {Object.values(contentReport.background.hfazDetails)[index].priority}
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
                  {Object.values(contentReport.background.hfazDetails)[index].description}
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
                  <Table id={index+"hfazAccDataTable"}>
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
                        {Object.values(contentReport.background.hfazDetails)[index].accTable[0][0]}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {Object.values(contentReport.background.hfazDetails)[index].accTable[0][1]}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {Object.values(contentReport.background.hfazDetails)[index].accTable[0][2]}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {Object.values(contentReport.background.hfazDetails)[index].accTable[0][3]}
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
                          {Object.values(contentReport.background.hfazDetails)[index].accTable[1][1]}
                        </TableCell>
                        <TableCell>
                          {Object.values(contentReport.background.hfazDetails)[index].accTable[1][2]}
                        </TableCell>
                        <TableCell
                          style={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {Object.values(contentReport.background.hfazDetails)[index].accTable[1][3]}
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
                         {Object.values(contentReport.background.hfazDetails)[index].accTable[2][1]}
                        </TableCell>
                        <TableCell>
                          {Object.values(contentReport.background.hfazDetails)[index].accTable[2][2]}
                        </TableCell>
                        <TableCell>
                          {Object.values(contentReport.background.hfazDetails)[index].accTable[2][3]}
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
                      Object.entries(hfazIssuesPerHfaz[row.hfaz_id]).map(([k,v]) =>                         

                      v.map((i,j) => (
                      j < (v.length/2) && <TableRow
                        // key={index}
                        sx={{
                          backgroundColor:
                            j % 2 === 0 ? "#f2f4f7" : "#ffffff",
                        }}
                      >
                        <TableCell>{k}
                        </TableCell>
                        <TableCell>{ j==1 ? v[2]:v[j*j]}
                        </TableCell>
                        <TableCell>{k}
                        </TableCell>
                        <TableCell>{j ==1 ? v[3]:v[(j*j)+1]}
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
            hfazViewRowsReports[row.hfaz_id].map((ii,j)=>(
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
              {index+1}.1:{hfazViewNamesReports[row.hfaz_id][j]}              
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
              {index+1}.1.1: {subSection[hfazViewNamesReports[row.hfaz_id][j]]}                  
            </p>
            }
            <TableContainer component={Paper} style={{ marginTop: "25px" }}>
              <Table id={index+"hfazSectionTable"}>
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
                          src={row1[3] && fetchImageURL(row1[3].question_id,
                            row1[3].section_count,row1[3].audit_id)}
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
          </div>
          {/* Critical Observation */}
          <div
            className="hfaztitle landscape-section"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "670px",
            }}
          >
            <p
              style={{
                fontSize: "38px",
                fontWeight: "600",
                lineHeight: "48px",
              }}
            >
              Critical Observation
            </p>
          </div>
          <div className="hfaz_sectionone landscape-section">
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginTop: "30px",
              }}
            >
              Critical Observation
            </p>
            <div
              style={{
                border: "1px solid rgba(127, 163, 222, 0.3)",
                width: "100%",
                borderRadius: "10px",
                padding: "20px",
                marginTop: "20px",
              }}
            >
              {criticalSection && criticalSection.map((i1,j1)=>(
              <>
              {/* Critical observation per section starts here */}
                
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
                {j1+1}:{criticalNames[j1]}
                <br/>
                {subSection[criticalNames[j1]] && 
                <span>{j1+1}.1.1: {subSection[criticalNames[j1]]}</span>}
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
                            src={row1[3] && fetchImageURL(row1[3].question_id,row1[3].section_count)}
                            title={row1[3] && row1[3].question_id}
                            //src="#" alt={row1[3].answer}
                            style={{ width: "205px", height: "136px" }}
                          />
                        </TableCell>
                        <TableCell>   
                          {row1[4]}
                        </TableCell>
                        <TableCell>  
                            {row1[5]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              </>))}
            </div>
          </div>
          {/* General Observation */}
          <div
            className="hfaztitle landscape-section"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "670px",
            }}
          >
            <p
              style={{
                fontSize: "38px",
                fontWeight: "600",
                lineHeight: "48px",
              }}
            >
              General Observation
            </p>
          </div>
          <div className="generalObsection landscape-section">
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginTop: "30px",
                marginBottom: "30px",
              }}
            >
              General Observation
            </p>
            {generalSection.map((i2, j1) => {
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
                            {getIssueHere(i2,i3,j3)}
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
          </div>
        </div>
        {/* <div className="watermark">
          <div>RSA Stretch Name Road Name, Month Year</div>
        </div> */}
      </div>

      {/* Generate PDF Button */}
      {/* <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Button variant="contained" onClick={generatePDF}>
          Save
        </Button>
      </div> */}
    </div>
    )}
  </>);
}

export default FinalReportMerge;
