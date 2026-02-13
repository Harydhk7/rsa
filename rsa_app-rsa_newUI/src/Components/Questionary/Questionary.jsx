import React, { useEffect } from "react";
import Header from "../Header/Header";
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Tab,
    Tabs,
    TextareaAutosize,
    TextField,
    Typography,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Modal from "@mui/material/Modal";
import SearchIcon from "@mui/icons-material/Search";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Checkbox, FormControlLabel } from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import checkedvector from "../../Assets/Vector.png";
import TurnedInRoundedIcon from "@mui/icons-material/TurnedInRounded";
import TurnedInNotOutlinedIcon from "@mui/icons-material/TurnedInNotOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { useNavigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import Textarea from "@mui/joy/Textarea";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { url1 } from "../../App";
import Tooltip from '@mui/material/Tooltip';

import { useState } from "react";
import AxiosApp from "../../common/AxiosApp";
import CustomLoader from "../../common/customLoader";
import CustomAlerts from "../../common/CustomAlerts";

import MasterTableEditableTable from "./MasterTableEditableTable";
import MasterTableEditableTableDisplay from "./MasterTableEditableTableDisplay";

//temp using noImage for creating question in a section
import noImage from '../../Assets/noImage.png'
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";

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
const styleSection = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    height: "25vh",
    bgcolor: "background.paper",
    borderRadius: "10px",
    // border: "2px solid #000",
    // boxShadow: 24,
    overflowY: "auto",
    scrollBehavior: "smooth",
    p: 4,
};
const styleMasterTable = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "45%",
    height: "55vh",
    bgcolor: "background.paper",
    borderRadius: "10px",
    // border: "2px solid #000",
    // boxShadow: 24,
    overflowY: "auto",
    scrollBehavior: "smooth",
    p: 4,
};
function Questionary() {

    //Tabs bar
    const [valueTab1, setValueTab1] = React.useState(0);
    const handleChangeTabs1 = (event, newValue) => {
        setValueTab1(newValue);
    };

    const [valueTab2, setValueTab2] = React.useState(0);
    const handleChangeTabs2 = (event, newValue) => {
        setValueTab2(newValue);
    };

    const [chosenRoad, setchosenRoad] = useState()
    const [chosenStage, setchosenStage] = useState()
    const [chosenRoadName, setchosenRoadName] = useState()
    const [chosenStageName, setchosenStageName] = useState()

    const navigate = useNavigate();
    //common
    const [isload, setIsload] = useState("");
    const [alert, setAlert] = useState("");
    const [alertMsg, setAlertMsg] = useState("");
    //modal 1
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [newRoadId, setnewRoadId] = useState([])
    const [newStageId, setnewStageId] = useState([])
    const [newSectionId, setnewSectionId] = useState()
    const [newSectionName, setnewSectionName] = useState([])

    var selQuesMan = [];

    //modal 2

    const [openTwo, setOpenTwo] = React.useState(false);
    const handleOpenTwo = () => setOpenTwo(true);
    const handleCloseTwo = () => setOpenTwo(false);

    const [auditType, setauditType] = useState([])
    const [FieldType, setFieldType] = useState([])
    const [DataType, setDataType] = useState([])
    const [AnswerType, setanswerType] = useState([])

    const [saveQIds, setsaveQIds] = useState(new Map())

    const submitGetNewSectionId = () => {
        if (newRoadId != "" && newSectionName != "" && newStageId != "") {
            //axios call
            let l1 = {
                "road_type_id": newRoadId.split("-")[0],
                "road_type": newRoadId.split("-")[1],
                "stage_id": newStageId.split("-")[0],
                "stage": newStageId.split("-")[1],
                "section_name": newSectionName
            }
            AxiosApp.post(url1 + "section_creation", l1)
                .then(function (response) {
                    if (parseInt(response.data.statusCode) != "200") {
                        setAlert("error")
                        setAlertMsg(response.data.status)
                        return;
                    }
                    handleOpenTwo()
                    setnewSectionId(response.data.section_id)
                })
                .catch(function (error) {
                    console.log(error);
                    setAlert("error")
                    setAlertMsg(error)
                });
        } else {
            setAlert("error")
            setAlertMsg("Please fill all fields to proceed")
            return;
        }
    }
    const sampleAnswerJSON = {
        "show": true,
        "q_sub_id": "a.a",
        "dependency": "b.b",
        "choice": "text",
        "irc": "irc help text",
        "answerImage": "imagename",
        "imagename": "binary of image"
    }

    // modal to add question for an existing section
    const [openAddQuestion, setopenAddQuestion] = React.useState(false);
    const handleOpenAddQuestion = () => setopenAddQuestion(true);
    const handleCloseAddQuestion = () => setopenAddQuestion(false);

    const [chosenSection, setChosenSection] = useState()
    const [chosenSecIds, setChosenSecIds] = useState([])

    const [openEditSectionName, setopenEditSectionName] = React.useState(false);
    const handleOpenEditSectionName = () => setopenEditSectionName(true);
    const handleCloseEditSectionName = () => setopenEditSectionName(false);

    //modal to edit question for an existing section
    const [openEditQuestion, setopenEditQuestion] = React.useState(false);
    const handleOpenEditQuestion = () => setopenEditQuestion(true);
    const handleCloseEditQuestion = () => setopenEditQuestion(false);
    const [chosenQuestionId, setchosenQuestionId] = useState()


    //handle multiple questions here!!
    const [questionArray, setQuestionArray] = useState([])
    const sampleQuestionJSON = {
        "count": 0,
        "section_id": "rt",
        "section_name": "rtname",
        "qid": "",
        "qname": "",
        "auditmethod": "Issue",
        "field_type": "Mandatory",
        "condition_display": "NA",
        "data_type": "Alphabetical",
        "q_irc_image": "",
        "q_irc_help": "",
        "q_irc_image_name": "",
        "functionality": "",
        "answers": []
    }
    const [secAnsDependency, setsecAnsDependency] = useState(new Map())
    const [secQuesIRCImages, setsecQuesIRCImages] = useState(new Map())
    const [secAnswerIRCImages, setsecAnswerIRCImages] = useState(new Map())

    const [secQuesIRCBlobs, setsecQuesIRCBlobs] = useState(new Map())
    const [secAnswerIRCBlobs, setsecAnswerIRCBlobs] = useState(new Map())

    const saveQuestionIRCImage = (e, id) => {
        if (e.target.files) {
            if (e.target.files[0].type.includes("image")) {
                let file1 = e.target.files[0];
                let blob1 = URL.createObjectURL(file1)
                let t1 = secQuesIRCImages
                t1.set(id, file1); setsecQuesIRCImages(t1)
                let t2 = secQuesIRCBlobs
                t2.set(id, blob1); setsecQuesIRCBlobs(t2)
            } else {
                setAlert("error")
                setAlertMsg("Please upload image files")
                return;
            }
        }
        return;
    }
    const saveAnswerIRCImage = (e, id) => {
        if (e.target.files) {
            if (e.target.files[0].type.includes("image")) {
                let file1 = e.target.files[0];
                let blob1 = URL.createObjectURL(file1)
                let t1 = secAnswerIRCImages
                t1.set(id, file1); setsecAnswerIRCImages(t1)
                let t2 = secAnswerIRCBlobs
                t2.set(id, blob1); setsecAnswerIRCBlobs(t2)
            } else {
                setAlert("error")
                setAlertMsg("Please upload image files")
                return;
            }
        }
        return;
    }

    // modal to add and edit Question
    const [openThr, setOpenThr] = React.useState(false);
    const [question, setQuestion] = React.useState("Add");
    const handleOpenThr = () => setOpenThr(true);
    const handleCloseThr = () => setOpenThr(false);

    const [roadType, setRoadType] = useState([]);
    const [stageType, setStageType] = useState([]);
    const [sectionIdArray, setSectionIdArray] = useState([]);
    const [QidState, setQidState] = useState([]);
    const [QidHeaderState, setQidHeaderState] = useState([]);
    const [QidHeaderStateOriginal, setQidHeaderStateOriginal] = useState([]);

    const [allQData, setAllQData] = useState([]);
    const [secIdName, setsecIdName] = useState(new Map());

    //for save button click
    const [fieldTypeArrayId, setfieldTypeArrayId] = useState([])

    //initially all are visible here, so send whichever is invisible??
    const [visibilityArrayId, setvisibilityArrayId] = useState([])

    const hMap = new Map();
    const [dummy, setDummy] = useState('');

    //for master table modal
    const [openMaster, setOpenMaster] = React.useState(false);
    const handleOpenMaster = () => setOpenMaster(true);
    const handleCloseMaster = () => setOpenMaster(false);
    const [masterIdToModal, setmasterIdToModal] = useState()
    const [masterIdSection, setmasterIdSection] = useState()

    //for edit section
    const [chosenEditSectionName, setchosenEditSectionName] = useState()
    const [chosenEditSectionId, setchosenEditSectionId] = useState()
    const [sectionClicked, setsectionClicked] = React.useState(false);
    const [openEditSection, setOpenEditSection] = React.useState(false);
    const handleOpenEditSection = () => setOpenEditSection(true);
    const handleCloseEditSection = () => setOpenEditSection(false);


    const loadDropdowns = () => {
        AxiosApp.get(url1 + "dropdowns")
            .then(function (response) {
                if (parseInt(response.data.statusCode) != 200) {
                    setAlert("error")
                    setAlertMsg(response.data.status)
                    return;
                }
                let l1 = response.data;
                let k1 = Object.keys(l1['road_types'])
                let v1 = Object.values(l1['road_types'])
                let t1 = [];
                for (let index = 0; index < k1.length; index++) {
                    t1.push([k1[index], v1[index]])
                }
                setRoadType(t1);
                let x = k1[0]
                setchosenRoad(k1[0])
                setchosenRoadName(v1[0])

                k1 = Object.keys(l1['stage_types'])
                v1 = Object.values(l1['stage_types'])
                t1 = [];
                for (let index = 0; index < k1.length; index++) {
                    t1.push([k1[index], v1[index]])
                }
                setStageType(t1);
                let y = k1[0]
                setchosenStage(k1[0])
                setchosenStageName(v1[0])

                setSectionIdArray(Object.keys(l1['sections']));

                //for popups                
                setauditType(l1['audit_method_types'])
                setFieldType(l1['q_field_type'])
                setDataType(l1['q_data_type'])
                setanswerType(l1['master_table'])

                //load the first chosen road and chosen stage
                getQuestions(x, y)
            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
            });
    }
    useEffect(() => {
        loadDropdowns()
        setQuestionArray([sampleQuestionJSON])
    }, []);

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
            setQidHeaderState(filterIt(QidHeaderState, l1))
        } else {
            setQidHeaderState(QidHeaderStateOriginal)
        }
    }

    function handleSearch() {
        let l1 = document.getElementById('searchString').value;
        searchList(l1)
        return;
    }
    function saveQBank() {
        if (fieldTypeArrayId.length > 0 || visibilityArrayId.length > 0) {
            var l1 = {
                "q_id": fieldTypeArrayId,
                "action": "field_type"
            }
            AxiosApp.post(url1 + "edit_fieldtype", l1)
                .then(function (res) {
                    if (parseInt(res.data.statusCode) == 200) {
                        setAlert("success")
                        setAlertMsg(res.data.status)
                        return;
                    }
                    else {
                        setAlert("error")
                        setAlertMsg(res.data.status)
                        return;
                    }
                });
            var l11 = {
                "q_id": visibilityArrayId,
                "action": "visibility"
            }
            AxiosApp.post(url1 + "edit_fieldtype", l11)
                .then(function (res) {
                    if (parseInt(res.data.statusCode) == 200) {
                        setAlert("success")
                        setAlertMsg(res.data.status)
                        return;
                    }
                    else {
                        setAlert("error")
                        setAlertMsg(res.data.status)
                        return;
                    }
                });
        } else {
            setAlert("error")
            setAlertMsg("Please change fieldtype or visibility for the questions to save")
            return;
        }
    }
    function getQuestions(x, y) {
        if (!(x && y)) return;
        var reqData = {
            "stage_id": y,
            "road_type_id": x,
            "field_type": ""
        }
        setIsload(true)
        AxiosApp.post(url1 + "question_bank", reqData)
            .then(function (responseqb) {
                setIsload(false)
                if (parseInt(responseqb.data.statusCode) != 200) {
                    //setAlert("error")
                    //setAlertMsg(responseqb.data.status)
                    setQidHeaderState([]);
                    setQidHeaderStateOriginal([]);
                    setAllQData([]);
                    setQidState([]);
                    setsecIdName(new Map())
                    setvisibilityArrayId([])
                    return;
                }
                if (responseqb.data.statusCode == 200) {
                    console.log(responseqb.data.details);
                    console.log(Object.keys(responseqb.data.details));
                    setQidHeaderState(Object.keys(responseqb.data.details));
                    setQidHeaderStateOriginal(Object.keys(responseqb.data.details));
                    setAllQData(Object.values(responseqb.data.details));
                    setQidState(Object.values(responseqb.data.details));

                    //save the secid and secname in map
                    let m1 = secIdName
                    for (let index = 0; index < Object.keys(responseqb.data.details).length; index++) {
                        const element = Object.values(responseqb.data.details)[index];
                        let t1 = Object.keys(element[0])[0].split(".")[2]
                        m1.set(Object.keys(responseqb.data.details)[index], t1)
                    }
                    setsecIdName(m1)

                    //save the visibility details in array
                    let temp = [];
                    for (let i = 0; i < Object.keys(responseqb.data.details).length; i++) {
                        const element = Object.values(responseqb.data.details)[i];
                        for (let ii = 0; ii < element.length; ii++) {
                            const element1 = element[ii];
                            for (const key in element1) {
                                if (Object.hasOwnProperty.call(element1, key)) {
                                    const element2 = element1[key];
                                    if (element2.hide_option) {
                                        temp.push(element2.q_id)
                                    }
                                }
                            }
                        }
                    }
                    setvisibilityArrayId(temp)
                }
            })
            .catch(function (error) {
                setIsload(false)
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
            });

    }

    function getQid(qid) {
        if (selQuesMan.includes(qid)) {
            selQuesMan.splice(selQuesMan.indexOf(qid), 1);
        }
        else {
            selQuesMan.push(qid)
        }
        console.log(selQuesMan)
    }
    const CheckFillFieldArray = (id) => {
        if (fieldTypeArrayId.includes(id)) {
            let index = fieldTypeArrayId.indexOf(id)
            fieldTypeArrayId.splice(index, 1)
        } else {
            fieldTypeArrayId.push(id)
        }
        setfieldTypeArrayId(fieldTypeArrayId)
        setDummy(Math.random())
    }
    const allMandate = (e, sec, index) => {
        let l1 = "Mandatory";
        //go to correct section
        let temp = allQData;
        let temp1 = temp[index][0];
        for (var element in temp1) {
            if (temp1[element].field_type) {
                if (temp1[element].field_type != l1)
                    CheckFillFieldArray(temp1[element].q_id)
                temp1[element].field_type = l1;
            }
        };
        setAllQData(temp)
        setDummy(Math.random())
    }

    const allOptional = (e, sec, index) => {
        let l1 = "Optional";
        //go to correct section
        let temp = allQData;
        let temp1 = temp[index][0];
        for (var element in temp1) {
            if (temp1[element].field_type) {
                if (temp1[element].field_type != l1)
                    CheckFillFieldArray(temp1[element].q_id)
                temp1[element].field_type = l1;
            }
        };
        setAllQData(temp)
        setDummy(Math.random())
    }
    const singleMandateClick = (i, qid) => {
        let l1 = "Mandatory";
        let temp = allQData;
        temp[i][0][qid].field_type = l1;
        setAllQData(temp)
        CheckFillFieldArray(qid)
        setDummy(Math.random())
    }
    const singleOptionalClick = (i, qid) => {
        let l1 = "Optional";
        let temp = allQData;
        temp[i][0][qid].field_type = l1;
        CheckFillFieldArray(qid)
        setAllQData(temp)
        setDummy(Math.random())
    }
    const onVisibleClick = (id) => {
        if (visibilityArrayId.includes(id)) {
            let index = visibilityArrayId.indexOf(id)
            visibilityArrayId.splice(index, 1)
        } else {
            visibilityArrayId.push(id)
        }
        setvisibilityArrayId(visibilityArrayId)
        setDummy(Math.random())
    }
    const masterTableClick = (id, name1) => {
        setmasterIdToModal(id)
        setmasterIdSection(name1)
        //call axios and open the modal
        setOpenMaster(true)
    }
    //     var expectedPayload = {
    //         road_type_id: C 

    // road_type: National Highwary 4 Lane 

    // stage_id: E 

    // stage: Existing 

    // section_id: U 

    // question: hello 

    // section_name: VRU Facilities 

    // issues_list: No 

    // field_type: Mandatory 

    // conditions: No 

    // data_type: Alphabetical 

    // choice:

    //         {

    //             "choice1":

    //             {

    //                 "master_table": "a", "dependency_dd": "NA", "file_name": "img.jpg",

    //                 "show_option": "True"

    //             },

    //             "choice2":

    //             {

    //                 "master_table": "b", "dependency_dd": "NA", "file_name": "img2.jpg", "show_option": "True"
    //             },

    //             "choice3":

    //             {

    //                 "master_table": "c",

    //                 "dependency_dd": "NA",

    //                 "file_name": "img3.jpg",

    //                 "show_option": "True"
    //"img3.jpg":binary 

    //             }

    //         } 

    // irc_help_tool: yes 

    // file_name: image.jpg 

    // functionality: Autogenerated
    //     }
    const saveQuestionAnswer = (count) => {
        console.log(questionArray);
        console.log(questionArray[count])
        /**
         * axios call should return me the question id
         */
        let t1 = questionArray[count]
        let functional = t1.functionality;
        let ansCount = t1.answers;
        let answerJson = {}
        let formData = new FormData()
        if (functional == "Checkbox" || functional == "Dropdown/Radio Button") {
            for (let index = 0; index < ansCount.length; index++) {
                let localJson = {
                    "master_table": document.getElementById("qid" + count + "masterOption" + index).value,
                    "irc_help": document.getElementById("qid" + count + "irc" + index).value,
                    "dependency_dd":
                        document.getElementById("qid" + count + "dependency" + index).querySelectorAll("input")[0].value,
                    "show_option": document.getElementById("qid" + count + "showOption" + index).checked,
                }
                if (secAnswerIRCImages.get("secId" + "ques" + count + "answer" + index)) {
                    localJson.file_name = "choice" + index + ".png"
                    formData.append("choice" + index + ".png",
                        secAnswerIRCImages.get("secId" + "ques" + count + "answer" + index))
                }
                else {
                    //    formData.append("choice" + index + ".png", "")
                }
                answerJson["choice" + index] = localJson
            }
            formData.append("master_table", true)
        } else {
            for (let index = 0; index < ansCount.length; index++) {
                let localJson = {
                    "master_table": "",
                    "irc_help": document.getElementById("qid" + count + "irc" + index).value,
                    "dependency_dd":
                        document.getElementById("qid" + count + "dependency" + index).querySelectorAll("input")[0].value,
                    "show_option": true,
                }
                if (secAnswerIRCImages.get("secId" + "ques" + count + "answer" + index)) {
                    formData.append("choice" + index + ".png",
                        secAnswerIRCImages.get("secId" + "ques" + count + "answer" + index))
                    localJson.file_name = "choice" + index + ".png"
                }
                else {
                    //formData.append("choice" + index + ".png", "")
                }
                answerJson["choice" + index] = localJson
            }
            formData.append("master_table", false)
        }

        if (count == 0) {
            formData.append("q_no", "first")
        } else {
            formData.append("q_no", "")
        }
        formData.append("road_type_id", newRoadId.split("-")[0])
        formData.append("road_type", newRoadId.split("-")[1])
        formData.append("stage_id", newStageId.split("-")[0])
        formData.append("stage", newStageId.split("-")[1])
        formData.append("section_id", newSectionId)
        formData.append("section_name", newSectionName)
        formData.append("question", t1.qname)
        if (t1.auditmethod.trim().toLowerCase() == "inventory")
            formData.append("issues_list", "yes")
        else
            formData.append("issues_list", "no")
        formData.append("field_type", t1.field_type)
        formData.append("conditions", t1.condition_display)
        formData.append("data_type", t1.data_type)
        formData.append("functionality", t1.functionality)
        formData.append("irc_help_tool", t1.q_irc_help)

        if (secQuesIRCImages.get("secId" + "ques" + count + "ircImage")) {
            formData.append("file_name", "questionIRC.png")
            formData.append("questionIRC.png",
                secQuesIRCImages.get("secId" + "ques" + count + "ircImage"))
        } else {
            //formData.append("file_name", "")
        }

        formData.append("choice", JSON.stringify(answerJson))

        let l1 = ""
        AxiosApp.post(url1 + "new_sec_question", formData)
            .then(function (response) {
                if (response.data.statusCode == "200" || response.data.statusCode == 200) {
                    console.log(response);
                    l1 = response.data.qid;
                    let l2 = saveQIds
                    l2.set(count, l1)
                    setsaveQIds(l2)
                    setAlert("success")
                    setAlertMsg(response.data.status)
                    setDummy(Math.random())
                } else {
                    setAlert("error")
                    setAlertMsg(response.data.status)
                    return;
                }
            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
            });
    }
    const fillAnswerDependency = (count, x) => {
        let l2 = secAnsDependency;
        if (x == "NA") {
            l2.set(count, ["NA"])
            setsecAnsDependency(l2)
            setDummy(Math.random())
            return
        }
        let l1 = {
            "q_id": x
        }
        AxiosApp.post(url1 + "new_dependency", l1)
            .then(function (res) {
                console.log(res);
                if (res.data.statusCode == 200) {
                    l2.set(count, res.data.details)
                    setsecAnsDependency(l2)
                    setDummy(Math.random())
                } else {
                    setAlert("error")
                    setAlertMsg(res.data.status)
                    return;
                }
            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
            });
    }

    const saveSectionName = (x) => {
        if (x == "") {
            setAlert("error")
            setAlertMsg("Please enter new Section Name")
            return;
        }
        if (chosenEditSectionName == x) {
            setAlert("error")
            setAlertMsg("Please enter different Section Name")
            return;
        }
        let l1 = {
            "section_name": x,
            "section_id": chosenEditSectionId
        }

        AxiosApp.post(url1 + "edit_section", l1)
            .then(function (res) {
                console.log(res);
                if (res.data.statusCode == 200) {
                    let t1 = QidHeaderState;
                    let count = QidHeaderState.indexOf(chosenEditSectionName)
                    t1[count] = x;
                    setQidHeaderState(t1)

                    t1 = QidHeaderStateOriginal;
                    count = QidHeaderStateOriginal.indexOf(chosenEditSectionName)
                    t1[count] = x;
                    setQidHeaderStateOriginal(t1)
                    setDummy(Math.random())
                    handleCloseEditSectionName()
                } else {
                    setAlert("error")
                    setAlertMsg(res.data.status)
                    return;
                }
            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
            });
    }
    return (
        <div>
            <Header /> {dummy && <div style={{ display: "none" }}>{dummy}</div>}
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
                    // minHeight: "100vh",
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
                            Questionnaire
                        </p>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            style={{
                                backgroundColor: "rgb(46, 75, 122)",
                                color: "white",
                                // width: "70%",
                            }}
                            onClick={handleOpen}
                        >
                            Create
                        </Button>
                    </div>
                    <div
                        style={{
                            marginTop: "15px",
                            border: "1px solid rgba(127, 163, 222, 0.3)",
                            borderRadius: "10px",
                            //height: "70px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            overflowX: "auto",
                            whiteSpace: "nowrap",
                            scrollBehavior: "smooth",
                        }}
                        title="Choose the road type"
                    >
                        <Tabs
                            value={valueTab1}
                            onChange={handleChangeTabs1}
                            variant="scrollable"
                            scrollButtons
                            allowScrollButtonsMobile
                        >
                            {roadType.map((data, index) => (
                                <Tab
                                    key={index}
                                    variant="outlined"
                                    onClick={(e) => {
                                        setchosenRoad(e.target.id)
                                        setchosenRoadName(e.target.textContent)
                                        getQuestions(e.target.id, chosenStage)
                                    }
                                    }
                                    id={data[0]}
                                    style={{
                                        flexShrink: 0, // Prevent resizing
                                        border: "1px solid rgba(127, 163, 222, 0.3)",
                                        backgroundColor: data[0] === chosenRoad ? "rgb(46, 75, 122)" : "white",
                                        color: data[0] === chosenRoad ? "white" : "rgba(46, 75, 122, 1)",
                                        height: "40px",
                                        width: "300px", // Fixed button width
                                        margin: "5px",
                                    }}
                                    label=
                                    {data[1]}
                                />
                            ))}
                        </Tabs>
                        {/* {roadType.map((data, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                onClick={(e) => {
                                    setchosenRoad(e.target.id)
                                    setchosenRoadName(e.target.textContent)
                                    getQuestions(e.target.id, chosenStage)
                                }
                                }
                                id={data[0]}
                                style={{
                                    flexShrink: 0, // Prevent resizing
                                    border: "1px solid rgba(127, 163, 222, 0.3)",
                                    backgroundColor: data[0] === chosenRoad ? "rgb(46, 75, 122)" : "white",
                                    color: data[0] === chosenRoad ? "white" : "rgba(46, 75, 122, 1)",
                                    height: "40px",
                                    width: "300px", // Fixed button width
                                    margin: "5px",
                                }}
                            >
                                {data[1]}
                            </Button>
                        ))} */}
                    </div>
                    <div
                        style={{
                            marginTop: "15px",
                            display: "flex",
                            justifyContent: "space-between",
                            border: "1px solid rgba(127, 163, 222, 0.3)",
                            borderRadius: "10px",
                            height: "70px",
                            alignItems: "center",
                            gap: "10px",
                            overflowX: "auto",
                            whiteSpace: "nowrap",
                            scrollBehavior: "smooth",
                        }}
                        title="Choose the stage type"
                    >
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Tabs
                                value={valueTab2}
                                onChange={handleChangeTabs2}
                                variant="scrollable"
                                scrollButtons
                                allowScrollButtonsMobile
                            >
                                {stageType.map((data, index) => (
                                    <Tab
                                        key={index}
                                        variant="outlined"
                                        style={{
                                            border: "1px solid rgba(127, 163, 222, 0.3)",
                                            backgroundColor: data[0] === chosenStage ? "rgb(46, 75, 122)" : "white",
                                            color: data[0] === chosenStage ? "white" : "rgba(46, 75, 122, 1)",
                                            height: "40px",
                                            // width: "130px",
                                        }}
                                        id={data[0]}
                                        onClick={(e) => {
                                            setchosenStage(e.target.id)
                                            setchosenStageName(e.target.textContent)
                                            getQuestions(chosenRoad, e.target.id)
                                        }
                                        }
                                        label=
                                        {data[1]}
                                    >
                                    </Tab>
                                ))}
                            </Tabs>
                        </div>

                        {QidHeaderState.length != 0 && <div>
                            <FormControl sx={{ m: 1, width: "200px" }}>
                                <InputLabel htmlFor="outlined-adornment-amount">
                                    Search in Section
                                </InputLabel>
                                <OutlinedInput
                                    id="searchString"
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SearchIcon style={{ color: "black" }} />
                                        </InputAdornment>
                                    }
                                    label="Search Section"
                                    onChange={() => handleSearch()}
                                />
                            </FormControl>
                        </div>}
                    </div>
                    {QidHeaderState.length > 0 &&
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "20px",
                            }}
                        >
                            <Button
                                // onClick={() => setTab(1)}
                                style={{
                                    backgroundColor: "rgba(46, 75, 122, 1)",
                                    color: "white",
                                }}
                                // onClick={() => navigate("/Audit")}
                                onClick={() => { saveQBank() }}
                            >
                                Save Field Type or Visibility for the Questions
                            </Button>
                        </div>
                    }
                    {QidHeaderState.map((itm, count) => (
                        <div style={{ marginTop: "15px" }}>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    <p
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "rgba(46, 75, 122, 1)",
                                        }}
                                    >
                                        {itm} &nbsp;&nbsp;
                                        <EditIcon fontSize="small" onClick={() => {
                                            let t1 = Object.values(allQData[count])[0]
                                            let t2 = Object.keys(t1)[0].split(".")[2]
                                            setchosenEditSectionId(t2)
                                            setchosenEditSectionName(itm)
                                            handleOpenEditSectionName()
                                        }} />
                                    </p>
                                </AccordionSummary>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: "10px",
                                        marginRight: "20px",
                                    }}
                                >
                                    <Button
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
                                            textTransform: 'none'
                                        }}
                                        onClick={(e) => {
                                            allMandate(e, itm, count)
                                        }}
                                    >
                                        All Mandatory <TurnedInRoundedIcon />
                                    </Button>
                                    <Button
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
                                            textTransform: 'none'
                                        }}
                                        onClick={(e) => {
                                            allOptional(e, itm, count)
                                        }}
                                    >
                                        All Optional <TurnedInNotOutlinedIcon />
                                    </Button>
                                    <Button
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
                                        onClick={() => {
                                            setChosenSection(itm)
                                            let t1 = Object.values(allQData[count])[0]
                                            setChosenSecIds(Object.keys(t1))
                                            handleOpenAddQuestion()
                                        }}
                                    >
                                        Add New Question
                                        <AddBoxOutlinedIcon />
                                    </Button>
                                    {/* <div
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
                                        onClick={() => {
                                            setQuestion("Add");
                                            handleOpenThr();
                                        }}
                                    >
                                        Add
                                        <AddBoxOutlinedIcon />
                                    </div> */}
                                </div>
                                <AccordionDetails>
                                    {/* {console.log({itm})} */}
                                    {/* {console.log(QidListState[count])} */}

                                    {/* {setNumbers([Object.keys(QidListState[count][0])][0].length)}
{console.log(numbers)} */}
                                    {/* {console.log([Object.keys(QidListState[count][0])][0].length)} */}
                                    {/* {console.log([Object.keys(QidListState[count][0])][0].length)} */}

                                    {/* {console.log(count)} */}

                                    {/* {console.log(count)}
{console.log(numbers[count])} */}

                                    {Object.values(allQData[count][0]).map((dataA, indexA) => (
                                        <div
                                            style={{
                                                marginLeft: "20px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                border: " 1px solid rgba(127, 163, 222, 0.3)",
                                                padding: "10px 15px",
                                                borderRadius: "10px",
                                                backgroundColor: "white",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <p
                                                style={{
                                                    fontSize: "16px",
                                                    fontWeight: "600",
                                                    color: "rgba(46, 75, 122, 1)",
                                                }}
                                            >
                                                {dataA.q_id + " . " + dataA.question}
                                            </p>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <Tooltip title={"Click to edit this question"}>
                                                    <EditNoteOutlinedIcon
                                                        onClick={(e) => {
                                                            setchosenQuestionId(dataA.q_id)
                                                            setChosenSection(itm)
                                                            let t1 = Object.values(allQData[count])[0]
                                                            setChosenSecIds(Object.keys(t1))
                                                            handleOpenEditQuestion()
                                                        }}
                                                    />
                                                </Tooltip>
                                                {!visibilityArrayId.includes(dataA.q_id) &&
                                                    <Tooltip title={"Click to fix the visibility of this question"}>
                                                        <VisibilityOutlinedIcon
                                                            onClick={(e) =>
                                                                onVisibleClick(dataA.q_id)}
                                                            style={{ color: "rgb(46, 75, 122)" }}
                                                        />
                                                    </Tooltip>
                                                }
                                                {visibilityArrayId.includes(dataA.q_id) &&
                                                    <Tooltip title={"Click to fix the visibility of this question"}>
                                                        <VisibilityOffOutlinedIcon
                                                            onClick={(e) =>
                                                                onVisibleClick(dataA.q_id)}
                                                            style={{ color: "rgb(46, 75, 122)" }}
                                                        />
                                                    </Tooltip>
                                                }
                                                <Tooltip title={dataA.irc_help_tool} arrow>
                                                    <InfoOutlinedIcon style={{ color: "rgb(46, 75, 122)" }} />
                                                </Tooltip>
                                                {dataA.field_type == "Mandatory" &&
                                                    <Tooltip title={"Click to fix Mandate/Optional of this question"}>
                                                        <TurnedInRoundedIcon onClick={(e) =>
                                                            singleOptionalClick(count, dataA.q_id)} style={{ color: "rgb(46, 75, 122)" }} />
                                                    </Tooltip>
                                                }
                                                {dataA.field_type != "Mandatory" &&
                                                    <Tooltip title={"Click to fix Mandate/Optional of this question"}>
                                                        <TurnedInNotOutlinedIcon onClick={(e) =>
                                                            singleMandateClick(count, dataA.q_id)} style={{ color: "rgb(46, 75, 122)" }} />
                                                    </Tooltip>
                                                }
                                                {dataA.master_table == true && (
                                                    <Tooltip title={"Click to view master table of this question"}>
                                                        <TableChartOutlinedIcon onClick={(e) =>
                                                            masterTableClick(dataA.q_id, itm)}
                                                            style={{ color: "rgb(46, 75, 122)" }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>

                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        </div>
                    ))}
                    {QidHeaderState.length > 0 &&
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "20px",
                            }}
                        >
                            <Button
                                // onClick={() => setTab(1)}
                                style={{
                                    backgroundColor: "rgba(46, 75, 122, 1)",
                                    color: "white",
                                }}
                                // onClick={() => navigate("/Audit")}
                                onClick={() => { saveQBank() }}
                            >
                                Save Field Type or Visibility for the Questions
                            </Button>
                        </div>
                    }
                    {
                        QidHeaderState.length == 0 &&
                        <p
                            style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "rgba(46, 75, 122, 1)",
                            }}
                        >
                            <br />
                            No Questions for the selected combination </p>
                    }
                </div>
            </div>
            {/* modal ONE to create section */}
            <div>
                <Modal
                    open={open}
                    //onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    disableEscapeKeyDown={true}
                    disableEnforceFocus={true}
                >
                    <Box sx={style} style={{ height: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Section Creation Form
                            </Typography>
                            <Typography variant="h6" component="h6">
                                01/02
                            </Typography>
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gap: "15px",
                                marginTop: "15px",
                            }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>Road Id and Type</InputLabel>
                                <Select
                                    value={newRoadId}
                                    onChange={(e) => { setnewRoadId(e.target.value) }}
                                >
                                    {
                                        roadType.map((x, index) =>
                                            <MenuItem key={x[0]} value={x[0] + "-" + x[1]}>{x[0] + "-" + x[1]}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Stage Id and Type</InputLabel>
                                <Select
                                    value={newStageId}
                                    onChange={(e) => { setnewStageId(e.target.value) }}
                                >
                                    {
                                        stageType.map((x, index) =>
                                            <MenuItem key={x[0]} value={x[0] + "-" + x[1]}>{x[0] + "-" + x[1]}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                style={{
                                    display: "none"
                                }}
                                label="Section ID "
                                required
                                variant="outlined"
                                id="newSectionId"
                                value={newSectionId}
                                onChange={(e) => { setnewSectionId(e.target.value) }}
                            />
                            <TextField
                                fullWidth
                                label="Section Name"
                                required
                                variant="outlined"
                                id="newSectionName"
                                value={newSectionName}
                                onChange={(e) => { setnewSectionName(e.target.value) }}
                            />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "20px",
                            }}
                        >
                            <Button
                                // onClick={() => setTab(1)}
                                style={{
                                    backgroundColor: "rgba(46, 75, 122, 1)",
                                    color: "white",
                                }}
                                onClick={() => {
                                    submitGetNewSectionId()
                                }}
                            >
                                Save & Continue
                            </Button>
                            <Button
                                // onClick={() => setTab(1)}
                                style={{
                                    backgroundColor: "rgba(46, 75, 122, 1)",
                                    color: "white",
                                }}
                                onClick={() => {
                                    handleClose()
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </Box>
                </Modal>
            </div>
            {/* modal TWO to create section */}
            <div>
                <Modal
                    open={openTwo}
                    //onClose={handleCloseTwo}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    disableEscapeKeyDown={true}
                    disableEnforceFocus={true}
                >
                    <Box sx={style}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Section Creation Form
                            </Typography>
                            <Typography variant="h6" component="h6">
                                02/02
                            </Typography>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "10px",
                            }}
                        >
                            {/* <Typography
                                id="modal-modal-title"
                                variant="h6"
                                component="h2"
                                style={{ color: "rgba(46, 75, 122, 1)" }}
                            >
                                Questionnaire
                            </Typography> */}
                            <Button
                                title={"add new question"}
                                style={{
                                    backgroundColor: "rgba(46, 75, 122, 1)",
                                    color: "white",
                                    display: "flex",
                                    gap: "10px",
                                }}
                                onClick={(e) => {
                                    let l1 = questionArray;
                                    l1.push(sampleQuestionJSON)
                                    setQuestionArray(l1)
                                    setDummy(Math.random())
                                }}
                            >
                                <AddBoxOutlinedIcon />
                                Add New Question
                            </Button>
                        </div>
                        <br />


                        {questionArray.map((itm, count) => (
                            <div>
                            <div style={{border:"1px solid grey"}}>
                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1-content"
                                        id="panel1-header"
                                    >
                                        <p>Question {count + 1}
                                            <b> {saveQIds.get(count)}
                                                {
                                                    saveQIds.get(count) &&
                                                    <span> - This Question and Answer is saved</span>
                                                }</b>
                                        </p> <br />
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div
                                            className={saveQIds.get(count) ? "disableDiv" : "enableDiv"}
                                            style={{
                                                border: "1px solid rgba(127, 163, 222, 0.3)",
                                                width: "100%",
                                                // height: "70vh",
                                                marginTop: "15px",
                                                borderRadius: "10px",
                                                padding: "20px",
                                                overflowY: "auto",
                                                scrollBehavior: "smooth",
                                                // scrol,
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "1fr 1fr 1fr",
                                                    gap: "10px",
                                                }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    label="Section ID "
                                                    required
                                                    disabled
                                                    value={newSectionId}
                                                    variant="outlined"
                                                    style={{
                                                        display: "none"
                                                    }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="Section name "
                                                    required disabled
                                                    value={newSectionName}
                                                    variant="outlined"
                                                    style={{
                                                        display: "none"
                                                    }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="Question Id"
                                                    required
                                                    variant="outlined"
                                                    id={"qId" + (count + 1)}
                                                    value={questionArray[count].qid}
                                                    onChange={(e) => {
                                                        let l0 = questionArray;
                                                        l0[count].qid = e.target.value;
                                                        let l1 = l0[count].answers;
                                                        l1.push(sampleAnswerJSON)
                                                        setQuestionArray(l0)
                                                        setDummy(Math.random())
                                                    }}
                                                    style={{
                                                        display: "none"
                                                    }}
                                                />
                                            </div>
                                            <TextField
                                                style={{ marginTop: "12px" }}
                                                fullWidth
                                                multiline
                                                rows={3}
                                                label="Enter your Question here"
                                                required
                                                id={"qText" + (count + 1)}
                                                variant="outlined"
                                                value={questionArray[count].qname}
                                                onChange={(e) => {
                                                    let l0 = questionArray;
                                                    l0[count].qname = e.target.value;
                                                    setQuestionArray(l0)
                                                    setDummy(Math.random())
                                                }}
                                            />
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                                    gap: "10px",
                                                    marginTop: "12px",
                                                }}
                                            >
                                                <FormControl fullWidth>
                                                    <InputLabel>Audit Method Type</InputLabel>
                                                    <Select
                                                        id={"audit_type" + (count + 1)}
                                                        value={questionArray[count].auditmethod}
                                                        onChange={(e) => {
                                                            let l0 = questionArray;
                                                            l0[count].auditmethod = e.target.value;
                                                            setQuestionArray(l0)
                                                            setDummy(Math.random())
                                                        }}
                                                    >
                                                        {
                                                            auditType.map((x, index) =>
                                                                <MenuItem key={x} value={x}>{x}</MenuItem>
                                                            )
                                                        }
                                                    </Select>
                                                </FormControl>
                                                <FormControl fullWidth>
                                                    <InputLabel>Field Type</InputLabel>
                                                    <Select
                                                        id={"field_type" + (count + 1)}
                                                        value={questionArray[count].field_type}
                                                        onChange={(e) => {
                                                            let l0 = questionArray;
                                                            l0[count].field_type = e.target.value;
                                                            setQuestionArray(l0)
                                                            setDummy(Math.random())
                                                        }}
                                                    >
                                                        {
                                                            FieldType.map((x, index) =>
                                                                <MenuItem key={x} value={x}>{x}</MenuItem>
                                                            )
                                                        }
                                                    </Select>
                                                </FormControl>
                                                <FormControl fullWidth>
                                                    <InputLabel>Condition to Display</InputLabel>
                                                    <Select
                                                        id={"condition" + (count + 1)}
                                                        value={questionArray[count].condition_display}
                                                        onChange={(e) => {
                                                            let l0 = questionArray;
                                                            l0[count].condition_display = e.target.value;
                                                            setQuestionArray(l0)
                                                            fillAnswerDependency(count, e.target.value)
                                                            setDummy(Math.random())
                                                        }}
                                                    >
                                                        {count != 0 &&
                                                            Array.from(saveQIds.values()).map((x, index) =>
                                                                <MenuItem key={x} value={x}>{x}</MenuItem>
                                                            )
                                                        }
                                                        <MenuItem key={"NA"} value={"NA"}>{"NA"}</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <FormControl fullWidth>
                                                    <InputLabel id="demo-simple-select-label">Data Type</InputLabel>
                                                    <Select
                                                        id={"data_type" + (count + 1)}
                                                        value={questionArray[count].data_type}
                                                        onChange={(e) => {
                                                            let l0 = questionArray;
                                                            l0[count].data_type = e.target.value;
                                                            setQuestionArray(l0)
                                                            setDummy(Math.random())
                                                        }}
                                                    >
                                                        {
                                                            DataType.map((x, index) =>
                                                                <MenuItem key={x} value={x}>{x}</MenuItem>
                                                            )
                                                        }
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: "12px",
                                                    border: "1px solid rgba(127, 163, 222, 0.3)",
                                                    height: "20vh",
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <p style={{ color: "rgba(46, 75, 122, 1)" }}>IRC Help Tool</p>
                                                    {
                                                        secQuesIRCBlobs.get("secId" + "ques" + count + "ircImage") &&
                                                        <img className={"zoomImageHover"} src={secQuesIRCBlobs.get("secId" + "ques" + count + "ircImage")} />
                                                    }
                                                    <Button
                                                        variant="contained"
                                                        component="label"
                                                        // fullWidth
                                                        margin="normal"
                                                        style={{
                                                            backgroundColor: "rgba(127, 163, 222, 0.1)",
                                                            color: "rgba(46, 75, 122, 1)",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            gap: "10px",
                                                            fontSize: "10px",
                                                        }}
                                                        title="Upload irc help file"
                                                    >
                                                        <FileUploadOutlinedIcon
                                                            onClick={(e) => {
                                                                document.getElementById("secId" + "ques" + count + "inputFile").click();
                                                            }} />
                                                        Choose The File
                                                        <input type="file" hidden id={"secId" + "ques" + count + "inputFile"}
                                                            onChange={(e) => {
                                                                saveQuestionIRCImage(e, "secId" + "ques" + count + "ircImage")
                                                                setDummy(Math.random())
                                                            }}
                                                        />
                                                    </Button>
                                                </div>
                                                <hr
                                                    style={{
                                                        border: "1px solid rgba(127, 163, 222, 0.3)",
                                                        marginTop: "8px",
                                                    }}
                                                />
                                                <TextField
                                                    style={{ marginTop: "12px" }}
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    label="Enter your IRC help here"
                                                    required
                                                    id={"irc_help" + (count + 1)}
                                                    value={questionArray[count].q_irc_help}
                                                    variant="outlined"
                                                    onChange={(e) => {
                                                        let l0 = questionArray;
                                                        l0[count].q_irc_help = e.target.value;
                                                        setQuestionArray(l0)
                                                        setDummy(Math.random())
                                                    }}
                                                />
                                            </div>
                                            <p
                                                style={{
                                                    marginTop: "12px",
                                                    fontSize: "17px",
                                                    fontWeight: "600",
                                                    color: "rgba(46, 75, 122, 1)",
                                                }}
                                            >
                                                Functionality
                                                <span style={{
                                                    marginTop: "12px",
                                                    marginLeft: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    color: "rgba(255, 0, 0, 1)",
                                                }}>
                                                    (This option cannot be modified anywhere)
                                                </span>
                                            </p>
                                            <FormControl fullWidth style={{ marginTop: "15px" }}>
                                                <InputLabel id="demo-simple-select-label">
                                                    Select Answer Type
                                                </InputLabel>
                                                <Select
                                                    id={"answer_type" + (count + 1)}
                                                    value={questionArray[count].functionality}
                                                    onChange={(e) => {
                                                        let l0 = questionArray;
                                                        l0[count].functionality = e.target.value;
                                                        l0[count].answers = [];
                                                        let l1 = l0[count].answers;
                                                        l1.push(sampleAnswerJSON)
                                                        setQuestionArray(l0)
                                                        setDummy(Math.random())
                                                    }}
                                                >
                                                    {
                                                        AnswerType.map((x, index) =>
                                                            <MenuItem key={x} value={x}>{x}</MenuItem>
                                                        )
                                                    }
                                                </Select>
                                            </FormControl>

                                            <div
                                                style={{
                                                    marginTop: "12px",
                                                    marginBottom: "12px",
                                                    border: "1px solid rgba(127, 163, 222, 0.3)",
                                                    // height: "20vh",
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "10px",
                                                }}
                                            >
                                                {questionArray && questionArray[count] &&
                                                    questionArray[count].answers.map((itm, i) => (
                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns:
                                                                    (questionArray[count].functionality == "Checkbox" ||
                                                                        questionArray[count].functionality == "Dropdown/Radio Button") ?
                                                                        "0.5fr 0.5fr 2fr 3fr 1fr" : "2fr 2fr 2fr",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            {(questionArray[count].functionality == "Checkbox" ||
                                                                questionArray[count].functionality == "Dropdown/Radio Button") &&
                                                                <Checkbox id={"qid" + count + "showOption" + i}
                                                                    title={"To show this option - check, and to hide uncheck"} />
                                                            }
                                                            <FormControl fullWidth id={"qid" + count + "dependency" + i}>
                                                                <InputLabel >
                                                                    Dependency
                                                                </InputLabel>
                                                                <Select
                                                                >
                                                                    {
                                                                        secAnsDependency.get(count) && secAnsDependency.get(count).map((x) => (
                                                                            <MenuItem value={x}>{x}</MenuItem>
                                                                        ))
                                                                    }
                                                                    {
                                                                        !secAnsDependency.get(count) &&
                                                                        <MenuItem value={"NA"}>{"NA"}</MenuItem>
                                                                    }
                                                                </Select>
                                                            </FormControl>
                                                            {(questionArray[count].functionality == "Checkbox" ||
                                                                questionArray[count].functionality == "Dropdown/Radio Button") &&
                                                                <TextField
                                                                    label="Choice"
                                                                    id={"qid" + count + "masterOption" + i}
                                                                    required
                                                                    variant="outlined"
                                                                />}
                                                            <TextField
                                                                label="IRC help"
                                                                id={"qid" + count + "irc" + i}
                                                                required
                                                                variant="outlined"
                                                            />
                                                            {
                                                                secAnswerIRCBlobs.get("secId" + "ques" + count + "answer" + i) &&
                                                                <img className={"zoomImageHover"}
                                                                    src={secAnswerIRCBlobs.get("secId" + "ques" + count + "answer" + i)} />
                                                            }
                                                            <Button
                                                                variant="contained"
                                                                component="label"
                                                                margin="normal"
                                                                style={{
                                                                    backgroundColor: "rgba(127, 163, 222, 0.1)",
                                                                    color: "rgba(46, 75, 122, 1)",
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    gap: "10px",
                                                                    fontSize: "10px",
                                                                }}
                                                                title="Upload irc help file"
                                                            >
                                                                <FileUploadOutlinedIcon onClick={(e) => {
                                                                    document.getElementById("secId" + "ques" + count + "answer" + i).click();
                                                                }} />
                                                                Upload
                                                                <input type="file" hidden
                                                                    id={"secId" + "ques" + count + "answer" + i}
                                                                    onChange={(e) => {
                                                                        saveAnswerIRCImage(e, "secId" + "ques" + count + "answer" + i)
                                                                        setDummy(Math.random())
                                                                    }}
                                                                />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                {(questionArray[count].functionality == "Checkbox" ||
                                                    questionArray[count].functionality == "Dropdown/Radio Button") &&
                                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                                        <Button
                                                            variant="outlined"
                                                            disabled={
                                                                (questionArray[count].functionality == "Checkbox" ||
                                                                    questionArray[count].functionality == "Dropdown/Radio Button")
                                                                    ? false : true}
                                                            onClick={(e) => {
                                                                let newAnsObj = sampleAnswerJSON
                                                                let l0 = questionArray;
                                                                l0[count].answers.push(newAnsObj)
                                                                setQuestionArray(l0)
                                                                setDummy(Math.random())
                                                            }}
                                                        >
                                                            Add Option in Create Section
                                                        </Button>
                                                    </div>
                                                }
                                            </div>

                                            {/* save the question and answers */}
                                            {
                                                !saveQIds.get(count) &&
                                                <Button
                                                    variant="contained"
                                                    onClick={() => {
                                                        saveQuestionAnswer(count)
                                                    }}
                                                >
                                                    Save this Question and Answer
                                                </Button>
                                            }
                                            {
                                                saveQIds.get(count) &&
                                                <span> This Question and Answer is saved</span>
                                            }
                                            <Button
                                                style={{
                                                    backgroundColor: "rgba(255,0,0,1)",
                                                    float: "right",
                                                    color: "white",
                                                    display: "none",//"flex",
                                                    marginTop: "15px",
                                                    gap: "10px",
                                                }}
                                                onClick={() => {
                                                    let l0 = questionArray;
                                                    l0.splice(count, 1)
                                                    setQuestionArray(l0)
                                                    setDummy(Math.random())
                                                }}
                                            >
                                                Delete the Question and Answer
                                            </Button>
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            </div>
                            <br/>
                            </div>
                        ))}




                        {/* Final Submit all the questions!! */}
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <Button
                                style={{
                                    backgroundColor: "rgba(46, 75, 122, 1)",
                                    // float: "center",
                                    color: "white",
                                    display: "flex",
                                    marginTop: "15px",
                                    gap: "10px",
                                }}
                                onClick={(e) => {
                                    handleCloseTwo();
                                    handleClose();
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </Box>
                </Modal>
            </div>
            {/* modal to add question */}
            <div>
                <Modal
                    open={openAddQuestion}
                    onClose={handleCloseAddQuestion}
                >
                    <AddQuestion sec_add={secIdName.get(chosenSection) + "-" + chosenSection}
                        stage_add={chosenStage + "-" + chosenStageName} road_add={chosenRoad + "-" + chosenRoadName}
                        allqids={chosenSecIds}
                        auditType={auditType} FieldType={FieldType} DataType={DataType}
                        AnswerType={AnswerType}
                        gobackFromAddQ={handleCloseAddQuestion} />
                </Modal>
            </div>
            {/* modal to edit section Name */}
            <div>
                <Modal
                    open={openEditSectionName}
                    onClose={handleCloseEditSectionName}
                >
                    <Box sx={styleSection}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <h5> Enter new Section Name</h5>
                            <br />
                            <TextField
                                id={"newSectionName"}
                                required
                                variant="outlined"
                            />
                            <br />
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <Button variant={"contained"} onClick={(e) => saveSectionName(document.getElementById("newSectionName").value)}>
                                    Save
                                </Button>
                                <Button variant={"contained"} onClick={() => handleCloseEditSectionName()}>Close</Button>
                            </div>
                        </div>
                    </Box>

                </Modal>
            </div>
            {/* modal to edit question */}
            <div>
                <Modal
                    open={openEditQuestion}
                    onClose={handleCloseEditQuestion}
                >
                    <EditQuestion sec_add={secIdName.get(chosenSection) + "-" + chosenSection}
                        stage_add={chosenStage + "-" + chosenStageName} road_add={chosenRoad + "-" + chosenRoadName}
                        allqids={chosenSecIds} ques_add={chosenQuestionId}
                        auditType={auditType} FieldType={FieldType} DataType={DataType}
                        AnswerType={AnswerType}
                        gobackFromEditQ={handleCloseEditQuestion} />
                </Modal>
            </div>
            {/* modal to master table */}
            <div>
                <Modal
                    open={openMaster}
                    onClose={handleCloseMaster}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style} style={{ width: "70vw", height: "500px" }}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Section {masterIdToModal && masterIdToModal.split(".")[2]} - {masterIdSection} -  Question {masterIdToModal}
                            </Typography>
                        </div>
                        <MasterTableEditableTable id={masterIdToModal} />

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "-35px",
                            }}
                        >
                            <Button variant="contained"
                                onClick={() => {
                                    handleCloseMaster()
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </Box>
                </Modal>
            </div>
        </div>
    );
}
export default Questionary;