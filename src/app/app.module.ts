import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { TokenMiddleware } from './auth/token.middleware';
import { DataModule } from './data.module';

@Module({
	imports: [
		MongooseModule.forRoot(
			`mongodb://localhost:27017/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
		),
		AuthModule,
		DataModule,
		RouterModule.register([
			{
				path: 'auth',
				module: AuthModule,
			},
			{
				path: 'data',
				module: DataModule,
			},
		]),
	],
	controllers: [],
	providers: [],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(TokenMiddleware)
			.exclude({ path: 'api/auth/login', method: RequestMethod.POST })
			.forRoutes('*');
	}
}
