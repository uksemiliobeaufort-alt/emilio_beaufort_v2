import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { PostsModule } from './posts/posts.module';
import { PartnershipInquiriesModule } from './partnership-inquiries/partnership-inquiries.module';

@Module({
  imports: [PrismaModule, ProductsModule, PostsModule, PartnershipInquiriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
