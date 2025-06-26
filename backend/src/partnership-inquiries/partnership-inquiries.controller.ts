import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PartnershipInquiriesService } from './partnership-inquiries.service';
import { CreatePartnershipInquiryDto } from './dto';

@Controller('api/partnership-inquiries')
export class PartnershipInquiriesController {
  constructor(private readonly partnershipInquiriesService: PartnershipInquiriesService) {}

  @Post()
  create(@Body() createPartnershipInquiryDto: CreatePartnershipInquiryDto) {
    return this.partnershipInquiriesService.create(createPartnershipInquiryDto);
  }

  @Get()
  findAll() {
    return this.partnershipInquiriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partnershipInquiriesService.findOne(id);
  }
} 