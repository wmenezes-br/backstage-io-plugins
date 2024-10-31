/**
 * Get the authorization header for Bitbucket Cloud
 * @param config - The configuration object
 * @returns The authorization header
 */
export const getAuthorizationHeader = (config: {
  username?: string;
  appPassword?: string;
  token?: string;
}) => {
  if (config.username && config.appPassword) {
    const buffer = Buffer.from(
      `${config.username}:${config.appPassword}`,
      'utf8',
    );

    return `Basic ${buffer.toString('base64')}`;
  }

  if (config.token) {
    return `Bearer ${config.token}`;
  }

  throw new Error(
    `Authorization has not been provided for Bitbucket Cloud. Please add either username + appPassword to the Integrations config or a user login auth token`,
  );
};

//
export const getBitucketCloudHost = () => {
  return 'bitbucket.org';
}