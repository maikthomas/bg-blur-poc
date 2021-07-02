import OT from '@opentok/client';
import config from './config';
const session = OT.initSession(config.apiKey, config.sessionId);

export default session;
