# Project: NestJS Blog Platform

## Overview

A NestJS REST API application for a blogging platform with users, blogs, posts,
and comments.
Currently migrating to CQRS/UseCase architecture.

## Tech Stack

- **Framework**: NestJS 11.0.16
- **Database**: MongoDB with Mongoose
- **Language**: TypeScript
- **Auth**: Passport.js (JWT + Local + Basic strategies)
- **Validation**: class-validator + class-transformer
- **Testing**: Jest + Supertest (E2E tests)
- **Email**: @nestjs-modules/mailer (Gmail SMTP)

## Architecture

### Module Structure

src/
core/ # Global shared functionality
adapters/
bcrypt.service.ts # Password hashing
decorators/
transform/trim.ts # Custom trim decorator
validation/ # Custom validation decorators
dto/
base.paginated-params.input-dto.ts
base.paginated.view-dto.ts
exceptions/
domain-exception.ts # DomainException class
domain-exception-codes.ts # DomainExceptionCode enum
filters/
all-exception.filter.ts
domain-exception.filter.ts
http-exception.filter.ts
object-result/
result.entity.ts # Result<T> pattern
resultCode.ts # ResultStatus enum
handleResult.ts # Controller utility
domain-exception-code.mapper.ts
modules/
user_accounts/ # Users + Auth module
bloggers_platform/ # Blogs + Posts + Comments
notifications/ # Email service
testing/ # Test data cleanup

### Layer Architecture (per module)

api/
input-dto/ # Request DTOs (validation + swagger)
view-dto/ # Response DTOs
controller.ts # HTTP layer
application/
use-cases/ # Business logic (CQRS - IN PROGRESS)
queries/ # Read operations (CQRS - IN PROGRESS)
service.ts # Legacy services (being replaced by use-cases)
domain/
entity.ts # Mongoose schema + business rules
interfaces/ # Contracts between layers
dto/ # Domain DTOs
infrastructure/
repository.ts # Write operations
query/
query-repository.ts # Read operations
external-query/ # Cross-module communication

## Key Patterns & Conventions

### 1. Result Object Pattern

Used between service and controller layers:

```typescript
// Service returns Result
async
createUser(dto
:
CreateUserInputDto
):
Promise < Result < UserViewDto >> {
  if(exists) return Result.badRequest('Already exists', 'field');
  return Result.success(UserViewDto.mapToView(user));
}

// Controller uses handleResult utility
async
create(@Body()
body: CreateUserInputDto
):
Promise < UserViewDto > {
  const result = await this.usersService.createUser(body);
  return handleResult(result);
}
```

### 2. DomainException Pattern

Used in domain layer instead of HTTP exceptions:

```typescript
// Entity throws DomainException
throw new DomainException({
  code: DomainExceptionCode.BadRequest,
  message: 'Email already confirmed',
});

// Service catches and converts to Result
try {
  user.confirmEmail(code);
} catch (e) {
  if (e instanceof DomainException) {
    return Result.fail(domainExceptionCodeToResultStatus(e.code), e.message);
  }
  throw e;
}
```

### 3. Three Exception Filters

Registered in AppModule via APP_FILTER (order matters - reverse application):

```typescript
// Applied in reverse order:
// 1st: DomainHttpExceptionsFilter  → catches DomainException
// 2nd: HttpExceptionFilter         → catches HttpException
// 3rd: AllHttpExceptionsFilter     → catches everything else → 500
providers: [
  { provide: APP_FILTER, useClass: AllHttpExceptionsFilter },
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
  { provide: APP_FILTER, useClass: DomainHttpExceptionsFilter },
],
```

### 4. Soft Delete

Never physically delete documents:

```typescript
// Entity
makeDeleted()
{
  if (this.deletedAt !== null) throw new DomainException({ ... });
  this.deletedAt = new Date();
}

// All queries filter deleted documents
findById(id
:
string
)
{
  return this.Model.findOne({ _id: id, deletedAt: null });
}
```

### 5. Creating Documents via Model (IMPORTANT)

Always use injected Mongoose model, never call static methods on class directly:

```typescript
// CORRECT - via injected model
const newUser = this.UserModel.createdByAdmin(domainDto);

// WRONG - save() won't work
const newUser = User.createdByAdmin(domainDto);
```

### 6. CQRS Migration (IN PROGRESS)

Migrating from service pattern to use-case pattern:

**Target structure:**

```typescript
// Command (write operation)
export class CreateBlogCommand {
  constructor(public readonly dto: ICreateBlog) {
  }
}

// UseCase handler
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {
  }

  async execute(command: CreateBlogCommand): Promise<Result<BlogViewDto>> {
    // business logic here
  }
}

// Query
export class GetBlogsQuery {
  constructor(public readonly params: GetBlogsQueryParams) {
  }
}

// Query handler
@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<GetBlogsQuery> {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {
  }

  async execute(query: GetBlogsQuery): Promise<Result<PaginatedViewDto<BlogViewDto[]>>> {
    // read logic here
  }
}
```

**Controller with CQRS:**

```typescript

@Controller('blogs')
export class BlogsController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const result = await this.commandBus.execute(new CreateBlogCommand(body));
    return handleResult(result);
  }

  @Get()
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const result = await this.queryBus.execute(new GetBlogsQuery(query));
    return handleResult(result);
  }
}
```

## DomainExceptionCode Enum

```typescript
export enum DomainExceptionCode {
  // Common
  NotFound = 1,
  BadRequest = 2,
  InternalServerError = 3,
  Forbidden = 4,
  ValidationError = 5,
  // Auth
  Unauthorized = 11,
  EmailNotConfirmed = 12,
  ConfirmationCodeExpired = 13,
  PasswordRecoveryCodeExpired = 14,
}
```

## Authentication

### Guard Types

```typescript
@UseGuards(JwtAuthGuard)         // Required JWT - throws 401
@UseGuards(JwtOptionalAuthGuard) // Optional JWT - returns null if no token
@UseGuards(BasicAuthGuard)       // Basic auth for admin endpoints
```

### Parameter Decorators

```typescript
@ExtractUserFromRequest()          // Required user - throws if missing
@ExtractUserIfExistsFromRequest()  // Optional user - returns null
```

### @Public() Decorator

Used with BasicAuthGuard to skip auth on specific routes:

```typescript

@Controller('blogs')
@UseGuards(BasicAuthGuard)
export class BlogsController {
  @Public()
  @Get() // No auth required
  getAll() {
  }

  @Post() // Requires Basic auth
  createBlog() {
  }
}
```

## API Endpoints

### Users (Basic Auth required for write operations)

- `GET /api/users` — list with pagination
- `GET /api/users/:id` — get by id
- `POST /api/users` — create (admin only)
- `DELETE /api/users/:id` — soft delete (admin only)

### Blogs

- `GET /api/blogs` — public
- `GET /api/blogs/:id` — public
- `GET /api/blogs/:blogId/posts` — public
- `POST /api/blogs` — Basic Auth
- `PUT /api/blogs/:id` — Basic Auth
- `DELETE /api/blogs/:id` — Basic Auth
- `POST /api/blogs/:blogId/posts` — Basic Auth

### Posts

- `GET /api/posts` — public
- `GET /api/posts/:id` — public
- `GET /api/posts/:postId/comments` — public
- `POST /api/posts` — Basic Auth
- `PUT /api/posts/:id` — Basic Auth
- `DELETE /api/posts/:id` — Basic Auth

### Comments

- `GET /api/comments/:id` — public
- (More endpoints coming - JWT required)

### Auth

- `POST /api/auth/login` — Local strategy
- `GET /api/auth/me` — JWT required
- `POST /api/auth/registration` — public
- `POST /api/auth/registration-confirmation` — public
- `POST /api/auth/registration-email-resending` — public
- `POST /api/auth/password-recovery` — public
- `POST /api/auth/new-password` — public

### Testing

- `DELETE /api/testing/all-data` — clear all data (test env only)

## Planned Features

- [ ] CQRS/UseCase migration (IN PROGRESS)
- [ ] Likes for posts and comments (JWT required)
- [ ] JWT Refresh token
- [ ] Comments CRUD (JWT required)
- [ ] Rate limiting (already configured via @nestjs/throttler)
- [ ] ConfigModule for env variables (lesson 16)
- [ ] E2E tests expansion

## Coding Conventions

### Async/Await

Always use async/await, never raw Promises.

### TypeScript

- Avoid `any` type - use proper types or `unknown`
- Always specify return types on public methods
- Use `as Type` casting only when necessary

### Naming

- Services: `UsersService`, `BlogsService`
- Repositories: `UsersRepository`, `BlogsRepository`
- Query Repositories: `UsersQueryRepository`
- Use Cases: `CreateUserUseCase`, `DeleteBlogUseCase`
- Commands: `CreateUserCommand`, `DeleteBlogCommand`
- Queries: `GetUsersQuery`, `GetBlogByIdQuery`

### Error Handling

- Domain layer: throw `DomainException`
- Service/UseCase layer: return `Result<T>`
- Controller layer: use `handleResult(result)`
- Never throw HTTP exceptions from domain or service layers

### DTO Separation

- `InputDto` — presentation layer (validation + swagger)
- `DomainDto` — domain layer (no decorators)
- `ViewDto` — response (mapToView static method)
- `Command/Query` — application layer (implements interface)

## Testing

E2E tests using Jest + Supertest:
test/
helpers/
init-settings.ts # App bootstrap for tests
delete-all-data.ts # Clear DB between tests
delay.ts # Timing utility
users-test-manager.ts
auth-test-manager.ts
blogs-test-manager.ts
posts-test-manager.ts
comments-test-manager.ts
mock/
email-service.mock.ts # Mock email (no real sending)
blogs/
blogs.e2e-spec.ts
users/
users.e2e-spec.ts

### Test Conventions

- `beforeAll` — bootstrap app once
- `beforeEach` — clear DB before each test
- `afterAll` — close app
- Always use test managers for HTTP requests
- Mock EmailService to avoid real email sending
- Override ThrottlerGuard to avoid rate limiting in tests