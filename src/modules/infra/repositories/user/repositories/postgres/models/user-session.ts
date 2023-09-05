import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UserPostgresModel } from './user';

@Table({ tableName: 'user-sessions' })
export class UserSessionPostgresModel extends Model<
  InferAttributes<UserSessionPostgresModel>,
  InferCreationAttributes<UserSessionPostgresModel>
> {
  @PrimaryKey
  @Column
  id: string;

  @Column(DataType.TEXT)
  accessToken: string;

  @Column
  accessTokenExpireDateTime: Date;

  @Column
  ipAddress?: string;

  @Column(DataType.TEXT)
  refreshToken: string;

  @Column
  refreshTokenExpireDateTime: Date;

  @Column
  startDateTime: Date;

  @ForeignKey(() => UserPostgresModel)
  @Column
  userId: string;

  @BelongsTo(() => UserPostgresModel)
  user: UserPostgresModel;
}
