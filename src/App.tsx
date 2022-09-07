import React, { useEffect, useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Button, Result } from 'antd';
import { CloudOutlined } from '@ant-design/icons'
import {
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";
import Map from "./components/Map"
import loadConfig from "./utils/loadConfig"
import submitGoogleForm from "./utils/submitGoogleForm"
import calcDistance from "./utils/calcDistance"
import getConferenceLatLng from "./utils/getConferenceLatLng"
import {LocationResult} from "./types";

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton
} from "react-share";

import {
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

const config = loadConfig()
const { modesOfTransport } = config

if (config.enablePreventRefresh) {
  window.onbeforeunload = () => config.preventRefreshText
}

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const co2 = queryParams.get('co2');

  const location = {
    label: config.conferenceLocation,
    value: {
      place_id: ""
    }
  }

  const [conferenceLocation, setCLoc] = useState<LocationResult | null>(location);
  const [conferenceLatLng, setConferenceLatLng] = useState({ lat: 0, lng: 0 })

  const [startLocation, setStartLocation] = useState<LocationResult | null>(null);

  const [distanceInKm, setDistanceInKm] = useState(0)
  const [carbon, setCarbon] = useState<number|null>(co2 ? parseFloat(co2) * 1000 : null)
  const [selectedMode, setSelectedMode] = useState<string|null>(null)

  const [showResult, setShowResult] = useState(!!co2)

  useEffect(() => {
    const requestLocationForConference = async () => {
      await new Promise(res => setTimeout(res, 1000))
      const conferenceLatLongResponse = await getConferenceLatLng(config.conferenceLocation)
      console.log({ conferenceLatLongResponse })
      if (conferenceLatLongResponse) {
        setConferenceLatLng(conferenceLatLongResponse)
      }
    }
    requestLocationForConference()
  }, [])

  const submitForm = async () => {
    if (selectedMode) {
      const carbonResult = await calcCarbon(selectedMode)

      // window.history.pushState("bananas?co2=345")

      setShowResult(true)
      const dataToBeSaved = {
        locationOfConference: typeof conferenceLocation === "string" ? conferenceLocation : conferenceLocation?.label,
        location: startLocation?.label,
        distance: Math.round(distanceInKm),
        modeOfTransport: selectedMode,
        carbon: Math.round(carbonResult),
        transportMultiplier: modesOfTransport?.find(({ type }) => type === selectedMode)?.carbon || 0,
        assumedDistance: Math.round(config.multiplier * distanceInKm),
      }
      console.log(dataToBeSaved)
      submitGoogleForm(dataToBeSaved)
    }
  }


  const Questions = () => {
    if (conferenceLocation === null) {
      return (
        <div>
          <h3>Where is the conference?</h3>
          <Map startLocation={conferenceLocation!} setLocation={setconferenceLocation} key="1" />
        </div>
      )
    }

    if (showResult === false) {
      return (
        <div>
          <h3>{config.locationQuestionText}</h3>
          <Map startLocation={startLocation!} setLocation={setLocation} key="2" />
          <h3>{config.transportQuestionText}</h3>
          <div style={{ display: "inline-block" }}>
            {modesOfTransport?.map(({ type }, index) =>
              <Button
                key={index}
                onClick={() => setSelectedMode(type)}
                type={selectedMode === type ? "primary" : "default"}
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

    const kgsOfCarbon = Math.round((carbon || 0) / 100) / 10

    return (
      <Result
        icon={<CloudOutlined />}
        title={config?.resultText?.replace("@carbon@", `${kgsOfCarbon}`)}
        subTitle={config.resultSubText}
        extra={[
          <div>
            <FacebookShareButton url={window.location.href}><FacebookIcon /></FacebookShareButton>
            <LinkedinShareButton url={window.location.href}><LinkedinIcon /></LinkedinShareButton>
            <TwitterShareButton hashtags={["AWS", "Sustainability"]} title={`I'm at @aerincloud's talk at "AWS Community Summit" and I used ${kgsOfCarbon}kg of co2 to travel here by ${selectedMode}!`} url="https://embue.co.uk"><TwitterIcon /></TwitterShareButton>
            <WhatsappShareButton url={window.location.href}><WhatsappIcon /></WhatsappShareButton>
          </div>,
          <Button onClick={() => {
            setShowResult(false)
            setStartLocation(null)
            setCarbon(0)
            setSelectedMode(null)
            setDistanceInKm(0)
          }} type="primary" key="console">
            Restart
          </Button>
        ]}
      />
    )
  }


  const setconferenceLocation = async (location: LocationResult) => {
    const [place] = await geocodeByPlaceId(location.value.place_id)
    const { lat, lng } = await getLatLng(place)
    setConferenceLatLng({ lat, lng })
    setCLoc(location)
  };

  const setLocation = async (location: LocationResult) => {
    console.log(location)

    const [placeData] = await geocodeByPlaceId(location.value.place_id)
    const { lat, lng } = await getLatLng(placeData)

    setStartLocation(location)
    setDistanceInKm(calcDistance(lat, lng, conferenceLatLng.lat, conferenceLatLng.lng) * 2)
  }

  const calcCarbon = async (selectedType: string) => {
    const carbonMultiplier = modesOfTransport?.find(({ type }) => type === selectedType)?.carbon || 0
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
