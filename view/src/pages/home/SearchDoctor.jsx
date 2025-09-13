import React from "react";
import DoctorSearch from "../../components/home/DoctorSearch";

const SearchDoctorPage = () => {
  return (
    <div>
      <main style={{ paddingTop: "100px", minHeight: "80vh" }}>
        <DoctorSearch />
      </main>
    </div>
  );
};

export default SearchDoctorPage;