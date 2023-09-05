import { AbstractEntity } from '../abstract';

export interface UserProps {
  id?: string;
  authId: string;
  secret: string;
}

export class User extends AbstractEntity {
  authId: string;
  secret: string;

  constructor(props: UserProps) {
    super('usr', props.id);

    this.authId = props.authId;
    this.secret = props.secret;
  }
}
