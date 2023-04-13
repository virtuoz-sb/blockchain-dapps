import axios from 'axios';

const baseUrl = process?.env?.NEXT_PUBLIC_API_BASE;
const authToken = process?.env?.NEXT_PUBLIC_AUTH_TOKEN || 'NO_ENV_AUTH_TOKEN';

//run when - interceptor - bypass header on AWS PUBLIC url calls
function onCheckCall(config) {
  const isPublic = config.url.includes(process?.env?.NEXT_PUBLIC_AWS_API_URL);
  //console.log("CONFIG", config, isPublic);
  return !isPublic;
}

let instance = axios.create({ baseURL: baseUrl });

// set auth header
instance?.interceptors.request.use(
  function (config) {
    config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  },
  null,
  { runWhen: onCheckCall }
);

export default instance;
