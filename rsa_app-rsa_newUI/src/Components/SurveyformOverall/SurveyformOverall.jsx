import React, { useEffect, useState } from "react";
import AuditorHeader from "../Auditor/AuditorHeader/AuditorHeader";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";
import { url1 } from "../../App";
import LocCap from "../LocationCapture/LocCap";
import { Modal } from "@mui/material";
import { Box } from "@mui/material";
import SurveyformAllEntries from "./SurveyformAllEntries";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  height: "70vh",
  bgcolor: "background.paper",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
};

function SurveyformOverall() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [sectionNames, setSectionNames] = useState([])
  const [sectionCategoryNames, setSectionCategoryNames] = useState([])

  //if(state.sNameList) setSectionNames(state.sNameList)
  //if(state.sCatList) setSectionCategoryNames(state.sCatList)

  const [startList, setStartList] = useState([])
  const [endList, setEndList] = useState([])
  const [sectionList, setSectionList] = useState([])

  const [completedSections, setCompletedSections] = useState([])

  const [openLS, setOpenLS] = useState(false);
  const handleOpenLS = () => setOpenLS(true);
  const handleCloseLS = () => setOpenLS(false);

  const [selectedSectionId, setselectedSectionId] = useState('')
  const [selectedSectionName, setselectedSectionName] = useState('')
  const [openAll, setOpenAll] = useState(false);
  const handleOpenAll = () => setOpenAll(true);
  const handleCloseAll = () => setOpenAll(false);

  const handleGeneralAudit = (dom1) => {
    let l1 = dom1.innerText.toLocaleLowerCase();
    if (l1 == "start audit details") {
      if (startList && startList[0])
        navigate("/Auditor_survey_start", {
          state: {
            auditObj: state.showObj,
            sectionName: l1.charAt(0).toUpperCase() + l1.slice(1),
            details: startList[0],
            sNameList: sectionNames,
            sCatList: sectionCategoryNames
          }
        })
      else {
        setAlert("error");
        setAlertMsg("Start Details not included in the audit");
        return;
      }
    } else if (l1 == "additional images") {
      setOpenLS(true);
      console.log("al i ");
    } else if (l1 == "end audit details") {
      if (endList[0])
        navigate("/Auditor_survey_three", {
          state: {
            auditObj: state.showObj,
            sectionName: l1.charAt(0).toUpperCase() + l1.slice(1),
            details: endList[0],
            sNameList: sectionNames,
            sCatList: sectionCategoryNames
          }
        })
    }
  }

  const findSectionId = (l1) =>{
    let l11=""
    if (l1 != "") {
      let index1 = sectionNames.indexOf(l1)
      if (index1 == -1) return l11;
      if (sectionList[index1]){
        try {
        l11 = Object.keys(sectionList[index1][0])[0].split(".")[2]   
        setselectedSectionId(l11)
        setOpenAll(true)       
        } catch (error) {          
        }
      }
    return l11;
    }
  }
  const handleSectionDataLoad = (data,qids) => {
    let l1 = selectedSectionName;
    if (l1 != "") {
      let index1 = sectionNames.indexOf(l1)
      if (index1 == -1) return;
      if (sectionList[index1])
        navigate("/Auditor_survey_two",
          {
            state: {
              auditObj: state.showObj, sectionName: l1.charAt(0).toUpperCase() + l1.slice(1),
              details: sectionList[index1],
              sNameList: sectionNames,
              catNames: sectionCategoryNames,
              data:data,
              qids:qids
              // issues : issues
            }
          })
    } else return;
  }
  const handleSections = (dom1) => {
    let l1 = dom1.innerText;
    if (l1 != "") {
      let index1 = sectionNames.indexOf(l1)
      if (index1 == -1) return;
      if (sectionList[index1])
        navigate("/Auditor_survey_two",
          {
            state: {
              auditObj: state.showObj, sectionName: l1.charAt(0).toUpperCase() + l1.slice(1),
              details: sectionList[index1],
              sNameList: sectionNames,
              catNames: sectionCategoryNames
            }
          })
    } else return;
  }
  const loadSections = () => {
    setIsload(true);
    let l1 = {
      "audit_id": state.showObj.audit_id
    }
    // l1 = {
    //   "audit_id":"Audit40331"  
    // } 
    AxiosApp.post(url1 + "audit_start", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          //find ways to store sections
          let object = response.data.details;
          localStorage.setItem("sectionStuff",JSON.stringify(object))
          for (const key in object) {
            if (key == "Start Audit Details") {
              setStartList(startList => [...startList, object[key]]);
            } else if (key == "End Audit Details") {
              setEndList(endList => [...endList, object[key]]);
            } else {
              setSectionList(sectionList => [...sectionList, object[key]]);
              setSectionNames(sectionNames => [...sectionNames, key])
            }
          }
          setIsload(true);
          AxiosApp.post(url1 + "sub_section", l1)
            .then((response) => {
              setIsload(false);
              if (response.data.statusCode == "200") {
                //find ways to store sections
                let l2 = response.data.details;
                localStorage.setItem("secCatnames",JSON.stringify(l2))
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
        } else {
          //For now suppressing
          setIsload(false);
          //setAlert("error");
          //setAlertMsg(response.data.status);
          return;
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  const loadFinishedSections = () => {
    setIsload(true);
    let l1 = {
      "audit_id": state.showObj.audit_id
    }
    AxiosApp.post(url1 + "completed_sections", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          setCompletedSections(response.data.details)
        } else {
          console.log(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }
  useEffect(() => {
    if (localStorage.getItem("sectionStuff") == "" || localStorage.getItem("secCatnames") == "") {
      loadSections()
    } else {
      //use from the localStorage from survey2 to surveyall
      try {
        let object = JSON.parse(localStorage.getItem("sectionStuff"));
        for (const key in object) {
          if (key == "Start Audit Details") {
            setStartList(startList => [...startList, object[key]]);
          } else if (key == "End Audit Details") {
            setEndList(endList => [...endList, object[key]]);
          } else {
            setSectionList(sectionList => [...sectionList, object[key]]);
            setSectionNames(sectionNames => [...sectionNames, key])
          }
        }

        let l2 = JSON.parse(localStorage.getItem("secCatnames"))
        setSectionCategoryNames(l2)
      } catch (error) {
          setSectionCategoryNames([])
          setSectionList([])
          setSectionNames([])
          setStartList([])
          setEndList([])
          loadSections();
      }
    }
    loadFinishedSections()
  }, [])
  return (
    <div>
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
      <div>
        <AuditorHeader />
        <div
          style={{
            backgroundColor: "#f4f7fa",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              //   justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <ArrowBackIcon onClick={() => { navigate(-1) }} />
            <h3>
              Back to Audit Landing page
            </h3>
            <span>Current Audit {state.showObj.audit_id}</span>
            <div
              style={{
                width: "100%",
                display: "none",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "30%",
                  backgroundColor: "white",
                  height: "20px",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    backgroundColor: "rgba(46, 75, 122, 1)",
                    height: "20px",
                    borderRadius: "10px",
                  }}
                >
                  {/* egtfrhgs */}
                </div>
              </div>
              <div
                style={{
                  width: "30%",
                  backgroundColor: "white",
                  height: "20px",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    width: "0%",
                    backgroundColor: "rgba(46, 75, 122, 1)",
                    height: "20px",
                    borderRadius: "10px",
                  }}
                >
                  {/* egtfrhgs */}
                </div>
              </div>{" "}
              <div
                style={{
                  width: "30%",
                  backgroundColor: "white",
                  height: "20px",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    width: "0%",
                    backgroundColor: "rgba(46, 75, 122, 1)",
                    height: "20px",
                    borderRadius: "10px",
                  }}
                >
                  {/* egtfrhgs */}
                </div>
              </div>
            </div>
          </div>
          <p style={{ fontWeight: "500", marginTop: "14px" }}>
            General Audit Details
          </p>
          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            {[
              "Start Audit Details",
              "Additional Images",
              "End Audit Details",
            ].map((itm) => (
              <Button
                style={{
                  id: { itm },
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  width: "118px",
                  height: "92px",
                  boxShadow: "0px 4px 10px 0px rgba(127, 163, 222, 0.1)",
                  borderRadius: "10px",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "14px",
                  fontWeight: "400",
                  padding: "11px",
                  borderColor: "black",
                  textTransform: 'none',
                  backgroundColor: completedSections.includes(itm) ? "lightyellow" : "white",
                }}
                onClick={(e) => {
                  // allow end after checking if it is already started                    
                  if ((e.target.innerText.toLocaleLowerCase().includes("end"))) {
                    if (completedSections.includes("Start Audit Details")) {
                      handleGeneralAudit(e.target)
                    } else {
                      setAlert("error")
                      setAlertMsg("Please start the survey, fill all the sections and then proceed to end the survey")
                      return;
                    }
                  } else {
                    handleGeneralAudit(e.target)
                  }
                }}
              >
                {itm}
              </Button>
            ))}
          </div>
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              fontWeight: "600",
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Note : once audit data collection completed, fill the end audit
            detail and submit the audit{" "}
          </p>
          <p style={{ fontWeight: "500", marginTop: "14px" }}>
            Sections Details
          </p>
          <div
            style={{
              display: "GRID",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              marginTop: "20px",
              gap: "10px",
            }}
          >
            {sectionNames.map((itm) => (
              <div style={{
              display: "flex", flexDirection:"column",borderColor: "black",
              gap:"5px",border: "1px solid rgba(127, 163, 222, 0.3)",borderRadius: "10px",
            }}>
              <Button
                style={{
                  cursor: "pointer",
                  //border: "1px solid rgba(127, 163, 222, 0.3)",
                  //width: "118px",
                  height: "92px",
                  boxShadow: "0px 4px 10px 0px rgba(127, 163, 222, 0.1)",
                  borderRadius: "10px",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "14px",
                  fontWeight: "400",
                  padding: "11px",
                  //borderColor: "black",
                  textTransform: 'none',
                  backgroundColor: completedSections.includes(itm) ? "lightyellow" : "white",
                }}
                onClick={(e) => {
                  if (e && e.target != null)
                    handleSections(e.target)
                  else
                    return;
                }}
              >
                {itm}
              </Button>

              <Button variant="contained" 
                id={itm}
                onClick={(e)=>{
                  if (e && e.target != null){
                    findSectionId(e.target.id)
                    setselectedSectionName(itm)
                  }
                  else
                    return;
                }}>All Entries</Button>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginTop: "10PX",
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Note : Latitude & Longitude values are taken for every observation
          </p>
        </div>
      </div>
      <div>
        {openLS &&
          <Modal
            open={handleOpenLS}
            onClose={handleCloseLS}
            id="modal_LS"
          >
            <Box sx={style} id="box_LS" style={{ height: "50vh" }}>
              <div>
                <LocCap id={state.showObj.audit_id} view={false} callChildBack={handleCloseLS} />
              </div>
            </Box>
          </Modal>
        }
      </div>
      <div>
        {openAll &&
          <Modal
            open={handleOpenAll}
            onClose={handleCloseAll}
            id="modal_All"
          >
            <Box sx={style} id="box_All" style={{ height: "50vh" }}>
              <div>
                <SurveyformAllEntries 
                a={localStorage.getItem('rsaLogged')}
                b={state.showObj.audit_id}
                c={selectedSectionId}
                callChildBackClose={handleCloseAll}
                callChildBackCloseData = {handleSectionDataLoad}/>                
              </div>
            </Box>
          </Modal>
        }
      </div>
    </div>

  );
}

export default SurveyformOverall;
