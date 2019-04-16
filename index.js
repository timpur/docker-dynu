const { URLSearchParams } = require("url");
const fetch = require("node-fetch");

const getWanIp = async (ipv6 = false) => {
  const url = ipv6 ? "https://api6.ipify.org?format=json" : "https://api.ipify.org?format=json";
  const result = await fetch(url);
  const { ip } = await result.json();
  if (!ip) return null;
  if (ipv6 && ip.includes(".")) return null;
  return ip;
};

let previousIP = { ipv4: null, ipv6: null };
const ipHasChanged = (ipv4, ipv6) => {
  let result = false;
  if (previousIP.ipv4 !== ipv4) result = true;
  if (previousIP.ipv6 !== ipv6) result = true;
  previousIP = { ipv4, ipv6 };
  return result;
};

const convertStatus = status => {
  if (status.includes("good")) return "IP updated successfully";
  if (status.includes("nochg")) return "IP did not changed";
  if (status.includes("nohost")) return "No host param";
  if (status.includes("badauth")) return "Bad Authentication";
  if (status.includes("donator")) return "Feature not supported by account type";
  if (status.includes("abuse")) return "Username is blocked due to abuse";
  if (status.includes("911")) return "Something seriously went wrong";
  return "Unknown";
};

const run = async () => {
  try {
    const { USERNAME, PASSWORD, LOCATION } = process.env;
    const ipv4 = await getWanIp();
    const ipv6 = await getWanIp(true);

    if (!ipv4 && !ipv6) {
      console.log("Coult not get an IPv4 or IPv6 address");
      return;
    }
    if (!ipHasChanged(ipv4, ipv6)) {
      console.log("IPv4 and IPv6 has not changed");
      return;
    }

    const params = new URLSearchParams({
      username: USERNAME,
      password: PASSWORD,
      location: LOCATION
    });

    if (ipv4) params.append("myip", ipv4);
    if (ipv6) params.append("myipv6", ipv6);

    console.log(`Updating IP addresses, ipv4: ${ipv4}, ipv6: ${ipv6}`);

    const result = await fetch(`https://api.dynu.com/nic/update?${params.toString()}`);
    const data = await result.text();
    console.log(result.status, result.statusText, data, convertStatus(data));
  } catch (error) {
    console.error(error);
  }
};

const init = () => {
  const { USERNAME, PASSWORD, LOCATION, PERIOD } = process.env;
  if (!USERNAME) throw new Error("USERNAME required env");
  if (!PASSWORD) throw new Error("PASSWORD required env");
  if (!LOCATION) throw new Error("LOCATION required env");

  const interval = PERIOD ? parseInt(PERIOD) * 1000 : 30 * 1000;
  setInterval(() => run(), interval);
  run();
};

init();
// run();
