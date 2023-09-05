import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UserSessionPostgresModel } from './user-session';

@Table({ tableName: 'users' })
export class UserPostgresModel extends Model<
  InferAttributes<UserPostgresModel>,
  InferCreationAttributes<UserPostgresModel>
> {
  @PrimaryKey
  @Column
  id: string;

  @Column
  authId: string;

  @Column
  secret: string;

  @HasMany(() => UserSessionPostgresModel, { onDelete: 'CASCADE', hooks: true })
  userSessions: UserSessionPostgresModel[];
}
