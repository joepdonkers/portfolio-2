import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app/app.module';
import { HttpStatus } from '@nestjs/common';


describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('/register', () => {
		it('should return 201 status code with a valid payload', async () => {
			const payload = {
				name: 'John Doe',
				email: 'johndoe@example.com',
				password: 'p',
				jobTitle: 'Developer',
				role: 'user',
				organisations: ['org1'],
			};

			const response = await request(app.getHttpServer())
				.post('/register')
				.send(payload)
				.expect(HttpStatus.CREATED);

			expect(response.body).toHaveProperty('id');
			expect(typeof response.body.id).toBe('string');
		});
	});
});
