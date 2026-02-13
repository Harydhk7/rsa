import Dexie from "dexie";
const db = new Dexie("OfflineAppDB");
db.version(1).stores({
  users:
    "++id, first_name, last_name, department, designation, contact_number, alternate_number, email_id, role, state, district, file_name, fileImage",
  state: "state",
  district: "",
});

export default db;
