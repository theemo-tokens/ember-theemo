import { unplugin } from './plugin';

// fixed as per comment here: https://github.com/microsoft/TypeScript/issues/42873#issuecomment-1335230869
import type {} from 'webpack';

export default unplugin.webpack;
