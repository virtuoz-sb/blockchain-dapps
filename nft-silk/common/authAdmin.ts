//AWS auth cfg; try dynamically set redirects - see pages\admin\index.tsx

const awsAdminAuthConfig = {
  region: process.env.NEXT_PUBLIC_AWS_AUTH_REGION,
  userPoolId: process.env.NEXT_PUBLIC_AWS_AUTH_USER_POOL_ID,
  userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_AUTH_USER_POOL_WEB_CLIENT_ID,
  oauth: {
    domain: process.env.NEXT_PUBLIC_AWS_AUTH_DOMAIN,
    scope: ['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
    redirectSignIn: process?.env?.NEXT_PUBLIC_AWS_AUTH_REDIRECT_SIGN_IN_URL,
    redirectSignOut: process?.env?.NEXT_PUBLIC_AWS_AUTH_REDIRECT_SIGN_OUT_URL,
    responseType: 'code',
  },
};

export default awsAdminAuthConfig;
