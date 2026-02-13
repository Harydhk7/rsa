import React from 'react';
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    TextareaAutosize,
    TextField,
    Typography, Select, Checkbox
} from "@mui/material";
import { url1 } from "../../App";
import Tooltip from '@mui/material/Tooltip';
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { useState } from "react";
import AxiosApp from "../../common/AxiosApp";
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
function AddQuestion(props) {
    const [dummy, setDummy] = useState(0)
    const [isload, setIsload] = useState("");
    const [alert, setAlert] = useState("");
    const [alertMsg, setAlertMsg] = useState("");

    const [auditType, setauditType] = useState(props.auditType)
    const [FieldType, setFieldType] = useState(props.FieldType)
    const [DataType, setDataType] = useState(props.DataType)
    const [allQids, setAllQids] = useState(props.allqids)
    const [AnswerType, setanswerType] = useState(props.AnswerType)

    const [functionality, setfunctionality] = useState()
    const [newQuestionIRCBlob, setnewQuestionIRCBlob] = useState()

    const [secAnsDependency, setsecAnsDependency] = useState([])
    const [newQuestionIRCImage, setnewQuestionIRCImage] = useState()
    const [newAnswerIRCImages, setnewAnswerIRCImages] = useState(new Map())

    const [secQuesIRCBlobs, setsecQuesIRCBlobs] = useState()
    const [newAnswerIRCBlobs, setnewAnswerIRCBlobs] = useState(new Map())
    const [answerObj, setAnswerObj] = useState([])
    const sampleAnswerJSON = {
        "show": true,
        "q_sub_id": "a.a",
        "dependency": "b.b",
        "choice": "text",
        "irc": "irc help text",
        "answerImage": "imagename",
        "imagename": "binary of image"
    }
    const fillAnswerDependency = (x) => {
        let l2 = secAnsDependency;
        if (x == "NA") {
            l2 = ["NA"]
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
                    l2 = res.data.details
                    setsecAnsDependency(l2)
                    setDummy(Math.random())
                }
                else {
                    setAlert("error")
                    setAlertMsg(res.data.status)
                    return;
                }
            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
                return;
            });
    }
    const saveQuestionIRCImage = (e, id) => {
        if (e.target.files) {
            if (e.target.files[0].type.includes("image")) {
                let file1 = e.target.files[0];
                let blob1 = URL.createObjectURL(file1)
                setnewQuestionIRCBlob(blob1)
                setnewQuestionIRCImage(file1)
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
                let t1 = newAnswerIRCImages
                t1.set(id, file1); setnewAnswerIRCImages(t1)
                let t2 = newAnswerIRCBlobs
                t2.set(id, blob1); setnewAnswerIRCBlobs(t2)
            } else {
                setAlert("error")
                setAlertMsg("Please upload image files")
                return;
            }
        }
        return;
    }
    const saveQuestionAnswer = () => {
        /**
         * axios call should return me the question id
         */
        let functional = functionality;
        let ansCount = answerObj;
        let answerJson = {}
        let formData = new FormData()
        if (functional == "Checkbox" || functional == "Dropdown/Radio Button") {
            for (let index = 0; index < ansCount.length; index++) {
                let localJson = {
                    "master_table": document.getElementById("masterOption" + index).value,
                    "irc_help": document.getElementById("irc" + index).value,
                    "dependency_dd":
                        document.getElementById("dependency" + index).querySelectorAll("input")[0].value,
                    "show_option": document.getElementById("showOption" + index).checked,
                }
                if (newAnswerIRCImages.get("answer" + index)) {
                    localJson.file_name = "choice" + index + ".png"
                    formData.append("choice" + index + ".png",
                        newAnswerIRCImages.get("answer" + index))
                }
                else
                    //formData.append("choice" + index + ".png", "")

                    answerJson["choice" + index] = localJson
            }
            formData.append("master_table", true)
        } else {
            for (let index = 0; index < ansCount.length; index++) {
                let localJson = {
                    "master_table": "",
                    "irc_help": document.getElementById("irc" + index).value,
                    "dependency_dd":
                        document.getElementById("dependency" + index).querySelectorAll("input")[0].value,
                    "show_option": true,
                }
                answerJson["choice" + index] = localJson
                if (newAnswerIRCImages.get("answer" + index)) {
                    localJson.file_name = "choice" + index + ".png"
                    formData.append("choice" + index + ".png",
                        newAnswerIRCImages.get("answer" + index))
                }
                else
                    //formData.append("choice" + index + ".png", "")
                    answerJson["choice" + index] = localJson
            }
            formData.append("master_table", false)
        }

        formData.append("q_no", props.ques_add)
        formData.append("road_type_id", props.road_add.split("-")[0])
        formData.append("road_type", props.road_add.split("-")[1])
        formData.append("stage_id", props.stage_add.split("-")[0])
        formData.append("stage", props.stage_add.split("-")[1])
        formData.append("section_id", props.sec_add.split("-")[0])
        formData.append("section_name", props.sec_add.split("-")[1])
        formData.append("question", document.getElementById("new_question").value)
        if (document.getElementById("audit_type").innerText.trim().toLowerCase() == "inventory")
            formData.append("issues_list", "yes")
        else
            formData.append("issues_list", "no")
        formData.append("field_type", document.getElementById("field_type").innerText)
        formData.append("conditions", document.getElementById("condition").innerText)
        formData.append("data_type", document.getElementById("data_type").innerText)
        formData.append("functionality", functionality)
        formData.append("irc_help_tool", document.getElementById("irc_help").value)

        if (newQuestionIRCImage) {
            formData.append("file_name", "questionIRC.png")
            formData.append("questionIRC.png",
                newQuestionIRCImage)
        } else {
            //formData.append("file_name", "")
        }

        formData.append("choice", JSON.stringify(answerJson))

        let l1 = ""
        AxiosApp.post(url1 + "add_question", formData)
            .then(function (response) {
                if (response.data.statusCode == "200" || response.data.statusCode == 200) {
                    console.log(response);
                    // l1 = response.data.qid;
                    // let l2 = saveQIds
                    // l2.set(count, l1)
                    // setsaveQIds(l2)
                    // setAlert("success")
                    // setAlertMsg(response.data.status)
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
                return;
            });
    }
    return (
        <div>
            <Box sx={style}>
                <>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "10px",
                        }}
                    >
                        <Typography
                            id="modal-modal-title"
                            variant="h6"
                            component="h2"
                            style={{ color: "rgba(46, 75, 122, 1)" }}
                        >
                            Add Question - Section {props.sec_add}
                        </Typography>
                    </div>
                    <div
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
                        </div>
                        <TextField
                            style={{ marginTop: "12px" }}
                            fullWidth
                            multiline
                            rows={3}
                            label="Enter your Question here"
                            required
                            id={"new_question"}
                            variant="outlined"
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
                                    id={"audit_type"}
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
                                    id={"field_type"}
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
                                    id={"condition"}
                                    onChange={(e) => {
                                        fillAnswerDependency(e.target.value)
                                        setDummy(Math.random())
                                    }}
                                >
                                    {allQids && allQids.map((x, index) =>
                                        <MenuItem key={x} value={x}>{x}</MenuItem>
                                    )}
                                    <MenuItem key={"NA"} value={"NA"}>{"NA"}</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Data Type</InputLabel>
                                <Select
                                    id={"data_type"}
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
                                    newQuestionIRCBlob &&
                                    <img className={"zoomImageHover"}
                                        src={newQuestionIRCBlob} />
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
                                            document.getElementById("inputFile_irc").click();
                                        }} />
                                    Choose The File
                                    <input type="file" hidden
                                        id={"inputFile_irc"}
                                        onChange={(e) => {
                                            saveQuestionIRCImage(e)
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
                                id={"irc_help"}
                                variant="outlined"
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
                        <FormControl fullWidth style={{ marginTop: "15px", marginBottom: "10px" }}>
                            <InputLabel id="demo-simple-select-label">
                                Select Answer Type
                            </InputLabel>
                            <Select
                                id={"answer_type"}
                                value={functionality}
                                onChange={(e) => {
                                    setfunctionality(e.target.value)
                                    let l1 = [];
                                    l1.push(sampleAnswerJSON)
                                    setAnswerObj(l1)
                                    setDummy(Math.random())
                                }}
                            >
                                {
                                    AnswerType && AnswerType.map((x, index) =>
                                        <MenuItem key={x} value={x}>{x}</MenuItem>
                                    )
                                }
                            </Select>
                        </FormControl>
                        {answerObj && answerObj.map((x, i) => (
                            <>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            (functionality == "Checkbox" ||
                                                functionality == "Dropdown/Radio Button") ?
                                                "0.5fr 0.5fr 2fr 3fr 1fr 1fr" : "2fr 2fr 2fr",
                                        gap: "10px",
                                    }}
                                >
                                    {(functionality == "Checkbox" ||
                                        functionality == "Dropdown/Radio Button") &&
                                        <Checkbox id={"showOption" + i}
                                            title={"To show this option - check, and to hide uncheck"} />
                                    }
                                    <FormControl fullWidth id={"dependency" + i}>
                                        <InputLabel >
                                            Dependency
                                        </InputLabel>
                                        <Select
                                        >
                                            {
                                                secAnsDependency && secAnsDependency.map((x) => (
                                                    <MenuItem value={x}>{x}</MenuItem>
                                                ))
                                            }
                                            <MenuItem value={"NA"}>{"NA"}</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {(functionality == "Checkbox" ||
                                        functionality == "Dropdown/Radio Button") &&
                                        <TextField
                                            label="Choice"
                                            id={"masterOption" + i}
                                            required
                                            variant="outlined"
                                        />}
                                    <TextField
                                        label="IRC help"
                                        id={"irc" + i}
                                        required
                                        variant="outlined"
                                    />
                                    {
                                        newAnswerIRCBlobs.get("answer" + i) &&
                                        <img className={"zoomImageHover"}
                                            src={newAnswerIRCBlobs.get("answer" + i)} />
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
                                            document.getElementById("answer" + i).click();
                                        }} />
                                        Upload
                                        <input type="file" hidden
                                            id={"answer" + i}
                                            onChange={(e) => {
                                                saveAnswerIRCImage(e, "answer" + i)
                                                setDummy(Math.random())
                                            }}
                                        />
                                    </Button>
                                </div>
                                <br />
                            </>
                        ))}
                        {(functionality == "Checkbox" ||
                            functionality == "Dropdown/Radio Button") &&
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    variant="outlined"
                                    disabled={
                                        (functionality == "Checkbox" ||
                                            functionality == "Dropdown/Radio Button")
                                            ? false : true}
                                    onClick={(e) => {
                                        let newAnsObj = sampleAnswerJSON
                                        let l0 = answerObj;
                                        l0.push(newAnsObj)
                                        setAnswerObj(l0)
                                        setDummy(Math.random())
                                    }}
                                >
                                    Add Option in Create Section
                                </Button>
                            </div>
                        }
                        {/* save the question and answers */}
                        <br />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                saveQuestionAnswer()
                            }}
                        >
                            Save this Question and Answer
                        </Button>  
                        
                    <Button
                            variant="outlined"
                            onClick={() => {
                                props.gobackFromAddQ()
                            }}
                        >
                            Close
                        </Button>    
                        </div>                  
                        <p style={{
                            display: "none"
                        }}>{dummy}</p>
                    </div>
                </>
            </Box>
        </div>
    );
};
export default AddQuestion