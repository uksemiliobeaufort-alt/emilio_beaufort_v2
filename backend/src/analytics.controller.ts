import { Controller, Get, Post, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

class TrackEventDto {
  type: string;
  data?: any;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('page-views')
  async getDailyPageViews() {
    return this.analyticsService.getDailyPageViewsLast7Days();
  }

  @Post('event')
  async trackEvent(@Body() body: TrackEventDto) {
    return this.analyticsService.trackEvent(body.type, body.data);
  }
} 