
export const GlobalDebug = (function () {
  return function () {
        console = {};
        console.log = function () {};
        console.info = function () {};
        console.warn = function () {};
        console.error = function () {}; 
        // if(localStorage.getItem("isloggedin") == "false"){
        //   let l1 = window.location.origin;
        //   window.close();
        //   window.open(l1)
        // }
  };
})();