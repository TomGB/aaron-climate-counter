import mapValues from "lodash.mapvalues";

const submitGoogleForm = async (input) => {
  const { locationOfConference, location, modeOfTransport, distance, carbon } =
    mapValues(input, encodeURIComponent);

  const body = [
    `entry.2134495526=${locationOfConference}`,
    `entry.1444378660=${location}`,
    `entry.89429071=${modeOfTransport}`,
    `entry.1572327125=${distance}`,
    `entry.459287063=${carbon}`,
  ].join("&");

  console.log(body);

  await fetch(
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfILQKSwqJfUAZrj-ZLVILqW7taf2PIE1S8PBsK4_aTbh3HLQ/formResponse",
    {
      credentials: "include",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
      },
      referrer:
        "https://docs.google.com/forms/d/e/1FAIpQLSfILQKSwqJfUAZrj-ZLVILqW7taf2PIE1S8PBsK4_aTbh3HLQ/viewform?fbzx=1164834417680335055",
      body: body,
      method: "POST",
      mode: "cors",
    }
  );
};

export default submitGoogleForm;
