import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  featuredImageUrl: string;
} 