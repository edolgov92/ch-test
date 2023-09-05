import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { plainToClass } from 'class-transformer';
import { BehaviorSubject, filter, firstValueFrom, take } from 'rxjs';
import { uuid } from 'short-uuid';
import { ApiConfig, Environment, ServicesConfig, SourceServiceConfig } from '../../../../environment';
import {
  BaseEventDto,
  sleep,
  UserSessionCreationDto,
  UserSessionDto,
  UserSessionRefreshDto,
  WithLogger,
} from '../../../common';

const REQUESTS_IN_CHUNK: number = 10;

@Injectable()
export class SourceMockService extends WithLogger {
  private apiUrl: string;
  private userSessionCreationDto: UserSessionCreationDto;

  private userSessionDto$: BehaviorSubject<UserSessionDto | undefined> = new BehaviorSubject(undefined);

  constructor(
    private configService: ConfigService<Environment>,
    private httpService: HttpService,
  ) {
    super();

    const apiConfig: ApiConfig = this.configService.get('api');
    this.apiUrl = apiConfig.url;
  }

  onApplicationBootstrap(): void {
    const sourceServiceConfig: SourceServiceConfig =
      this.configService.get<ServicesConfig>('services').source;
    this.userSessionCreationDto = sourceServiceConfig.testUserCredentials
      ? JSON.parse(sourceServiceConfig.testUserCredentials)
      : undefined;
    if (this.userSessionCreationDto) {
      this.startEventsProducer();

      this.userSessionDto$
        .pipe(filter((dto: UserSessionDto) => !!dto))
        .subscribe(async (dto: UserSessionDto) => {
          // Sleep until 5 sec before access token expiration time
          const timeoutMs: number = dto.accessTokenExpireDateTime.getTime() - Date.now() - 5000;
          await sleep(timeoutMs);
          // Access token is going to expire, start refreshing user session prior to that
          try {
            await Promise.race([
              new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                  reject(new Error('Not received responce in 4sec'));
                }, 4000);
              }),
              this.refreshUserSession(dto.refreshToken),
            ]);
          } catch {
            // Refresh session failed. Clear userSessionDto to pause requests and create new session
            this.userSessionDto$.next(undefined);
            await this.createUserSession();
          }
        });
    }
  }

  private async startEventsProducer(): Promise<void> {
    await this.createUserSession();
    let requestsDoneInChunk: number = 0;
    const servicesConfig: ServicesConfig = this.configService.get('services');
    // Send REQUESTS_IN_CHUNK events to Proxy, after that wait a bit to let
    // proxy process them (according to Target service rate limits), after that
    // send next chunk of events
    while (true) {
      if (requestsDoneInChunk === REQUESTS_IN_CHUNK) {
        requestsDoneInChunk = 0;
        // Sleep to let Target service process our events from queue
        let sleepMs: number =
          (servicesConfig.target.rateLimit.intervalMs / servicesConfig.target.rateLimit.requestsPerInterval) *
            REQUESTS_IN_CHUNK -
          servicesConfig.source.sendEventsIntervalMs * REQUESTS_IN_CHUNK;
        sleepMs = Math.round(sleepMs * 2);
        if (sleepMs > 0) {
          await sleep(sleepMs);
        }
      } else {
        await sleep(servicesConfig.source.sendEventsIntervalMs);
      }
      // Need to make sure we are authenticated before sending event
      this.userSessionDto$
        .pipe(
          filter((dto: UserSessionDto) => !!dto),
          take(1),
        )
        .subscribe(() => {
          this.sendEvent();
        });
      requestsDoneInChunk++;
    }
  }

  private async createUserSession(): Promise<void> {
    try {
      const response: AxiosResponse<UserSessionDto> = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/user-sessions`, this.userSessionCreationDto),
      );
      if (!response.data) {
        throw new Error('Create user session response data is not valid');
      }
      this.userSessionDto$.next(plainToClass(UserSessionDto, response.data));
      this.logger.log(`Successfully authenticated in Proxy`);
    } catch (ex) {
      this.logger.error(`Authentication failed: ${ex}`);
      throw ex;
    }
  }

  private async refreshUserSession(refreshToken: string): Promise<void> {
    try {
      const response: AxiosResponse<UserSessionDto> = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/user-sessions/refresh`,
          new UserSessionRefreshDto({ refreshToken }),
        ),
      );
      if (!response.data) {
        throw new Error('Refresh user session response data is not valid');
      }
      this.userSessionDto$.next(plainToClass(UserSessionDto, response.data));
      this.logger.log(`Successfully refreshed user session in Proxy`);
    } catch (ex) {
      this.logger.error(`Refresh user session failed: ${ex}`);
      throw ex;
    }
  }

  private async sendEvent(): Promise<void> {
    try {
      const dto: BaseEventDto = new BaseEventDto({
        id: uuid(),
        name: 'Event name',
        body: 'Event body',
        timestamp: new Date(),
      });
      this.logger.debug(`${dto.id} | Sending event to Proxy`);
      // We wait for response from Proxy service no more than 500ms, after that we reject promise
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Not received responce in 500ms'));
          }, 500);
        }),
        firstValueFrom(
          this.httpService.post(`${this.apiUrl}/events`, dto, {
            headers: { Authorization: `Bearer ${this.userSessionDto$.value.accessToken}` },
          }),
        ),
      ]);
      this.logger.debug(`${dto.id} | Event was sent successuly`);
    } catch (ex) {
      this.logger.error(`Failed to send event : ${ex}`);
    }
  }
}
