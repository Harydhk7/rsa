import axios from "axios";
import { toast } from "react-toastify";
const AxiosApp = axios.create();
//in the request we can use session mgmt HANDLE IT HERE
AxiosApp.interceptors.request.use(
  (config) => {
    config.created_by = localStorage.getItem("rsa_user");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
AxiosApp.interceptors.response.use(
  (response) => {
    console.log("success");
    if (!response.request.responseURL.includes("login") && false) {
      let l3 = window.location.origin + window.location.pathname;
      window.location.assign(l3);
    } else {
      if (parseInt(response.data.statusCode) != 200) {
        if (
          !response.request.responseURL.includes("userlist_img") ||
          !response.request.responseURL.includes("scene_img_names") //dont show if no images
        )
          //comment here if dont need to show messages from api exception
          toast.warning(`${response.data.message}`, {
            autoClose: true,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
          });
      }
      return response;
    }
  },
  (error) => {
    window.alert("Sorry, we faced trouble in reaching our servers")
    window.location.reload()
    return Promise.reject(error);    
  }
);

export default AxiosApp;
