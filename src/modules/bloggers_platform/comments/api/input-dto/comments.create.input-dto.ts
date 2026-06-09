import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class CreateCommentInputDto {
  @IsStringWithTrim(20, 300)
  content: string;
}
