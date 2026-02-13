import React, { Component } from 'react';
import AxiosApp from '../../common/AxiosApp';
import JSZip from 'jszip';
import { url1 } from '../../App';
import { Button } from '@mui/material';
// import CustomAlerts from '../CustomAlerts';
// import CustomLoader from '../../components/customLoader';
// import DeleteConfirm from 'src/components/DeleteConfirm';

export let styl21 = {};
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
     height: '60%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
export default class LocCap extends Component {

    fileObj = [];
    fileArray = []; inameArray = [];
    fileVideoArray = []; vnameArray = []
    fileAudioArray = [];audioArray=[];

    constructor(props) {
        super(props)
        this.state = {
            file: [null],
            imgFlag: true,
            vidFlag: true,
            audFlag:true,
            dummy: '',
            formDataState: new FormData(),
            alert: '',
            isOpenLoading: false,
            showDelete: false, dataToDelete: []
        }
        this.uploadMultipleFiles = this.uploadMultipleFiles.bind(this)
    }

    uploadMultipleFiles(e) {
        let formData = new FormData();    //formdata object
        this.fileObj = [];
        this.fileObj.push(e.target.files)
        let imagesFiles = [];

        for (let i = 0; i < this.fileObj[0].length; i++) {
            // Allowing file type
            let filePath = this.fileObj[0][i].name.toLocaleLowerCase();
            // let allowedExtensions = 
            //         /(\.jpg|\.jpeg|\.png|\.gif)$/i;
            // let fileInput = 
            //         document.getElementById('scenediagramImgVid');
            // if (!allowedExtensions.exec(filePath)) {
            //     this.setState({alert:"error1"},()=>{})    
            //     localStorage.setItem("alertOpen",true)
            //     fileInput.value = '';
            //     return false;
            // } 

            formData.append(this.fileObj[0][i].name, this.fileObj[0][i]);
            imagesFiles.push(this.fileObj[0][i].name);

            if (/\.(jpe?g|png|gif|webp)$/i.test(this.fileObj[0][i].name.toLocaleLowerCase())) {
                this.fileArray.push(URL.createObjectURL(this.fileObj[0][i]))
                this.inameArray.push(this.fileObj[0][i].name)
            }
            else if (/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(this.fileObj[0][i].name.toLocaleLowerCase())){
                this.fileVideoArray.push(URL.createObjectURL(this.fileObj[0][i]))
                this.vnameArray.push(this.fileObj[0][i].name)
            }
            else if (/\.(mp3|wav|ogg|oga|aac|m4a|flac)$/i.test(this.fileObj[0][i].name.toLocaleLowerCase())){
                this.fileAudioArray.push(URL.createObjectURL(this.fileObj[0][i]))
                this.audioArray.push(this.fileObj[0][i].name)
            } 
            else {
                //ignore
            }
        }
        this.setState({ file: [...this.fileArray, ...this.fileVideoArray, ...this.fileAudioArray] })


        formData.append('filename', JSON.stringify(imagesFiles));   //append the values with key, value pair
        formData.append('audit_id', this.props.id);
        console.log(formData);

        this.onSubmit(formData);
    }
    onSubmit = (f1) => {
        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        }
        this.setState({ isOpenLoading: true }, () => { })
        AxiosApp.post(url1 + "location_capture", f1, config)
            .then(response => {
                if (response.statusCode != "100") {
                    this.setState({ alert: "success" }, () => { })

                    localStorage.setItem("alertOpen", true)
                    this.setState({ formDataState: f1 }, () => { })
                    if (this.fileArray.length > 0) {
                        this.setState({ imgFlag: false })
                    }
                    if (this.fileVideoArray.length > 0) {
                        this.setState({ vidFlag: false })
                    }
                    if (this.fileAudioArray.length > 0) {
                        this.setState({ audFlag: false })
                    }
                    this.setState({ isOpenLoading: false }, () => { })
                } else {
                    this.setState({ isOpenLoading: false }, () => { })
                    this.setState({ alert: "error" }, () => { })
                }
            })
            .catch(error => {
                console.log(error);
                this.setState({ isOpenLoading: false }, () => { })
            });
    }
    asZip = () => {
        //remove this line once server api is tested and update the correct caseid
        //return;
        this.setState({ isOpenLoading: true }, () => { })
        AxiosApp.post(
            url1 + 'location_capture_get', {
            "audit_id": this.props.id
        },
            {
                responseType: 'arraybuffer',
                contentType: 'application/zip'
            }
        ).then(data => {
            this.setState({ isOpenLoading: false }, () => { })
            JSZip.loadAsync(data.data)
                .then(zip => {
                    // Filter the files to only include image files
                    const imageFiles = Object.keys(zip.files)
                        .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename.toLocaleLowerCase()));

                    // Read each image file
                    let count = 0;
                    imageFiles.forEach((filename, index) => {
                        zip.file(filename)
                            .async('blob')
                            .then(blob => {
                                this.fileArray.push(URL.createObjectURL(blob))
                                this.setState({ imgFlag: false }, () => { })
                                this.inameArray.push(filename)
                                //this.setState({ file: this.fileArray },()=>{})
                            });
                    });

                    //For Video files
                    // Filter the files to only include image files
                    const vFiles = Object.keys(zip.files)
                        .filter(filename => /.(WEBM|MPG|MP2|MPEG|MPE|MPV|OGG|MP4|M4P|M4V|AVI|WMV|MOV|QT|FLV|SWF|AVCHD)$/i.test(filename.toLocaleUpperCase()));

                    // Read each video file
                    count = 0;

                    vFiles.forEach((filename, index) => {
                        zip.file(filename)
                            .async('blob')
                            .then(blob => {
                                //   let v1 = document.createElement("video");
                                //   v1.width=300;
                                //   v1.className="pr-2"
                                //   v1.controls=true;                     
                                //   let v = document.createElement('source');
                                //   v.id = "video" + count++;
                                //   v.setAttribute("width","300px")                      
                                //   v.setAttribute("height","300px")                                           
                                //   v.setAttribute("type","video/mp4")
                                //   v.src = URL.createObjectURL(blob); 
                                //   v1.appendChild(v);

                                //   let all = document.getElementById("allVideos")
                                //   all.appendChild(v1)
                                this.fileVideoArray.push(URL.createObjectURL(blob))
                                this.setState({ vidFlag: false }, () => { })
                                this.vnameArray.push(filename)
                                //this.setState({ file: this.fileVideoArray },()=>{})                  
                            });
                    });

                    count = 0;
                    const audioFiles = Object.keys(zip.files)
                        .filter(filename => /\.(mp3|wav|ogg|oga|aac|m4a|flac)$/i.test(filename.toLocaleLowerCase()));

                    // Read each audio file
                    audioFiles.forEach((filename, index) => {
                        zip.file(filename)
                            .async('blob')
                            .then(blob => {
                                this.fileAudioArray.push(URL.createObjectURL(blob))
                                this.setState({ audFlag: false }, () => { })
                                this.audioArray.push(filename)
                                //this.setState({ file: this.fileArray },()=>{})
                            });
                    });
                })
                .catch(e => {
                    console.log(e)
                    this.setState({ isOpenLoading: false }, () => { })
                })
        })
            .catch(error => {
                console.error(error)
                this.setState({ isOpenLoading: false }, () => { })
            });
    }
    componentDidMount = () => {
        // stopBack()
        this.asZip();
    }
    showImage = (url) => {
        //window.alert("show the image here")
    }
    onDeleteImage = (i) => {
        //set state to show deleteconfirm
        this.setState({ showDelete: true }, () => { })
        this.setState({ dataToDelete: [i] })
    }
    deleteorNot = (answer) => {
        this.setState({ showDelete: false }, () => { })
        if (answer == 'yes') {
            this.onDeleteImageYes(...this.state.dataToDelete)
        }
    }
    onDeleteImageYes = (i) => {
        //window.alert(" send this image" + this.inameArray[i] + " to delete api")
        const config = {
            "caseid": localStorage.getItem("caseid"),
            "filenames": this.inameArray[i]
        }
        AxiosApp.post(url1 + "/delete_other_image", config)
            .then(response => {
                this.setState({ alert: "success1" }, () => { })
                localStorage.setItem("alertOpen", true)
                //delete in this.fileArray and this.inameArray;
                this.fileArray.splice(i, 1)
                this.inameArray.splice(i, 1)
                this.setState({ dummy: Math.random() })
                if (this.fileArray.length == 0) {
                    this.setState({ imgFlag: true })
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    onDeleteVideo = (i) => {
        //window.alert(" send this video" + this.vnameArray[i] + " to delete api")
        const config = {
            "caseid": localStorage.getItem("caseid"),
            "filenames": this.vnameArray[i]
        }
        AxiosApp.post(url1 + "/delete_other_image", config)
            .then(response => {
                this.setState({ alert: "success2" }, () => { })
                localStorage.setItem("alertOpen", true)
                //delete in this.fileVideoArray and this.vnameArray;
                this.fileVideoArray.splice(i, 1)
                this.vnameArray.splice(i, 1)
                this.setState({ dummy: Math.random() })
                if (this.fileVideoArray.length == 0) {
                    this.setState({ vidFlag: true })
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    onClose = () => {
        this.props.callChildBack(true)
    }
    render() {
        return (
            <div>
                <div style={{ marginBottom: 40 }}>
                     <center><h3>Additional images for {this.props.id}</h3></center>
                    <form>

                        <h4 hidden={this.state.imgFlag}> Uploaded images </h4>
                        <div style={
                            {
                                display: "flex",
                                justifyContent: "around"
                            }
                        }>
                            {(this.fileArray || []).map((url, i) => (

                                <div className='baseImageProject'>
                                    <img key={url} src={url} alt="..." />
                                    <button type="button" title="Delete this Image" class="overlapDeleteButton btn btn-danger" onClick={() => this.onDeleteImage(i, url)}>X</button>
                                </div>

                                //try2
                                // <div className="baseImageProject"><img key={url} src={url} alt="..." />
                                // <img className="overlapDeleteButton" src={"src/assets/images/pink_icon.png"}></img></div>

                                //try1
                                // <div className='d-flex flex-col'>
                                //     <div className="baseImageProject">
                                //     <img key={url} src={url} alt="..." />
                                //     <img className="overlapDeleteButton"></img>
                                // </div>
                                // </div>
                            ))}
                            {this.fileArray.length == 0 && 
                            <span> No Image Files</span>}
                            </div>
                        <br />
                        <h4 hidden={this.state.vidFlag}> Uploaded videos </h4>
                        <div style={
                            {
                                display: "flex",
                                justifyContent: "around"
                            }
                        }>
                            {(this.fileVideoArray || []).map((url, i) => (
                                <div className='baseImageProject'>
                                    <video controls width="300px" className="pr-2">
                                        <source width="300px" height="300px" type="video/mp4" src={url} alt="..." />
                                    </video>
                                    <button type="button" title="Delete this Image" class="overlapDeleteButton btn btn-danger" onClick={() => this.onDeleteVideo(i, url)}>X</button>

                                    {/* <video controls width="300px" className="pr-2">
                            <source width="300px" height="300px" type="video/mp4" src={url} alt="..." />
                        </video> */}
                                </div>
                            ))}
                            {this.fileVideoArray.length == 0 && 
                            <span> No Video Files</span>}
                        </div>
                        <br />
                        <h4 hidden={this.state.audFlag}> Uploaded Audios </h4>
                        <div style={
                            {
                                display: "flex",
                                justifyContent: "around"
                            }
                        }>
                            {(this.fileAudioArray || []).map((url, i) => (
                                <div className='baseImageProject'>
                                    <audio controls width="300px" className="pr-2">
                                        <source width="300px" height="300px" type="audio/mp3" src={url} alt="..." />
                                    </audio>
                                    <button type="button" title="Delete this Image" class="overlapDeleteButton btn btn-danger" onClick={() => this.onDeleteVideo(i, url)}>X</button>

                                    {/* <video controls width="300px" className="pr-2">
                            <source width="300px" height="300px" type="video/mp4" src={url} alt="..." />
                        </video> */}
                                </div>
                            ))}
                            {this.fileAudioArray.length == 0 && 
                            <span> No Audio Files</span>}
                        </div>
                        <br />
                        {!this.props.view && <div className='d-flex justify-content-around'>
                            <Button
                                variant='contained'
                                onClick={(e) => {
                                    document.getElementById("scenediagramImgVid").click();
                                }}
                            >
                                Choose files ...
                            </Button>
                            <span> Upload only audio/ video or image files.</span>
                            <div className="form-group d-flex flex-col">
                                <input type="file" style={{ display: "none" }}
                                    className="form-control" id="scenediagramImgVid" onChange={this.uploadMultipleFiles} multiple />
                            </div>
                            <br/>
                            <div className='d-flex justify-content-around'>
                                <Button variant="contained" onClick={this.onClose} className="px-4">Close</Button>
                            </div>
                        </div>}
                        <br />
                    </form>
                    {/* {
        this.state.alert == "success" &&
        <CustomAlerts  severity={this.state.alert} msg={"Other image uploaded successfully"}/>    
        }
        {
        this.state.alert == "success1" &&
        <CustomAlerts  severity={"success"} msg={"Other image deleted successfully"}/>    
        }
        {
        this.state.alert == "success2" &&
        <CustomAlerts  severity={"success"} msg={"Scene video deleted successfully"}/>    
        }
        {
        this.state.alert == "error" &&
        <CustomAlerts  severity={this.state.alert} msg={"Failed to update scene images"}/>    
        } */}

                </div>
                {/* {
        this.state.showDelete == true &&
        <DeleteConfirm show="true" parentForDelete={this.deleteorNot}/>    
        }   */}
            </div>
        )
    }
}