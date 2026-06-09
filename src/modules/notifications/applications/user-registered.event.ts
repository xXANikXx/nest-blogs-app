import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../user_accounts/domain/events/user-registered.event';
import { EmailService } from '../email.service';

@EventsHandler(UserRegisteredEvent)
export class SendConfirmationEmailWhenUserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private emailService: EmailService) {}

  async handle(event: UserRegisteredEvent) {
    try {
      await this.emailService.sendConfirmationEmail(
        event.email,
        event.confirmationCode,
      );
    } catch (e) {
      console.error('send email error', e);
    }
  }
}
