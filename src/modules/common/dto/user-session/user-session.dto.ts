import { Type } from 'class-transformer';
import { AbstractDto } from '../abstract';

export class UserSessionDto extends AbstractDto<UserSessionDto> {
  accessToken: string;
  id: string;
  refreshToken: string;

  @Type(() => Date)
  accessTokenExpireDateTime: Date;

  @Type(() => Date)
  refreshTokenExpireDateTime: Date;

  @Type(() => Date)
  startDateTime: Date;
}
