import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const Map = ({ startLocation, setLocation }) => (
  <div style={{ maxWidth: "500px", width: "100%", height: "100px", display: "inline-block"}}>
    <GooglePlacesAutocomplete
      apiKey="AIzaSyDj9Mt1pAsivlfxn1rjZVmlL7z1Z992xxI"
      selectProps={{
        startLocation,
        onChange: setLocation,
        placeholder: "Search...",
        noOptionsMessage: () => null,
      }}
    />
  </div>
);

export default Map;
