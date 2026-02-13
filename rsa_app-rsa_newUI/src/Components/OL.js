import React, { useEffect, useState } from "react";
import AxiosApp from "../common/AxiosApp";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Javascript } from "@mui/icons-material";
 
 
const db = new Dexie("QuestionDatabase");
db.version(1).stores({
  questions: "++id, q_id, ans",
});
 
export default function OL() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [details, setDetails] = useState([]);
 
//  call for offline
  const loadQuestionsFromDexie = async () => {
    try {
       
        console.log(db);
      const offlineData = await db.questions.toArray();
      console.log("first")
      setDetails(offlineData);
    } catch (error) {
      console.error("Error loading offline data:", error);
    }
  };
 
 
  const fetchAndSaveQuestions = async () => {
    try {
      const response = await AxiosApp.get("http://10.42.234.54:5000/check");
      const data = response?.data?.details || [];
 
      
      await db.questions.clear();
      await db.questions.bulkPut(data);
 
      setDetails(data);
    } catch (error) {
      console.error("Error fetching data from server:", error);
    }
  };
 
  
  const loadUsers = async () => {
    console.log("rrrrrrr")
    if (isOnline) {
      await fetchAndSaveQuestions();
    } else {
        console.log("Raghaaaaaaaaaaaavvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")
      await loadQuestionsFromDexie();
    }
  };
 
 
  if(isOnline){
    useEffect(() => {
        console.log(navigator.onLine)
        loadUsers();
      }, []);
     
  }

  else{
     loadQuestionsFromDexie();
    }
  
  // online/offline
  useEffect(() => {
    const updateOnlineStatus = async () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        await fetchAndSaveQuestions();
      }
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);
const t1=useLiveQuery(() => db.questions.toArray());
console.log(t1,'t1')
  return (
    <div>ttrtdfhgv
      {details.map((itm) => (
        <div key={itm.q_id}>
          <p>Question ID: {itm.q_id}</p>
          <div>
            <span>Options: </span>
            <div>
              {itm.ans.map((val, index) => (
                <span key={index}>{val} </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
 