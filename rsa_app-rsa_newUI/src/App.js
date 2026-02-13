import logo from "./logo.svg";
import "./App.css";
import "../src/common/css/style.css";
import Login from "./Components/Login/Login";
import Dashboard from "./Components/Dashboard/Dashboard";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Audit from "./Components/Audit/Audit";
import Questionary from "./Components/Questionary/Questionary";
import Users from "./Components/Users/Users";
import Suggestionmapping from "./Components/Suggestionmapping/Suggestionmapping";
import Reports from "./Components/Reports/Reports";
import CreateAudit from "./Components/CreateAudit/CreateAudit";
import CreateAuditSection from "./Components/CreateAuditSection/CreateAuditSection";
import AuditPlanning from "./Components/AuditPlanning/AuditPlanning";
import AuditAssignment from "./Components/AuditAssignment/AuditAssignment";
import Retrievalid from "./Components/Retrievalid/Retrievalid";
import AuditorDashboard from "./Components/Auditor/AuditorDashboard/AuditorDashboard";
import AuditorAudit from "./Components/Auditor/AuditorAudit/AuditorAudit";
import AuditorData from "./Components/Auditor/AuditorData/AuditorData";
import AuditorReport from "./Components/Auditor/AuditorReport/AuditorReport";
import SurveyformOne from "./Components/Auditor/SurveyformOne/SurveyformOne";
import SurveyformTwo from "./Components/Auditor/SurveyformTwo/SurveyformTwo";
import SurveyformThree from "./Components/Auditor/SurveyformThree/SurveyformThree";
import SurveyformOverall from "./Components/SurveyformOverall/SurveyformOverall";
import SurveyformStart from "./Components/Auditor/SurveyformStart/SurveyformStart";
import ReportListing from "./Components/ReportListing/ReportListing";
import FinalReport from "./Components/FinalReport/FinalReport";
import FinalReportMerge from "./Components/FinalReportMergeNotusing/FinalReportMerge";
import ViewMergeReport from "./Components/Reports/ViewMergeReport";
import AddCommentReport from "./Components/Auditor/AddCommentReport/AddCommentReport";
import ReportAddComment from "./Components/ReportAddComment/ReportAddComment";
import MergeAll from "./Components/Reports/MergeAll";
import Footer from "./Components/Footer";
import AE_Dashboard from"./Components/AE/AEDashboard/AE_Dashboard";
import AE_Audit from "./Components/AE/AEAudit/AE_Audit"
import AE_Meet from "./Components/AE/AEMeet/AE_Meet";
import AE_Report from "./Components/AE/AEReport/AE_Report";
import AE_DataAnalysis from "./Components/AE/AEAudit/AE_DataAnalysis";
import AE_FinalReport from "./Components/AE/AEAudit/AE_FinalReport";
import FUAudit from "./Components/FU/FUAudit/FUAudit";

//BE connects 
//export const url1 = "http://10.42.235.143:8001/";
export const url1 = "https://coers.iitm.ac.in/rsa_development/"
//export const url1 = "https://rbg.iitm.ac.in/rsa_api/";

//export const url1 = "http://10.24.6.234:8600/"; // dev in IP
export const rsiltUrl = "https://rbg.iitm.ac.in/rsilt_api/"

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* coers/owner/la flow */}
          <Route path="/" element={<Login/>}/>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Audit" element={<Audit />} />
          <Route path="/Audit/createAudit" element={<CreateAudit />} />
          <Route
            path="/Audit/createAudit/section"
            element={<CreateAuditSection />}
          />
          <Route path="/Audit/planning" element={<AuditPlanning />} />
          <Route path="/Audit/Assignment" element={<AuditAssignment />} />
          {/* only coers */}
          <Route path="/Questionary" element={<Questionary />} />
          <Route path="/Users" element={<Users />} />
          <Route path="/Suggestion_mapping" element={<Suggestionmapping />} />
          <Route path="/Retrievalid" element={<Retrievalid />} />
          <Route path="/Reports" element={<Reports />} />

          {/* not in use - merge report table */}
          <Route path="/MergeAll" element={<MergeAll />} />
          <Route
            path="/Report_comment_form"
            element={<ReportListing />}
          />
          {/* audit final report viewing from auditors point of view*/}
          <Route path="/Report_final" element={<FinalReport />} /> 

          {/* not in use - merge report ui page */}
          <Route path="/view_merged_final" element={<ViewMergeReport />} />
          <Route
            path="/Report_Add_Comment"
            element={<ReportAddComment />}
          />



          {/* auditor flow */}
          <Route path="/Auditor_dashboard" element={<AuditorDashboard />} />
          <Route path="/Auditor_Audit" element={<AuditorAudit />} />
          <Route path="/Auditor_data" element={<AuditorData />} />
          <Route path="/Auditor_report" element={<AuditorReport />} />
          <Route
            path="/Report_comment"
            element={<AddCommentReport />}
          />
          <Route path="/Auditor_survey_one" element={<SurveyformOne />} />{" "}
          {/** no need as it is repetative */}
          <Route
            path="/Auditor_survey_start"
            element={<SurveyformStart />}
          />{" "}
          {/** this is start form */}


          <Route path="/Auditor_survey_two" element={<SurveyformTwo />} />{" "}
          {/** actual sections */}

          <Route
            path="/Auditor_survey_three"
            element={<SurveyformThree />}
          />{" "}

          {/** this is end form */}
          <Route
            path="/Auditor_survey_overall"
            element={<SurveyformOverall />}
          />

          {/* ae flow */}
          <Route path="/Ae_dashboard" element={<AE_Dashboard />} />
          <Route path="/Ae_dataAnalysis" element={<AE_DataAnalysis/>}/>
          <Route path="/Ae_Audit" element={<AE_Audit />} />
          <Route path="/Ae_meet" element={<AE_Meet />} />
          <Route path="/Ae_report" element={<AE_Report />} />
          
          {/* audit final report viewing from ae's point of view*/}
          <Route path="/AE_FinalReport" element={<AE_FinalReport/>}/>

          {/* new acl - field user - only audit tab */}
          <Route path="/fe_audit" element={<FUAudit />} />
        </Routes>
      </Router>
      <Footer/>
    </div>
  );
}

export default App;
