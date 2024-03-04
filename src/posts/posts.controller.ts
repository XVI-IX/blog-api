import {
  Controller,
  Delete,
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
import { User } from '../common/decorators/user.decorator';
import { Payload } from '../common/entities/payload.entity';
import { AddPostDto, CommentDto, UpdatePostDto } from './dto';
import { Public } from '../common/decorators/public.decorator';

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

  @Get('/all')
  @Public()
  @HttpCode(200)
  getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get('/:id')
  @HttpCode(200)
  @Public()
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Get('/search')
  @HttpCode(200)
  @Public()
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
  @Public()
  share(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.sharePost(id);
  }

  @Get('/:id/like')
  @HttpCode(200)
  likePost(@Param('id', ParseIntPipe) id: number, @User() user: Payload) {
    return this.postsService.likePost(id, user);
  }

  @Post('/:id/comment')
  @HttpCode(200)
  commentPost(
    @Param('id', ParseIntPipe) id: number,
    @User() user: Payload,
    @Body() dto: CommentDto,
  ) {
    return this.postsService.commentPost(id, user, dto);
  }

  @Delete('/:id')
  @HttpCode(200)
  deletePost(@User() user: Payload, @Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(user, id);
  }
}
