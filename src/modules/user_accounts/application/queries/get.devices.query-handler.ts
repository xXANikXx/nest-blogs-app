import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionViewDto } from '../../api/view-dto/session.view-dto';

export class GetDevicesQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesQueryHandler implements IQueryHandler<GetDevicesQuery> {
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(query: GetDevicesQuery): Promise<SessionViewDto[]> {
    const sessions = await this.sessionsRepository.findAllByUserId(
      query.userId,
    );
    return sessions.map(SessionViewDto.mapToView);
  }
}
