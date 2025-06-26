import { Module } from '@nestjs/common';
import { PartnershipInquiriesService } from './partnership-inquiries.service';
import { PartnershipInquiriesController } from './partnership-inquiries.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PartnershipInquiriesController],
  providers: [PartnershipInquiriesService, PrismaService],
})
export class PartnershipInquiriesModule {} 