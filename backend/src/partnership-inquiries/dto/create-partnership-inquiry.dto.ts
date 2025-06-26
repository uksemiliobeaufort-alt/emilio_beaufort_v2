import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreatePartnershipInquiryDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  inquiryType: string;

  @IsString()
  @IsNotEmpty()
  message: string;
} 