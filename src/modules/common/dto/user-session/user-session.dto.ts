import { AbstractDto } from '../abstract';

export class UserSessionDto extends AbstractDto<UserSessionDto> {
  accessToken: string;
  accessTokenExpireDateTime: Date;
  id: string;
  refreshToken: string;
  refreshTokenExpireDateTime: Date;
  startDateTime: Date;
}
