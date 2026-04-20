import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    appSetup(app);

    const PORT = process.env.PORT || 5001; //TODO: move to configService. will be in the following lessons

    await app.listen(PORT, () => {
      console.log('Server is running on port ' + PORT);
    });
  } catch (err) {
    console.error('Bootstrap failed', err);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Unhandled bootstrap error', err);
  process.exit(1);
});
