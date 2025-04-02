import { supabase } from "./supabaseClient";
import { useState, useEffect } from "react";
import "./YearGrid.css"; 

interface YearGridProps {
  session: any; // You might want to type `session` more specifically if you know the structure
}

const YearGrid = () => {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const totalCells = 12 * 31; // 12 months x 31 days grid
  const [entries, setEntries] = useState<Record<number, number>>(() => {
    const savedData = localStorage.getItem("yearEntries"); // get saved data from local storage
    return savedData ? JSON.parse(savedData) : {};
  });

  const colorScheme1 = ["#ccc", "#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"]; 
  const colorScheme2 = ["#b0b0b0", "#f68e6b", "#f7b32b", "#60b347", "#36a3d9", "#5e5b8d"];
  const colorScheme3 = ["#d1d1d1", "#e74c3c", "#f39c12", "#27ae60", "#2980b9", "#8e44ad"];
  const colorScheme4 = ["#bdbdbd", "#ff7f50", "#ffcc00", "#2ecc71", "#3498db", "#9b59b6"];
  const colorScheme5 = ["#d3d3d3", "#f44336", "#ffeb3b", "#4caf50", "#2196f3", "#9c27b0"];
  const colorScheme6 = ["#cfcfcf", "#e57373", "#ffb74d", "#81c784", "#64b5f6", "#ba68c8"];


  /* used this previously to change grid colors locally, now adding Postgres to persist color data instead
  const handleClick = (index: number) => {
    const newValue = ((entries[index] || 0) + 1) % 6; // Cycles from 0-5
    setEntries({ ...entries, [index]: newValue });
    localStorage.setItem("yearEntries", JSON.stringify({ ...entries, [index]: newValue }));
  }; */

  const handleClick = async (day: number, month: number, color: number) => {
    const user = await supabase.auth.getUser();
    if (!user) return alert("Please log in!");
  
    await supabase
      .from("colors")
      .upsert([{ user_id: user.id, day, month, color }], { onConflict: ["user_id", "month", "day"] });
  };

  useEffect(() => {
    const fetchColors = async () => {
      const user = await supabase.auth.getUser();
      if (!user) return;
  
      let { data, error } = await supabase
        .from("colors")
        .select("*")
        .eq("user_id", user.id);
  
      if (data) {
        const colorMap = data.reduce((acc, entry) => {
          acc[`${entry.month}-${entry.day}`] = entry.color;
          return acc;
        }, {});
        setEntries(colorMap);
      }
    };
  
    fetchColors();
  }, []);  

  return (
    <div className="grid-wrapper">
      <h1 className="page-header">A Year in Color</h1>
      <div className="grid">
      <div className="month-row">
  <div className="empty-cell"></div> {/* Space for row numbers */}
  {months.map((month, index) => (
    <div key={index} className="month-header">{month}</div>
  ))}
</div>


        <div className="grid-content">
          {days.map((day) => (
            <div key={day} className="row">
              <div className="day-label">{day}</div>
              {Array.from({ length: 12 }).map((_, monthIndex) => {
                const index = (day - 1) * 12 + monthIndex;
                return (
                  <div
                    key={index}
                    className="day-cell"
                    style={{ backgroundColor: colorScheme4[entries[index] || 0] }}
                    onClick={() => handleClick(index)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearGrid;
