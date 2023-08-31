export default (variable: string): string => {
  const result = process.env[variable];
  if (result === undefined) {
    throw new Error(`Missing or misnamed environment variable ${variable}. Please check your .env file`);
  } else {
    return result;
  }
};
