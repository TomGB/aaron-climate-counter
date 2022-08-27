import {
  geocodeByPlaceId,
  getLatLng,
  geocodeByAddress,
} from "react-google-places-autocomplete";

const getConferenceLatLng = async (conferenceLocation) => {
  try {
    const [conferenceGeoCode] = await geocodeByAddress(conferenceLocation);
    const [place] = await geocodeByPlaceId(conferenceGeoCode.place_id);
    const { lat, lng } = await getLatLng(place);
    return { lat, lng };
  } catch (error) {
    console.log(error);
  }
};

export default getConferenceLatLng;
