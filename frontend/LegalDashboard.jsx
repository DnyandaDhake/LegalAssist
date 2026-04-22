import GaugeChart from "react-gauge-chart";
import { useEffect, useState } from "react";

function LegalDashboard() {
  const [data, setData] = useState({
    overall_risk: 0,
    overall_compliance: 100
  });

  useEffect(() => {
    fetch("http://:5000/dashboard/kpi", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(result => setData(result));
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      
      <div>
        <h3>Overall Compliance</h3>
        <GaugeChart
          id="compliance"
          percent={data.overall_compliance / 100}
          colors={["#FF0000", "#FFBF00", "#00C851"]}
        />
        <h2>{data.overall_compliance}%</h2>
      </div>

      <div>
        <h3>Overall Legal Risk</h3>
        <GaugeChart
          id="risk"
          percent={data.overall_risk / 100}
          colors={["#00C851", "#FFBF00", "#FF0000"]}
        />
        <h2>{data.overall_risk}%</h2>
      </div>

    </div>
  );
}

export default LegalDashboard;
