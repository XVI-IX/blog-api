import {
  Controller,
  HttpCode,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from 'src/common/decorators/user.decorator';
import { Payload } from 'src/common/entities/payload.entity';
import { AddPostDto, UpdatePostDto } from './dto';

@Controller({
  path: 'posts',
  version: '1',
})
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(201)
  createPost(@User() user: Payload, @Body() dto: AddPostDto) {
    return this.postsService.addPost(user, dto);
  }

  @Get()
  @HttpCode(200)
  getUserPosts(@User() user: Payload) {
    return this.postsService.getUserPosts(user);
  }

  @Get('/:id')
  @HttpCode(200)
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Get('/search')
  @HttpCode(200)
  search(@Query('search') search: string) {
    return this.postsService.search(search);
  }

  @Put('/:id')
  @HttpCode(200)
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, dto);
  }

  @Get('/:id/share')
  @HttpCode(200)
  share(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.sharePost(id);
  }

  @Delete('/:id')
  @HttpCode(200)
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
