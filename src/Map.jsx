import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const Map = ({ startLocation, setLocation }) => (
  <div style={{ maxWidth: "500px", width: "100%", height: "100px", display: "inline-block" }}>
    <GooglePlacesAutocomplete
      apiKey="AIzaSyDj9Mt1pAsivlfxn1rjZVmlL7z1Z992xxI"
      selectProps={{
        value: startLocation,
        onChange: setLocation,
        placeholder: "Type to search",
        noOptionsMessage: () => null,
      }}
    />
  </div>
);

export default Map;
