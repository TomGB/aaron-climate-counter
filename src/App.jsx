import React, { useEffect, useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Button, Result } from 'antd';
import { CloudOutlined } from '@ant-design/icons'
import {
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";
import Map from "./Map"
import loadConfig from "./loadConfig"
import submitGoogleForm from "./submitGoogleForm"
import calcDistance from "./calcDistance"
import getConferenceLatLng from "./getConferenceLatLng"

const config = loadConfig()
const { modesOfTransport } = config

if (config.enablePreventRefresh) {
  window.onbeforeunload = () => config.preventRefreshText
}

function App() {
  const [conferenceLocation, setCLoc] = useState(config.conferenceLocation);
  const [conferenceLatLng, setConferenceLatLng] = useState({})

  const [startLocation, setStartLocation] = useState(null);

  const [distanceInKm, setDistanceInKm] = useState(0)
  const [carbon, setCarbon] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)

  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const requestLocationForConference = async () => {
      await new Promise(res => setTimeout(res, 1000))
      const conferenceLatLongResponse = await getConferenceLatLng(config.conferenceLocation)
      console.log({ conferenceLatLongResponse })
      setConferenceLatLng(conferenceLatLongResponse)
    }
    requestLocationForConference()
  }, [])

  const submitForm = async () => {
    const carbonResult = await calcCarbon(selectedMode)
    setShowResult(true)
    const dataToBeSaved = {
      locationOfConference: typeof conferenceLocation === "string" ? conferenceLocation : conferenceLocation.label,
      location: startLocation.label,
      distance: Math.round(distanceInKm),
      modeOfTransport: selectedMode,
      carbon: Math.round(carbonResult),
    }
    console.log(dataToBeSaved)
    submitGoogleForm(dataToBeSaved)
  }


  const Questions = () => {
    if (conferenceLocation === null) {
      return (
        <div>
          <h3>Where is the conference?</h3>
          <Map startLocation={conferenceLocation} setLocation={setconferenceLocation} key="1" />
        </div>
      )
    }

    if (showResult === false) {
      return (
        <div>
          <h3>{config.locationQuestionText}</h3>
          <Map startLocation={startLocation} setLocation={setLocation} key="2" />
          <h3>{config.transportQuestionText}</h3>
          <div style={{ display: "inline-block" }}>
            {modesOfTransport.map(({ type }, index) =>
              <Button
                key={index}
                onClick={() => setSelectedMode(type)}
                type={selectedMode === type ? "primary" : "secondary"}
                className={`transport-button ${type === "other" && "bike"}`}
              >
                <img src={`icons/${type}.svg`} alt={`${type}-icon`} />
                {type}
              </Button>
            )}
          </div>
          <br />
          <Button onClick={submitForm} type="primary" disabled={selectedMode === null || startLocation === null}>Submit</Button>
        </div>
      )
    }

    return (
      <Result
        icon={<CloudOutlined />}
        title={config.resultText.replace("@carbon@", Math.round(carbon / 100) / 10)}
        subTitle={config.resultSubText}
        extra={[
          <Button onClick={() => {
            setShowResult(false)
            setStartLocation(null)
            setCarbon(0)
            setSelectedMode(null)
            setDistanceInKm(null)
          }} type="primary" key="console">
            Restart
          </Button>
        ]}
      />
    )
  }


  const setconferenceLocation = async (location) => {
    const [place] = await geocodeByPlaceId(location.value.place_id)
    const { lat, lng } = await getLatLng(place)
    setConferenceLatLng({ lat, lng })
    setCLoc(location)
  };

  const setLocation = async (location: string) => {
    console.log(location)

    const [placeData] = await geocodeByPlaceId(location.value.place_id)
    const { lat, lng } = await getLatLng(placeData)

    setStartLocation(location)
    setDistanceInKm(calcDistance(lat, lng, conferenceLatLng.lat, conferenceLatLng.lng) * 2)
  }

  const calcCarbon = async (selectedType) => {
    const carbonMultiplier = modesOfTransport.find(({ type }) => type === selectedType).carbon
    const carbonRes = distanceInKm * carbonMultiplier
    await setCarbon(carbonRes)
    return carbonRes
  }

  return (
    <div className="App" style={{ textAlign: "center" }}>
      <header className="App-header">
        <div style={{ marginBottom: "auto" }}>
          <img alt="embue-logo" src="embue.webp" style={{
            display: "inline-block",
            verticalAlign: "middle"
          }} />
          <h1 className="company-name">Embue</h1>
        </div>

        <div style={{ marginBottom: "auto" }}>
          <Questions />
        </div>
      </header>
    </div>
  );
}

export default App;
