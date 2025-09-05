import React from "react";
import DataTable from "./components/DataTable";
import { columns } from "./columns";
import data from "./data.json"; 
import "./index.css";

export default function App() {
  return (
    <div className="container">
      <h1>User Data Table</h1>
      <DataTable data={data.users} columns={columns} pageSize={10} />
    </div>
  );
}
