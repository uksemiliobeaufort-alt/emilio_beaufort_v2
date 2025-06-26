import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnershipInquiryDto } from './dto';

@Injectable()
export class PartnershipInquiriesService {
  constructor(private prisma: PrismaService) {}

  async create(createPartnershipInquiryDto: CreatePartnershipInquiryDto) {
    return this.prisma.partnershipInquiry.create({
      data: createPartnershipInquiryDto,
    });
  }

  async findAll() {
    return this.prisma.partnershipInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.partnershipInquiry.findUnique({
      where: { id },
    });
  }
} 