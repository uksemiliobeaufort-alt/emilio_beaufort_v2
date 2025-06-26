import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isSoldOut?: boolean;

  @IsEnum(['COSMETICS', 'HAIR'])
  category: 'COSMETICS' | 'HAIR';
} 