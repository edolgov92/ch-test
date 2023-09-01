import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Request } from 'express';
import { UserTokenContext, UserTokenContextDto } from '../../../../../../src/modules';

const REQUEST: Partial<Request> = {
  headers: {
    authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoidXNyXzVRdjFBUkpNV0puRDFoVGRiTmdpUWYiLCJhdXRoSWQiOiJzb3VyY2VfdXNlciJ9LCJpYXQiOjE2OTM1NzY2OTgsImV4cCI6MTY5MzU3NjcyOH0.8pLUCLtLi_bcFQTX7LhxGWw67EzkeBzODzWCXjpzcoU`,
  },
};

describe('UserTokenContextDecorator', () => {
  let context: Partial<ExecutionContext>;

  function getParamDecoratorFactory(decorator: Function) {
    class Test {
      public test(@UserTokenContext() value: unknown) {}
    }
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return args[Object.keys(args)[0]].factory;
  }

  function getContext(request: Partial<Request>): Partial<ExecutionContext> {
    return { switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn().mockReturnValue(request) }) };
  }

  beforeEach(async () => {
    context = getContext(REQUEST);
  });

  it('should return user data from request', async () => {
    const factory: (data: unknown, context: ExecutionContext) => UserTokenContextDto | undefined =
      getParamDecoratorFactory(UserTokenContext);
    const result: UserTokenContextDto | undefined = factory(undefined, context as ExecutionContext);
    expect(typeof result).toBe('object');
    expect(result.authId).toBe('source_user');
    expect(result.id).toBe('usr_5Qv1ARJMWJnD1hTdbNgiQf');
  });

  it('should return undefined in case no request data', async () => {
    const factory: (data: unknown, context: ExecutionContext) => UserTokenContextDto | undefined =
      getParamDecoratorFactory(UserTokenContext);
    context = getContext(undefined);
    const result: UserTokenContextDto | undefined = factory(undefined, context as ExecutionContext);
    expect(result).toBeUndefined();
  });

  it('should return undefined in case no request headers data', async () => {
    const factory: (data: unknown, context: ExecutionContext) => UserTokenContextDto | undefined =
      getParamDecoratorFactory(UserTokenContext);
    context = getContext({});
    const result: UserTokenContextDto | undefined = factory(undefined, context as ExecutionContext);
    expect(result).toBeUndefined();
  });

  it('should return undefined in case no access token in request', async () => {
    const factory: (data: unknown, context: ExecutionContext) => UserTokenContextDto | undefined =
      getParamDecoratorFactory(UserTokenContext);
    context = getContext({ headers: {} });
    const result: UserTokenContextDto | undefined = factory(undefined, context as ExecutionContext);
    expect(result).toBeUndefined();
  });

  it('should return undefined in case token is not valid', async () => {
    const factory: (data: unknown, context: ExecutionContext) => UserTokenContextDto | undefined =
      getParamDecoratorFactory(UserTokenContext);
    context = getContext({ headers: { authorization: 'Bearer 123456789' } });
    const result: UserTokenContextDto | undefined = factory(undefined, context as ExecutionContext);
    expect(result).toBeUndefined();
  });
});
