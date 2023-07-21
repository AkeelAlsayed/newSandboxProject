import "./styles.css";
import React, { useState, useEffect } from "react";

export default function App() {
  const [state, setState] = useState({
    fName: "",
    lName: "",
    selectedNumber: "",
    selectedAudio: "",
    selectedTranslation: ""
  });
  const [editionsWithAudio, setEditionsWithAudio] = useState([]);
  const [editionsWithTranslation, setEditionsWithTranslation] = useState([]);
  const [surahData, setSurahData] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const audioResponse = await fetch(
          "https://api.alquran.cloud/v1/edition/format/audio"
        );
        const audioData = await audioResponse.json();
        setEditionsWithAudio(audioData.data);

        const translationResponse = await fetch(
          "https://api.alquran.cloud/v1/edition/type/translation"
        );
        const translationData = await translationResponse.json();
        setEditionsWithTranslation(translationData.data);
      } catch (error) {
        console.error("Error fetching editions data:", error);
        setEditionsWithAudio([]);
        setEditionsWithTranslation([]);
      }
    };

    fetchEditions();
  }, []);

  useEffect(() => {
    const fetchSurahData = async () => {
      if (state.selectedNumber !== "") {
        try {
          const editions = [
            state.selectedAudio,
            state.selectedTranslation
          ].filter(Boolean);

          const surahDataArray = await Promise.all(
            editions.map(async (edition) => {
              const response = await fetch(
                `https://api.alquran.cloud/v1/surah/${state.selectedNumber}/editions/${edition}`
              );
              const data = await response.json();
              return data.data;
            })
          );

          setSurahData(surahDataArray.flat());
        } catch (error) {
          console.error("Error fetching surah data:", error);
          setSurahData([]);
        }
      }
    };

    fetchSurahData();
  }, [state.selectedNumber, state.selectedAudio, state.selectedTranslation]);

  console.log(editionsWithAudio);
  // console.log(editionsWithTranslation);
  console.log(surahData);

  return (
    <div className="App">
      <h1>The Holy Quran</h1>
      <select name="selectedNumber" onChange={handleChange}>
        <option value="">Select a number</option>
        {Array.from({ length: 114 }, (_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
      {editionsWithAudio.length > 0 && (
        <select name="selectedAudio" onChange={handleChange}>
          <option value="">Select an audio edition</option>
          {editionsWithAudio.map((edition) => (
            <option key={edition.identifier} value={edition.identifier}>
              {edition.name}
            </option>
          ))}
        </select>
      )}
      {editionsWithTranslation.length > 0 && (
        <select name="selectedTranslation" onChange={handleChange}>
          <option value="">Select a translation edition</option>
          {editionsWithTranslation.map((edition) => (
            <option key={edition.identifier} value={edition.identifier}>
              {edition.name}
            </option>
          ))}
        </select>
      )}
      {surahData.length > 0 ? (
        surahData.map((data) => (
          <div key={data.identifier}>
            <h2>Surah Name: {data.name}</h2>
            <p>English Name: {data.englishName}</p>
            <p>English Name Translation: {data.englishNameTranslation}</p>
            <p>Revelation Type: {data.revelationType}</p>
            <p>Number of Verses: {data.numberOfAyahs}</p>
            <hr />
          </div>
        ))
      ) : (
        <h2>No data available for selected Surah</h2>
      )}
    </div>
  );
}
