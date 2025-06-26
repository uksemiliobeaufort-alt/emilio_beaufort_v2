import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ProductsService } from './products/products.service';
import { PostsService } from './posts/posts.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productsService: ProductsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/home-data')
  async getHomeData() {
    const [cosmetics, hair, posts] = await Promise.all([
      this.productsService.findByCategory('COSMETICS'),
      this.productsService.findByCategory('HAIR'),
      this.postsService.findAll(),
    ]);

    return {
      cosmetics,
      hair,
      posts,
    };
  }
}
