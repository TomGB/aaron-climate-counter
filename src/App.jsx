import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import Map from "./Map.jsx"
import { Button, Result } from 'antd';
import { CloudOutlined } from '@ant-design/icons'
import { geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

// https://www.winacc.org.uk/downloads/STAP/Shorter_Transport%20Emissions%20Report_110328.pdf
// https://www.statista.com/statistics/1233337/carbon-footprint-of-travel-per-kilometer-by-mode-of-transport-uk/

const carbonPlanePerKm = 254
const carbonTrainPerKm = 68
const carbonBusPerKm = 36
const carbonCarPerKm = 240
const carbonElectricCarPerKm = 54.77

const submitForm = async ({
  locationOfConference,
  location,
  distance,
  modeOfTransport,
  carbon,
}) => {
  await fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSfILQKSwqJfUAZrj-ZLVILqW7taf2PIE1S8PBsK4_aTbh3HLQ/formResponse", {
    "credentials": "include",
    "headers": {
        // "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:103.0) Gecko/20100101 Firefox/103.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded",
        // "Alt-Used": "docs.google.com",
        // "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1"
    },
    "referrer": "https://docs.google.com/forms/d/e/1FAIpQLSfILQKSwqJfUAZrj-ZLVILqW7taf2PIE1S8PBsK4_aTbh3HLQ/viewform?fbzx=1164834417680335055",
    "body": `entry.2134495526=${encodeURIComponent(locationOfConference)}&entry.1444378660=${encodeURIComponent(location)}&entry.89429071=${encodeURIComponent(modeOfTransport)}&entry.1572327125=${encodeURIComponent(distance)}&entry.459287063=${encodeURIComponent(carbon)}`,
    "method": "POST",
    "mode": "cors"
});
}

function toRad(Value) {
  return Value * Math.PI / 180;
}

function calcDistance(lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

function App() {
  const [conferenceLocation, setCLoc] = useState(null);
  const [startLocation, setStartLocation] = useState(null);

  const [conferenceLat, setConferenceLat] = useState(0)
  const [conferenceLng, setConferenceLng] = useState(0)

  const [distanceInKm, setDistanceInKm] = useState(0)
  const [carbon, setCarbon] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)

  const [showResult, setShowResult] = useState(false)

  const setconferenceLocation = async (location) => {
    const [place] = await geocodeByPlaceId(location.value.place_id)
    const{ lat, lng } = await getLatLng(place)

    setConferenceLat(lat)
    setConferenceLng(lng)

    setCLoc(location)
  };

  const setupSetLocation = (setStartLocation) => {
    const setLocation = async (location: string) => {
      console.log(location)
  
      const [placeData] = await geocodeByPlaceId(location.value.place_id)
      const { lat, lng } = await getLatLng(placeData)
  
      console.log({ lat, lng })

      console.log({ lat, lng, conferenceLat, conferenceLng })
  
      setDistanceInKm(calcDistance(lat, lng, conferenceLat, conferenceLng) * 2)
      setStartLocation(location)
    }
  
    return setLocation;
  }

  const calcCarbon = async (type) => {
    let carbonRes = 0

    switch (type) {
      case "car":
        carbonRes = distanceInKm * carbonCarPerKm
        await setCarbon(carbonRes)
        return carbonRes
      case "plane":
        carbonRes = distanceInKm * carbonPlanePerKm
        await setCarbon(carbonRes)
        return carbonRes
      case "electric":
        carbonRes = distanceInKm * carbonElectricCarPerKm
        await setCarbon(carbonRes)
        return carbonRes
      case "train":
        carbonRes = distanceInKm * carbonTrainPerKm
        await setCarbon(carbonRes)
        return carbonRes
      case "bus":
        carbonRes = distanceInKm * carbonBusPerKm
        await setCarbon(carbonRes)
        return carbonRes
      default:
        console.log("other")
    }
  }

  const setLocation =  setupSetLocation(setStartLocation);

  return (
    <div className="App" style={{ textAlign: "center" }}>
      <header className="App-header">
        <div style={{ marginBottom: "auto" }}>
          <img alt="embue-logo" src="embue.webp" style={{
            display:"inline-block",
            verticalAlign: "middle"
          }} />
          <h1 style={{ margin: "0px", color: "#374F5F", paddingLeft: "20px", display:"inline-block", verticalAlign: "middle" }}>Embue</h1>
        </div>

        <div style={{marginBottom: "auto"}}>
          {conferenceLocation == null ?
            <div>
              <h3>Where is the conference?</h3>
              <Map startLocation={conferenceLocation} setLocation={setconferenceLocation} key="1"/>
            </div>
          :
          showResult === true ?
            <Result
            icon={<CloudOutlined />}
            title={`You produced ${Math.round(carbon / 1000)} Kg of CO₂`}
            subTitle="Thanks and enjoy the conference."
            extra={[
              <Button onClick={() => {
                setShowResult(false)
                setStartLocation(null)
                setCarbon(0)
                setSelectedMode(null)
                setDistanceInKm(null)
              }}type="primary" key="console">
                Restart
              </Button>
            ]}
          />
        :
          <div>
            <h3>Where are you visiting this conference from?</h3>
            <Map startLocation={startLocation} setLocation={setLocation} key="2"/>
            <h3>What was your main mode of transport?</h3>
            <div style={{ display: "inline-block" }}>
              <Button onClick={() => setSelectedMode("plane")} type={selectedMode === "plane" ? "primary" : "secondary"} className="transport-button"><img src="icons/plane.svg" alt="plane-icon"/>Plane</Button>
              <Button onClick={() => setSelectedMode("car")} type={selectedMode === "car" ? "primary" : "secondary"} className="transport-button"><img src="icons/car.svg" alt="plane-icon"/>Car</Button>
              <Button onClick={() => setSelectedMode("electric")} type={selectedMode === "electric" ? "primary" : "secondary"} className="transport-button"><img src="icons/car.svg" alt="plane-icon"/>Electric</Button>
              <Button onClick={() => setSelectedMode("bus")} type={selectedMode === "bus" ? "primary" : "secondary"} className="transport-button"><img src="icons/bus.svg" alt="plane-icon"/>Bus</Button>
              <Button onClick={() => setSelectedMode("train")} type={selectedMode === "train" ? "primary" : "secondary"} className="transport-button"><img src="icons/train.svg" alt="plane-icon"/>Train</Button>
            </div>
            <br />
            <Button onClick={async () => {
              const carbonResult = await calcCarbon(selectedMode)
              setShowResult(true)
              console.log({
                location: startLocation.label,
                distance: Math.round(distanceInKm),
                modeOfTransport: selectedMode,
                carbon: Math.round(carbonResult),
              })

              submitForm({
                locationOfConference: conferenceLocation.label,
                location: startLocation.label,
                distance: Math.round(distanceInKm),
                modeOfTransport: selectedMode,
                carbon: Math.round(carbonResult),
              })
            }} type="primary" disabled={selectedMode === null || startLocation === null}>Submit</Button>
          </div>
        }
        </div>
      </header>
    </div>
  );
}

export default App;
