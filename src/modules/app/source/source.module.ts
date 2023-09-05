import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import * as Services from './services';

@Module({
  imports: [HttpModule],
  providers: [Services.SourceMockService],
})
export class SourceModule {}
