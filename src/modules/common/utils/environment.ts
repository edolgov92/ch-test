import { Logger } from '@nestjs/common';
import { Environment } from '../../../environment';
import { UserSessionCreationDto } from '../dto';
import { User } from '../entitites';

const SENSITIVE: string = '(sensitive)';

export function logEnvironment(environment: Environment): void {
  const environmentToLog: Environment = JSON.parse(JSON.stringify(environment));
  environmentToLog.auth.accessTokenSecret = SENSITIVE;
  environmentToLog.queue.url = SENSITIVE;
  environmentToLog.repositories.user.url = SENSITIVE;
  if (environmentToLog.services.proxy.testUsersData) {
    const testsUsersData: User[] = JSON.parse(environmentToLog.services.proxy.testUsersData);
    testsUsersData.forEach((item: User) => {
      item.secret = SENSITIVE;
    });
    environmentToLog.services.proxy.testUsersData = JSON.stringify(testsUsersData);
  }
  if (environmentToLog.services.source.testUserCredentials) {
    const testUserCredentials: UserSessionCreationDto = JSON.parse(
      environmentToLog.services.source.testUserCredentials,
    );
    testUserCredentials.secret = SENSITIVE;
    environmentToLog.services.source.testUserCredentials = JSON.stringify(testUserCredentials);
  }
  const logger: Logger = new Logger('Environment');
  logger.log(JSON.stringify(environmentToLog, null, 2));
}
