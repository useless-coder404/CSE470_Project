import React from "react";
import HeroSection from "../../components/home/HeroSection";
import FeatureCards from "../../components/home/FeatureCards";
import DoctorSearch from "../../components/home/DoctorSearch";

function Home() {
  return (
    <main>
      <HeroSection />
      <FeatureCards />
      <DoctorSearch />
    </main>
  );
}

export default Home;
