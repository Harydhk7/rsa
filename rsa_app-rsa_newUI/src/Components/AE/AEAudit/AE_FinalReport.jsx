/** This is the Report view from AE */

import React, { useEffect, useState, useRef } from "react";
import "./../../../../src/Components/FinalReport/FinalReport.css"
import AxiosApp from "./../../../../src/common/AxiosApp";
import { url1 } from "./../../../../src/App";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import Html2Pdf from "html2pdf.js"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import gajendra from "./../../../Assets/gajendra.jpg";
import header from "./../../../Assets/header.png";
import JSZip from 'jszip';
import noImage from './../../../Assets/noImage.png';
import CustomAlerts from "./../../../../src/common/CustomAlerts";
import CustomLoaderReports from "./../../../../src/common/CustomLoaderReports";
import CustomLoader from "../../../common/customLoader";
import html2pdf from "html2pdf.js";
import { saveAs } from 'file-saver';
import { Print } from "@mui/icons-material";

const rootElement = document.documentElement;


window.scrollTo({ top: 0, behavior: 'smooth' });
// var imageFileSource1 = new Map()
// var imageSource1 = new Map()

var localimageFileSource1 = new Map()
var localimageSource1 = new Map()

var contentReport = {};
var auditID = ""
var auditTypeID = ""
var imageList = {};
function AE_FinalReport(props) {
  console.log(props)
  const pdfRef = useRef(); // Initialize ref

  const componentRef = useRef();
  const navigate = useNavigate();
  const { state } = useLocation();
  // if (props.aid && props.atid) { // from DA page
  //   auditID = props.aid
  //   auditTypeID = props.atid
  // } else { // from Report Page
  //   auditID = state.aid
  //   auditTypeID = state.atid
  // }


  auditID = props.aid
  auditTypeID = props.atid

  //for images
  const [imageSource1, setimageSource1] = useState(new Map())
  const [imageFileSource1, setimageFileSource1] = useState(new Map())

  //for titlepage
  const [title_report, setreport] = useState('');
  const [title_sub_report, setsubreport] = useState('');
  const [title_name, setname] = useState('');
  const [title_company_name, setcompany] = useState('');
  const [title_address, setaddress] = useState('');
  const [title_contact, setcontact] = useState('');

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

  const downloadPdf = () => {
    const element = pdfRef.current;

    const options = {
      margin: [20, 15, 15, 15], // top, left, bottom, right (mm)
      filename: auditID + "_report" + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };
    // html2pdf().set(options).from(element).save();

    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date()
    let month1 = month[d.getUTCMonth()];
    let year = d.getUTCFullYear();
    new Html2Pdf().set(options).from(element).toPdf().get('pdf').then((pdf) => {
      var totalPages = pdf.internal.getNumberOfPages();

      for (let i = 2; i <= totalPages; i++) {
        // if(i===5){
        //   pdf.addPage("a4", "landscape")

        // pdf.movePage(5,totalPages)
        // } else {
        // // set footer to every page
        // pdf.setPage(i,"landscape");
        // }
        pdf.setPage(i);
        // set footer font
        pdf.setFontSize(10);
        pdf.setTextColor(150);

        //footer
        pdf.text(pdf.internal.pageSize.getWidth() - 30,
          pdf.internal.pageSize.getHeight() - 10, i + "/" + totalPages);


        pdf.text(10,
          pdf.internal.pageSize.getHeight() - 10,
          "RSSA " + salient.stretch_name + " - " + auditID + " , " + month1 + " - " + year);

        //pdf.context2D.fillRect(10,10,pdf.internal.pageSize.getWidth() - 10,15)
        // pdf.fillText("Title",40,10)

        //header
        //pdf.setFontSize(10);
        //pdf.setTextColor('#0F5286');
        //pdf.text(10,10, "Road Safety Survey & Audit Report, CoERS, IIT Madras");            
        //pdf.setHeaderFunction(1)
        pdf.addImage(header, 'png', 10, 10)


        //set font for total application
        pdf.setFontSize(12)
        pdf.setTextColor('#00000');
        pdf.setLineHeightFactor(0.75)

      }

    }).save()


  };


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
  const uploadImage = (e) => {
    setFileImage(e.target.files[0]);
    setFileURL(URL.createObjectURL(e.target.files[0]));
    setFilename(e.target.files[0].name);
  };
  const submitPDF = (x, y) => {
    let f1 = new FormData();
    f1.append("audit_id", auditID)
    f1.append("approval", "submit")
    f1.append("user_id", localStorage.getItem('rsaLogged'))
    f1.append("file_name", y)
    //f1.append("submitted_on",new Date().toISOString().slice(0, 10).split('-').reverse().join('-'))
    f1.append(y, x)
    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }
    setIsload(true);
    AxiosApp.post(url1 + "ae_report_approval", f1)
      .then((response) => {
        if (response.data.statusCode == "200") {
          console.log(response.data);
          navigate("/Ae_report")
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
        navigate(-1)
      });

  }
  const printSave = (content) => {
    generatePDF();
    return;
  }
  const generatePDF = useReactToPrint({
    content: () => pdfRef.current,
    copyStyles: true,
    onPrintError: (error, c) => console.log(c, error),
    print: async (printIframe) => {
      const document = printIframe.contentDocument;
      if (document) {
        const html = document.getElementsByTagName("html")[0];
        const options = {
          margin: [25, 20, 20, 20],
          filename: "AE_" + auditTypeID + "_report" + ".pdf",
          jdPDF: { unit: "mm", format: "letter" },
          jsPDF: { format: 'letter' },
          pagebreak: { after: ".brkAlways", avoid: ["tr", "thead>tr>tbody>tr"] }
        };
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const d = new Date()
        let month1 = month[d.getUTCMonth()];
        let year = d.getUTCFullYear();
        await new Html2Pdf().set(options).from(html).toPdf().get('pdf').then((pdf) => {
          var totalPages = pdf.internal.getNumberOfPages();
          for (let i = 2; i <= totalPages; i++) {
            // if(i===5){
            //   pdf.addPage("a4", "landscape")

            // pdf.movePage(5,totalPages)
            // } else {
            // // set footer to every page
            // pdf.setPage(i,"landscape");
            // }
            pdf.setPage(i);
            // set footer font
            pdf.setFontSize(10);
            pdf.setTextColor(150);

            //footer
            pdf.text(pdf.internal.pageSize.getWidth() - 30,
              pdf.internal.pageSize.getHeight() - 10, i + "/" + totalPages);


            pdf.text(10,
              pdf.internal.pageSize.getHeight() - 10,
              "RSSA " + salient.stretch_name + " - " + auditTypeID + " , " + month1 + " - " + year);

            //pdf.context2D.fillRect(10,10,pdf.internal.pageSize.getWidth() - 10,15)
            // pdf.fillText("Title",40,10)

            //header
            //pdf.setFontSize(10);
            //pdf.setTextColor('#0F5286');
            //pdf.text(10,10, "Road Safety Survey & Audit Report, CoERS, IIT Madras");            
            //pdf.setHeaderFunction(1)
            pdf.addImage(header, 'png', 10, 10)


            //set font for total application
            pdf.setFontSize(12)
            pdf.setTextColor('#00000');
            pdf.setLineHeightFactor(0.75)

          }

        })
          .save(); //commenting this save, let user save that file on own

        await new Html2Pdf().from(html).toPdf().output('datauristring').
          then(function (pdfAsString) {
            // The PDF has been converted to a Data URI string and passed to this function.
            // Use pdfAsString however you like (send as email, etc)! For instance:
            //console.log(pdfAsString);
            fetch(pdfAsString)
              .then(res => res.blob())
              .then(res1 => {
                //console.log(res1);
                submitPDF(res1, options.filename)
              })
          });
      }
    },
    pageStyle: `
     @page {
          @top-right {
              content: "RSSA";
            }
          @bottom-center {
              content: "RSSA Report" + auditTypeID;
          }
  }`,
    // trigger: () => (
    //   <button className="btn btn-primary">Print to PDF!</button>
    // )
  });



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
  const [hfazIssuesPerHfaz, sethfazIssuesPerHfaz] = useState([])
  const [hfazViewRows, sethfazViewRows] = useState([])
  const [hfazViewNames, sethfazViewNames] = useState([])
  const [openHfazView, setopenHfazView] = useState(false)
  const [hfazViewNamesReports, sethfazViewNamesReports] = useState([])
  const [hfazViewRowsReports, sethfazViewRowsReports] = useState([])
  const [hfazIssueList, sethfazIssueList] = useState([])

  const [subSection, setSubsection] = useState([])
  const [criticalSection, setCriticalSection] = useState([])
  const [criticalNames, setCriticalNames] = useState([])
  const [generalNames, setGeneralNames] = useState([])
  const [generalSection, setGeneralSection] = useState([])
  useEffect(() => {
    // rootElement.style.setProperty("--a1", 'yellow');
    document.documentElement.style.setProperty('--a1', '#005566');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadAnsImages();
    populateTeamDetails();
    populateSalientReport();
    loadHfazTableReport();
    getAllSubSection();
    loadCriticalSection();
    loadGeneralSection();
    loadEditableDatas();
    getTitleImages();


  }, [])
  const loadAnsImages = () => {
    let config = {
      "audit_id": auditID
    }
    //return;
    setIsload(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            // localimageSource1 = new Map();
            // localimageFileSource1 = new Map();

            imageFiles.forEach((filename, index) => {
              console.log(index + " s" + filename);

              //should be saved in another way  
              //imageFileSource1.set(filename,zip.files[imageFiles[index]])

              zip.file(filename)
                .async('blob')
                .then(blob => {
                  localimageSource1 = imageSource1
                  localimageSource1.set(filename, URL.createObjectURL(blob))

                  //window.alert("did i come")
                  //new way
                  const zfile1 = new File([blob], filename, {
                    lastModified: zip.files[imageFiles[index]].date.getTime(),
                    type: 'application/image'
                  });
                  localimageFileSource1 = imageFileSource1;

                  localimageFileSource1.set(filename, zfile1)
                  setimageSource1(localimageSource1);
                  setimageFileSource1(localimageFileSource1);

                  console.log(localimageSource1)
                  console.log(localimageFileSource1)
                  setDummy(Math.random())
                });
            })
          })
          .catch(e => { console.log(e); setIsload(false); })
      })
      .catch(error => { setIsload(false); console.error(error) });
  }
  const getTitleImages = () => {
    let l1 = {
      "audit_id": auditID
    }
    AxiosApp.post(url1 + "report_logo_get", l1,
      {
        responseType: 'arraybuffer',
        contentType: 'application/zip'
      })
      .then(data => {
        JSZip.loadAsync(data.data)
          .then(zip => {
            // Filter the files to only include image files
            const imageFiles = Object.keys(zip.files)
              .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));

            // Read each image file
            imageFiles.forEach((filename, index) => {
              console.log("filename s" + filename);
              let fname = filename.split("/")[0]
              let file = filename.split("/")[1]

              zip.file(filename)
                .async('blob')
                .then(blob => {
                  let url1 = URL.createObjectURL(blob);
                  if (fname.includes("titleLeft"))
                    imageList["titleLeft"] = { file, url1, fname }
                  else if (fname.includes("titleRight"))
                    imageList["titleRight"] = { file, url1, fname }
                  else if (fname.includes("titleLogo"))
                    imageList["titleLogo"] = { file, url1, fname }
                  setDummy(Math.random())
                });
            })
          })
          .catch(e => { console.log(e); })
      })
      .catch(error => { console.error(error) });
  }
  const loadEditableDatas = () => {
    let l1 = {
      "audit_id": auditID
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
  const loadHfazTableReport = () => {
    let l1 = {
      "hfaz_id": "",
      "audit_id": auditID
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
  const loadIssuesPerHfaz = () => {
    let l1 =
      { "audit_id": auditID }
    AxiosApp.post(url1 + "report_issue", l1)
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
  const populateTeamDetails = () => {
    let l1 =
      { "audit_type_id": props.atid }
    AxiosApp.post(url1 + "team_details", l1)
      .then((response) => {
        console.log(response);
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
    AxiosApp.post(url1 + "report_plan_data", l1)
      .then((response) => {
        if (response.data.statusCode == "200") {
          setSalient(response.data.details)
          let l2 = response.data.logo_details;
          setreport(l2.title)
          setsubreport(l2.sub_title)
          setname(l2.title_name)
          setcompany(l2.title_company)
          setaddress(l2.title_address)
          setcontact(l2.title_contact)
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
    AxiosApp.post(url1 + "hfaz_view", l1)
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



        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("severity")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push({})


        //Priority

        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("priority")) {
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

        if (m1 == -1) l11.push({})
        //5.Issues/Landuse Category/ Roadside Hazard Category/ User Behaviour Category
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            (element[index].question.includes("Landuse Category") ||
              element[index].question.includes("Roadside Hazard Category") ||
              element[index].question.includes("User Behaviour Category")
            )) {
            m1 = index; l11.push(element[index]);
            //issuenames.push(element[index].answer)
            break;
          }
        }
        if (m1 == -1) l11.push({})
        // //6.Suggestion
        // m1 = -1;
        // for (let index = 0; index < element.length; index++) {
        //   if (element[index] && element[index].retrieval_id) {
        //     m1 = index; l11.push(element[index]);
        //     break;
        //   }
        // }
        //issueLocal[index] = issuenames;         
        local[index][perSectionCounter] = l11;
        perSectionCounter = perSectionCounter + 1;
      }
    }
    console.log(local)
    return [local, Object.keys(l1)]
  }
  const fetchImageURLSalient = (mode) => {
    let returnArray = noImage;
    let search1 = ""
    if (!mode) return returnArray;
    else {
      search1 = (mode == "start") ? ".A.3.jpg" : ".B.3.jpg";
      for (let [key, value] of imageSource1) {
        if (key.search(search1) != -1) {
          returnArray = value;
          break;
        }
      }
      return returnArray;
    }
  }
  const fetchImageURL = (l1, rowNo) => {
    if (!(l1 && rowNo)) {
      return (noImage)
    }
    let returnArray = noImage;
    //send blob from here?
    //imageSource1, find the search
    let search1 = auditID + "/" + rowNo + "/" + l1 + ".jpg";

    //console.log("search" + search1)
    for (let [key, value] of imageSource1) {
      if (key == search1) {
        returnArray = value;
        break;
      }
    }
    return returnArray;
  }
  const getAllSubSection = () => {
    let l1 =
      { "audit_id": auditID }
    AxiosApp.post(url1 + "sub_section", l1)
      .then((response) => {
        if (response.data.statusCode == "200") {
          setSubsection(response.data.details)
        }
      })
      .catch((error) => {
      });
  }
  const loadCriticalSection = () => {
    let l1 = {
      "audit_id": auditID
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    AxiosApp.post(url1 + "critical_observation", l1)
      .then((response) => {
        if (response.data.statusCode == "200") {
          console.log(response.data);
          let l1 = response.data.details;
          let a = fillCriticalSection(l1);
          setCriticalNames(a[1])
          setCriticalSection(a[0])
          console.log(a)
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }
  const loadGeneralSection = () => {
    let l1 = {
      "audit_id": auditID
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

        //risk, severity
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("severity")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push("")

        // priority
        m1 = -1;
        for (let index = 0; index < element.length; index++) {
          if (element[index] && element[index].question &&
            element[index].question.toLowerCase().includes("priority")) {
            m1 = index; l11.push(element[index]);
            break;
          }
        }
        if (m1 == -1) l11.push("")

        //ae reponse
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

  console.log(subSection, 'subSection')
  const handleAfterPrint = (e) => {
    //debugger
  }

  const Header = () => {
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date()
    let month1 = month[d.getUTCMonth()];
    let year = d.getUTCFullYear();
    let ans = "RSSA " + salient.stretch_name + " - " + auditID + " , " + month1 + " - " + year
    return (
      <center><h5>{ans}</h5></center>
    )
  };
  const Footer = () => {
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date()
    let month1 = month[d.getUTCMonth()];
    let year = d.getUTCFullYear();
    let ans = "RSSA " + salient.stretch_name + " - " + auditID + " , " + month1 + " - " + year
    return (
      <h5>{ans}</h5>
    )
  };
  const PrintContent = () => (<>
    <p style={{
      display: "none"
    }}>{dummy}{"&&"}{imageSource1 && imageSource1.size}</p>
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
    {Object.keys(contentReport).length == 0 && (
      <div>
        Loading...
      </div>
    )}
    <p style={{
      display: "none"
    }}>{dummy}</p>
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
            {/* <CloseIcon /> */}
            <br />
          </div>
        </div>

        {/* Printable Content */}
        <Button variant="contained" onClick={downloadPdf}>
          Download Report
        </Button>
        <div ref={pdfRef} className="pdf-container">
          {/* page one */}
          <div>
            <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <img
                  style={{
                    width: "90px",
                    height: "90px",
                    backgroundColor: "white",
                    backgroundImage: imageList &&
                      imageList["titleLeft"] && imageList["titleLeft"].url1,
                  }}
                  className="roundImage"
                  src={imageList && imageList["titleLeft"] &&
                    imageList["titleLeft"].url1}
                  alt={""}
                />
              </div>
              <div>
                <h1
                  style={{
                    textAlign: "center",
                    fontSize: "30px",
                    fontWeight: "700",
                    marginTop: "30px",

                  }}
                >
                  {title_report}
                </h1>
                <h1
                  style={{
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "500",
                    marginTop: "50px",
                  }}
                >
                  {title_sub_report}
                </h1>
              </div>
              <div>
                <img
                  style={{
                    width: "90px",
                    height: "90px",
                    backgroundColor: "white",
                    backgroundImage: imageList &&
                      imageList["titleRight"] && imageList["titleRight"].url1,
                  }}
                  className="roundImage"
                  src={imageList && imageList["titleRight"] &&
                    imageList["titleRight"].url1}
                  alt={""}
                />
              </div>
            </div>
            {/* <p className="font12Print"
            style={{
              textAlign: "center",
              marginTop: "70px",
            }}
          >
            {salient.stretch_name}
          </p> */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "90px",
              }}
            >
              <img
                style={{
                  width: "100%",
                  height: "350px",
                  backgroundColor: "white",
                  borderRadius: 0,
                  backgroundImage: imageList &&
                    imageList["titleLogo"] && imageList["titleLogo"].url1,
                }}
                // className="roundImage"
                src={imageList && imageList["titleLogo"] &&
                  imageList["titleLogo"].url1}
                alt={""}
              />
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
                lineHeight: "20px",
                fontWeight: 600,
              }}
            >
              <p style={{ fontSize: "20px" }}>{title_name}</p>
              <p>{title_company_name}</p>
              <p>{title_address}</p>
              <p>{title_contact}</p>
            </div>
          </div>

          {/* pager two */}
          <div className="page-break" style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "50px",
              }}
            >
              <p className="font12Print"
                style={{
                  lineHeight: "28px",
                }}
              >
                Table of Contents
              </p>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: "400",
                  marginLeft: "20px",
                  lineHeight: "28px",
                }}
              >
                Executive Summary
                <ol>
                  <li>Background</li>
                  <ul style={{ marginLeft: "20px" }}>
                    <li>Project Details</li>
                    <li>Audit Team</li>
                    <li>Salient Features of Road Stretch</li>
                    <li>Accident Data (Location Specific)</li>
                    <li>Opportunities for Improvements</li>
                  </ul>
                  {hfazReport.length > 0 &&
                    <li>High Frequency Accident Zone (HFAZ)
                      <ul style={{ marginLeft: "20px" }}>
                        {hfazReport.map((row, index) => (
                          <li>{row.hfaz_id + "" + row.hfaz_section + row.stretch_type}</li>
                        ))}
                      </ul>
                    </li>
                  }
                  {criticalSection.length > 0 &&
                    <li>Critical Observation</li>}
                  {generalSection.length > 0 &&
                    <li>General Observation</li>}
                </ol>
              </p>
              {/* {Array.from({ length: 100 }, (_, i) => i + 1).map((itm, idx) => (
              <p style={{ fontSize: "16px", fontWeight: 500 }}>{idx}.section</p>
            ))} */}
            </div>
          </div>

          {/* page three */}
          <div className="page-break" style={{ marginTop: "20px" }}>
            <p className="font12Print"
              style={{
                // lineHeight: "28px",
              }}
            >
              Executive Summary
            </p>
            <div style={{ marginTop: "30px" }}>
              <p className="justifyAlign brkAvoid"
                style={{
                  marginTop: "20px",
                  fontSize: "15px",
                  fontWeight: "400",
                  lineHeight: "20px",
                  textAlign: 'justify',
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word"
                }}
              >
                {contentReport.background.exec_summary}
              </p>
            </div>
          </div>

          {/* page four */}
          <div className="page-break" style={{ marginTop: "20px" }}>
            <p className="font12Print brkAvoid"
              style={{
                // lineHeight: "28px",
              }}
            >
              1.Background
            </p>
            <p className="brkAvoid"
              style={{
                marginTop: "20px",
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "20px",
                textAlign: 'justify', pageBreakInside: 'avoid',
                whiteSpace: "pre-wrap"
              }}
            >
              {contentReport.background.bkg_summary}
            </p>
            <p className="brkAvoid"
              style={{
                fontSize: "15px",
                color: "rgba(46, 75, 122, 1)",
                fontWeight: 600,
                marginTop: "30px",
                textAlign: 'center'
              }}
            >
              Table 1: Accident Data
              {/* ( */}
              {/* {Object.values(contentReport.background.bgAccidentDetails)[0][0]}
              -
              {Object.values(contentReport.background.bgAccidentDetails)[4][0]}
              ) */}
            </p>
            <TableContainer className="brkAvoid" style={{ marginTop: "25px" }} component={Paper}>
              <Table size="small">
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
                    (row[0] != "" && row[1] != "" && row[2] != "" && row[3] != "" && row[4] != "") &&
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
              {/* (Source: Road Accidents in India, MoRTH, 2023) */}
            </p>
            <div className="brkAvoid">
              <p className="font12Print brkAvoid"
                style={{
                  // lineHeight: "28px",
                  marginTop: "30px",
                }}
              >
                1.1.  Project Details
              </p>
              <p className="brkAvoid"
                style={{
                  marginTop: "20px",
                  fontSize: "15px",
                  fontWeight: "400",
                  lineHeight: "20px",
                  textAlign: 'justify', pageBreakInside: 'avoid',
                  whiteSpace: "pre-wrap"
                }}
              >
                {contentReport.background.proj_details}
              </p>
            </div>

            <div className="brkAvoid">
              <p className="font12Print brkAvoid"
                style={{
                  // lineHeight: "28px",
                  marginTop: "30px",
                }}
              >
                1.2. Audit Team
              </p>
              <br />
              <TableContainer className="brkAvoid green" component={Paper}>
                <Table size="small">
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
            </div>
            <br />
            <br />
            {/* salient data */}
            <div className="page-break">
              <p className="font12Print"
                style={{
                  // lineHeight: "28px",
                  // marginTop: "-20px",
                }}
              >
                1.3. Salient Features of Road Stretch
              </p>
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "500",
                  fontSize: "12px", marginTop: "10px", marginBottom: "10px",
                }}
              >
                Table 2: Stretch Details ({salient.road_number})
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <TableContainer component={Paper}>
                  <Table size="small">
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
                              //justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Name of the Road</p>
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
                              //justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Number of Road</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>District</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Section of Road Audited</p>
                            <p>{salient.stretch_name || ""}</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Type of road</p>
                            <p>{salient?.road_type || ""}</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Road owning Agency</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Carriageway Width (m)</p>
                            <p>{salient?.carriageway_width || ""}</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Shoulder Type</p>
                            <p>{salient?.shoulder_type || ""}</p>
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
                              //justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Start Chainage (km)</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>End Chainage (km)</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Length of Road Audited (km)</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Land Use Pattern</p>
                            <p>{(salient?.landuse_pattern)?.map((itm) => itm) || ""}</p>
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
                              //justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Type of Terrain</p>
                            <p>{salient?.terrain_type || ""}</p>
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
                              // justifyContent: "space-between",
                            }}
                          >
                            <p style={{ width: "250px" }}>Pavement Type</p>
                            <p>{salient?.pavement_type || ""}</p>
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
                                src={fetchImageURLSalient("start")} alt="chainage *start"
                                style={{ width: "200px", height: "200px" }}
                              />
                              <p style={{ fontSize: "12px", fontWeight: 500 }}>
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
                                src={fetchImageURLSalient("end")} alt="chainage *end"
                                style={{ width: "200px", height: "200px" }}
                              />
                              <p style={{ fontSize: "12px", fontWeight: 500 }}>
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

            {/* acc table data */}

            <div className="brkAvoid page-break">
              {" "}
              <p className="font12Print"
                style={{
                  // lineHeight: "28px",
                  marginTop: "30px",
                }}
              >
                1.4. Accident Data (Location Specific)
              </p>
              <p className="brkAvoid"
                style={{
                  marginTop: "20px",
                  fontSize: "15px",
                  fontWeight: "400",
                  lineHeight: "20px", pageBreakInside: 'avoid',
                }}
              >
                {contentReport.acc_summary}
              </p>
              <TableContainer
                //   component={Paper}
                style={{ marginTop: "25px", width: "100%" }}
              >
                <Table size="small">
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

            {/* opp data */}
            <div className="brkAvoid">
              <p className="font12Print"
                style={{
                  // lineHeight: "28px",
                  //marginTop: "30px",
                }}
              >
                1.5. Opportunities for Improvements
              </p>
              <p className="brkAvoid"
                style={{
                  marginTop: "20px", marginBottom: "20px",
                  fontSize: "15px",
                  fontWeight: "400",
                  lineHeight: "18px",
                  textAlign: 'justify', pageBreakInside: 'avoid',
                  whiteSpace: "pre-wrap",

                }}
              >
                {contentReport.background.opportunities}
              </p>
            </div>

            {/* High Frequency Accident Zone (HFAZ) */}
            {hfazReport.length > 0 && <>
              <div className="pgbreakAfter" style={{ marginTop: "20px", pageBreakBefore: "always" }}>
                <p
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    fontSize: "38px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  High Frequency Accident Zone (HFAZ)
                </p>
                <div style={{ marginTop: "20px" }}>
                  <p
                  >
                    {""}
                  </p>
                </div>
              </div>



              <div
                style={{ marginTop: "20px", pageBreakBefore: "always", marginBottom: "20px" }}>
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
                  <Table size="small">
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
            </>}

            <div className="brkAvoid page-break">
              {hfazReport.map((row, index) => (
                <div className="landscape_section" style={{ marginTop: "20px", pageBreakBefore: "always", marginBottom: "20px" }}>
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
                        <Table size="small" id={index + "hfazAccDataTable"}>
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
                        <Table size="small">
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
                          <Table size="small" id={index + "hfazSectionTable"}>
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
                                <TableCell
                                  sx={{
                                    color: "white",
                                    fontWeight: "bold",
                                    textAlign: "left",

                                  }}
                                >
                                  Priority
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: "white",
                                    fontWeight: "bold",
                                    textAlign: "left",

                                  }}
                                >
                                  Severity
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody className="brkAvoid">
                              {ii.map((row1, index) => (

                                <TableRow className="brkAvoid"
                                  key={index}
                                  sx={{
                                    backgroundColor:
                                      index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                                  }}
                                >
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell style={{ width: "100px !important" }}>
                                    {
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "10px",
                                          maxWidth: "40px"
                                        }}
                                      >
                                        <span>{row1[1] && row1[1].answer}</span>
                                        <span>{row1[2] && row1[2].answer}</span>
                                        <span style={{ fontSize: '10px' }} ><b>{row1[0] && row1[0].answer}</b></span>
                                      </div>
                                    }
                                  </TableCell>
                                  <TableCell>
                                    <img
                                      src={row1[3] && fetchImageURL(row1[3].question_id, row1[3].section_count)}
                                      title={row1[3] && row1[3].question_id}
                                      //src="#" alt={row1[3].answer}
                                      style={{ width: "160px", height: "120px" }}
                                    />
                                  </TableCell>
                                  <TableCell align="left">
                                    <ul type="square">
                                      {row1[4]
                                        .split(',')
                                        .map((point) => point.trim())
                                        .filter((point) => point.length > 0)
                                        .map((point, index) => (
                                          <li key={index}>{point}</li>
                                        ))}
                                    </ul>
                                  </TableCell>
                                  <TableCell align="left">
                                    <ul type="square">
                                      {row1[5]
                                        .split(',')
                                        .map((point) => point.trim())
                                        .filter((point) => point.length > 0)
                                        .map((point, index) => (
                                          <li key={index}>{point}</li>
                                        ))}

                                    </ul>
                                  </TableCell>
                                  <TableCell style={{ width: "100px !important" }}>
                                    {
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "10px",
                                          maxWidth: "40px"
                                        }}
                                      >
                                        <span>{row1[7] && row1[7].answer}</span>
                                      </div>
                                    }
                                  </TableCell>



                                  <TableCell style={{ width: "100px !important" }}>
                                    {
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "10px",
                                          maxWidth: "40px"
                                        }}
                                      >
                                        <span>{row1[6] && row1[6].answer}</span>
                                      </div>
                                    }
                                  </TableCell>

                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                      </>))}
                </div>))}
            </div>

            {/* Critical Observation */}
            {criticalSection.length > 0 && <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "95vh"
                }}
              >
                <p
                  style={{
                    fontSize: "38px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  Critical Observation
                </p>
              </div>

              {/* ciritical data */}


              {/* <div class="page-start">
  <p>Critical Observation</p>
</div> */}


              {/* <p
                  style={{
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                </p> */}
              <div className="page-break"
              // style={{
              //   border: "1px solid rgba(127, 163, 222, 0.3)",
              //   width: "100%",
              //   borderRadius: "10px",
              //   padding: "20px",
              //   marginTop: "10px",
              //   //height: "100vh"
              // }}
              >{console.log(criticalSection, 'criticalSection')}
                {criticalSection && criticalSection.map((i1, j1) => (
                  <div
                    //style={{ marginTop: "20px", marginBottom: "20px" }}
                    className="page-break">
                    <span style={{
                      display: "none"
                    }}>{dummy}</span>
                    {/* Critical observation per section starts here */}
                    <br />
                    {j1 === 0 && <h4 className="main-heading">Critical Observation</h4>}
                    {/* {console.log(j1)} */}
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "left",
                        gap: "10px",
                        marginTop: "10px", marginBottom: "5px",
                        pageBreakInside: 'avoid',
                      }}
                      className="brkAvoid"
                    >
                      {j1 + 1}:{criticalNames[j1]}
                      <br />
                      {subSection[criticalNames[j1]] &&
                        <span>{j1 + 1}.1.1: {subSection[criticalNames[j1]]}</span>}
                    </p>
                    <TableContainer className="brkAvoid"
                      component={Paper}
                      style={{ width: "100%" }}
                    >
                      <Table className="brkAvoid" size="small">
                        <TableHead className="brkAvoid">
                          <TableRow
                            sx={{ backgroundColor: "rgba(46, 75, 122, 1)", fontSize: '8' }}
                            className="brkAvoid"
                          >
                            <TableCell

                              sx={{
                                width: '15%',
                                color: "white",
                                textAlign: "center",
                                fontSize: "11px"

                              }}
                            >
                              No
                            </TableCell>
                            <TableCell

                              sx={{
                                width: '25%',
                                color: "white",
                                textAlign: "center",
                                fontSize: "11px"

                              }}
                            >
                              Location
                            </TableCell>
                            <TableCell
                              // style={{width:'250px', height:'300px'}}
                              sx={{
                                width: '25%',
                                color: "white",
                                textAlign: "center",
                                fontSize: "11px"

                              }}
                            >
                              Image
                            </TableCell>
                            <TableCell

                              sx={{
                                width: '25%',
                                color: "white",
                                textAlign: "center",
                                fontSize: "11px"

                              }}
                            >
                              Issue
                            </TableCell>
                            <TableCell

                              sx={{
                                width: '25%',
                                color: "white",
                                textAlign: "center",
                                fontSize: "11px"

                              }}
                            >
                              Suggestion
                            </TableCell>
                            <TableCell

                              sx={{
                                width: '22%',
                                color: "white",
                                textAlign: "center",
                                fontSize: "11px"

                              }}
                            >
                              Priority
                            </TableCell>
                            <TableCell

                              sx={{
                                width: '22%',
                                color: "white",
                                textAlign: "center",
                                fontSize: "11px"

                              }}
                            >
                              Severity
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody className="brkAvoid">
                          {i1.map((row1, index) => (

                            <TableRow className="brkAvoid"
                              key={index}
                              sx={{
                                backgroundColor:
                                  index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                              }}
                            >
                              <TableCell sx={{
                                textAlign: "center",
                                fontSize: "12px"

                              }}>{index + 1}</TableCell>
                              <TableCell >
                                {
                                  <div
                                    style={{
                                       display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      textAlign: "center",
                                      fontSize: "10px"
                                    }}

                                  >
                                    <span>{row1[1] && row1[1].answer}</span>
                                    <span>{row1[2] && row1[2].answer}</span>
                                    <span  >{row1[0] && row1[0].answer}</span>
                                  </div>
                                }
                              </TableCell>
                              <TableCell sx={{
                                padding: 1, position: 'relative', textAlign: "center",
                                fontSize: "12px"
                              }}>
                                <div className="img-slot">
                                  <img className="pdf-img"
                                    src={row1[3] && fetchImageURL(row1[3].question_id, row1[3].section_count)}
                                    title={row1[3] && row1[3].question_id}
                                  />
                                </div>
                              </TableCell>
                              <TableCell sx={{
                                padding: 1, position: 'relative', textAlign: "center",
                                fontSize: "12px"
                              }}>
                                <ul type="square">
                                  {row1[4]
                                    .split(',')
                                    .map((point) => point.trim())
                                    .filter((point) => point.length > 0)
                                    .map((point, index) => (
                                      <li key={index}>{point}</li>
                                    ))}
                                </ul>
                              </TableCell>
                              <TableCell sx={{
                                padding: 1, position: 'relative', textAlign: "center",
                                fontSize: "12px"
                              }}>
                                <ul type="square">
                                  {row1[5]
                                    .split(',')
                                    .map((point) => point.trim())
                                    .filter((point) => point.length > 0)
                                    .map((point, index) => (
                                      <li key={index}>{point}</li>
                                    ))}

                                </ul>
                              </TableCell>
                              <TableCell sx={{
                                padding: 1, position: 'relative', textAlign: "center",
                                fontSize: "12px"
                              }}>
                                {
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      textAlign: "center",
                                      fontSize: "12px"
                                    }}
                                  >
                                    <span>{row1[7] && row1[7].answer}</span>
                                  </div>
                                }
                              </TableCell>



                              <TableCell sx={{
                                padding: 1, position: 'relative', textAlign: "center",
                                fontSize: "12px"
                              }}>
                                {
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      textAlign: "center",
                                      fontSize: "12px"
                                    }}
                                  >
                                    <span>{row1[6] && row1[6].answer}</span>
                                  </div>
                                }
                              </TableCell>

                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                  </div>))}
              </div>
            </>}
            {/* General Observation */}


            {generalSection.length > 0 && <>
              <div className="page-break"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "95vh"
                }}
              >
                <p
                  style={{
                    fontSize: "38px",
                    fontWeight: "600",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  General Observation
                </p>
              </div>
              <div className="stretch_details_rsa hfaztabone landscape_section page-break"
                style={{ marginTop: "20px", marginBottom: "20px" }}>

                {generalSection.map((i2, j1) => {
                  return (
                    <div className="landscape_section" style={{ marginTop: "20px", marginBottom: "20px" }}>

                      <br />
                      {j1 === 0 && <h4 className="main-heading">General Observation</h4>}
                      {/* {console.log(j1)} */}
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "left",
                          gap: "10px",
                          marginTop: "10px", marginBottom: "5px",
                          pageBreakInside: 'avoid',
                        }}
                        className="brkAvoid"
                      ></p>



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
                                  <Table size="small">
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
                                               <Table  size="small">
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
                    </div>)
                })}
              </div>
            </>}
          </div>
          {/* <div className="watermark">
          <div>RSA Stretch Name Road Name, Month Year</div>
        </div> */}
        </div>

        <br />
        <br />
        {/* Generate PDF Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Button variant="contained" onClick={downloadPdf}>
            Download Report
          </Button>
        </div>
      </div>
    )}
  </>
  );

  const Pp1 = () => (<><div ref={componentRef}>
    <div>
      <div id="chapter2" class="chapter">
        <h2>Page Orientation</h2>
        <p>Lorem ipsum</p>
      </div>
      <div id="chapterw2" class="chapter">
        <h2>Page Orientation</h2>
        <p>Lorem ipsum</p>
      </div>
    </div></div></>
  )
  return (
    <div>
      <CustomLoaderReports show={isload} />
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
      {/* { !state.hidePrint &&  */}
      {/* <ReactToPrint
        trigger={() => (
          <Tooltip title='Print'>
            <IconButton>
              <Print style={{ fontSize: "24px" }} />
              <h5>Save the AE Response Report</h5>
            </IconButton>
          </Tooltip>
        )}
        content={() => componentRef.current}
        onAfterPrint={() => printSave()}
      /> */}
      {/* <ReactToPrint
        trigger={() => <Button variant="contained" >Save</Button>}
        content={() => componentRef.current}
        delay={15000}
        onAfterPrint={() => printSave()}
        documentTitle={auditID + "_report"}
      // onBeforePrint={() => window.alert("the great!!!")}
      /> */}

      {/* /** printable soluton */}
      <div className="print-wrapper" ref={componentRef}>
        <table>
          <thead>
            <tr>
              <td>
                <div className="header-space">&nbsp;</div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div>
                  <PrintContent />
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                <div className="footer-space">&nbsp;</div>
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="header">
          <Header />
        </div>
        <div className="footer">
          {/* <Footer /> */}
        </div>
      </div>
      {/* /** printable soluton */}

    </div>
  )
}

export default AE_FinalReport;
