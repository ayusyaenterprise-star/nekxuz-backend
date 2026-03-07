// Quick CORS fix - add this to endpoints that need it
const setCorsHeaders = (res) => {
  res.header('Access-Control-Allow-Origin', 'https://nekxuz.in');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
};
