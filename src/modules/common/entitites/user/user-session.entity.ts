import { AbstractEntity } from '../abstract';

export interface UserSessionProps {
  id?: string;
  accessToken: string;
  accessTokenExpireDateTime: Date;
  ipAddress?: string;
  refreshToken: string;
  refreshTokenExpireDateTime: Date;
  startDateTime: Date;
  userId: string;
}

export class UserSession extends AbstractEntity {
  accessToken: string;
  accessTokenExpireDateTime: Date;
  ipAddress?: string;
  refreshToken: string;
  refreshTokenExpireDateTime: Date;
  startDateTime: Date;
  userId: string;

  constructor(props: UserSessionProps) {
    super('uss', props.id);

    this.accessToken = props.accessToken;
    this.accessTokenExpireDateTime = props.accessTokenExpireDateTime;
    this.ipAddress = props.ipAddress;
    this.refreshToken = props.refreshToken;
    this.refreshTokenExpireDateTime = props.refreshTokenExpireDateTime;
    this.startDateTime = props.startDateTime;
    this.userId = props.userId;
  }
}
