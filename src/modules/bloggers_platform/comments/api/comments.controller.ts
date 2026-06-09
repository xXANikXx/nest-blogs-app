import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtOptionalAuthGuard } from '../../../user_accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user_accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../../user_accounts/guards/dto/user-context.dto';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.use-case';
import { Result } from '../../../../core/object-result/result.entity';
import { handleResult } from '../../../../core/object-result/handleresult';
import { JwtAuthGuard } from '../../../user_accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../user_accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UpdateCommentCommand } from '../application/usecase/update-comment.use-case';
import { UpdateLikeStatusInputDto } from '../../likes/api/like.update-like-status.input-dto';
import { UpdateCommentLikeStatusCommand } from '../application/usecase/update-comments-like-status.usecase';
import { DeleteCommentCommand } from '../application/usecase/delete-comment.use-case';
import { UpdateCommentInputDto } from './input-dto/comments.update.input-dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {
    console.log('CommentsController created');
  }

  @Put(':commentId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Param('commentId') commentId: string,
    @Body() inputDto: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    const result = await this.commandBus.execute<
      UpdateCommentLikeStatusCommand,
      Result
    >(
      new UpdateCommentLikeStatusCommand(
        user.id,
        user.login,
        commentId,
        inputDto.likeStatus,
      ),
    );

    return handleResult(result);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<CommentViewDto> {
    const result = await this.queryBus.execute<
      GetCommentByIdQuery,
      Result<CommentViewDto>
    >(new GetCommentByIdQuery(id, user?.id ?? null));

    return handleResult(result);
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() inputDto: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto, // Твой декоратор обязательного юзера
  ) {
    const result = await this.commandBus.execute<UpdateCommentCommand, Result>(
      new UpdateCommentCommand(commentId, inputDto.content, user.id),
    );

    return handleResult(result);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT) // Спецификация требует 204 при успешном DELETE без тела ответа
  async deleteComment(
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto, // Твой декоратор обязательного юзера
  ) {
    const result = await this.commandBus.execute<DeleteCommentCommand, Result>(
      new DeleteCommentCommand(commentId, user.id),
    );

    return handleResult(result);
  }
}
