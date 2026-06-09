import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenAuthGuard } from '../guards/bearer/refresh-token-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { RefreshTokenPayloadDto } from '../guards/dto/refresh-token-payload.dto';
import { GetDevicesQuery } from '../application/queries/get.devices.query-handler';
import { SessionViewDto } from './view-dto/session.view-dto';
import { DeleteAllSessionsCommand } from '../application/usecases/sessions/delete-all-sessions.usecase';
import { Result } from '../../../core/object-result/result.entity';
import { handleResult } from '../../../core/object-result/handleresult';
import { DeleteSessionCommand } from '../application/usecases/sessions/delete-session.usecase';

@Controller('security/devices')
@UseGuards(RefreshTokenAuthGuard)
export class SecurityDevicesController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getDevices(
    @ExtractUserFromRequest() payload: RefreshTokenPayloadDto,
  ): Promise<SessionViewDto[]> {
    return this.queryBus.execute(new GetDevicesQuery(payload.id));
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDevices(
    @ExtractUserFromRequest() payload: RefreshTokenPayloadDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<
      DeleteAllSessionsCommand,
      Result
    >(new DeleteAllSessionsCommand(payload.id, payload.deviceId));
    handleResult(result);
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(
    @Param('deviceId') deviceId: string,
    @ExtractUserFromRequest() payload: RefreshTokenPayloadDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<DeleteSessionCommand, Result>(
      new DeleteSessionCommand(payload.id, deviceId),
    );
    handleResult(result);
  }
}
