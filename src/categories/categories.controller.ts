import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto';

@Controller({
  path: 'categories',
  version: '1',
})
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(200)
  getCategories() {
    return this.categoriesService.getCategories();
  }

  @Post()
  @HttpCode(200)
  addCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.addCategories(dto);
  }
}
