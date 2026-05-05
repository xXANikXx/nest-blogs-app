import { CommentsQueryService } from '../application/comments.query.service';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { handleResult } from '../../../../core/object-result/handleresult';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryService: CommentsQueryService) {}

  @ApiParam({ name: `id` })
  @Get(`:id`)
  async getById(@Param('id') id: string): Promise<CommentViewDto> {
    const result = await this.commentsQueryService.findById(id);
    return handleResult(result);
  }
}
