import {
  BaseError,
  ResourceNotFoundError,
  generateId,
  log,
} from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { accountsTable } from '@modules/accounts/accounts-schema';
import { groupsTable } from '@modules/groups/groups-schema';
import { accountGroupTable } from '@modules/shared/account-group-schema';
import { eq } from 'drizzle-orm';
import pg from 'postgres';
import type { LoginBody, RegisterBody } from './auth-dto';

export default class AuthService {
  private readonly db = getDb();

  public async login(body: LoginBody) {
    const records = await this.db.query.accounts.findMany({
      where: eq(accountsTable.email, body.email),
      with: {
        accountGroup: {
          with: {
            group: true,
          },
        },
      },
    });

    if (records.length === 0) {
      throw new ResourceNotFoundError('Account', body.email);
    }

    const passwordsMatch = await Bun.password.verify(
      body.password,
      records[0].password_hash,
      'argon2i'
    );

    if (!passwordsMatch) {
      throw new BaseError({
        statusCode: 400,
        code: 'INVALID_CREDENTIALS',
        message: 'Provided credentials are invalid',
        action: 'Check your email and password, then try again',
      });
    }

    return records[0];
  }

  public async register(body: RegisterBody) {
    try {
      const records = await this.db
        .insert(accountsTable)
        .values({
          id: generateId(),
          email: body.email,
          password_hash: await Bun.password.hash(body.password, 'argon2i'),
        })
        .returning();

      const registeredGroup = (
        await this.db.query.groups.findMany({
          where: eq(groupsTable.name, 'Registered User'),
        })
      )[0];

      if (!registeredGroup) {
        log.fatal('Registered User group not found');
        process.exit(1);
      }

      await this.db.insert(accountGroupTable).values({
        account_id: records[0].id,
        group_id: registeredGroup.id,
      });

      return {
        account: records[0],
        groups: [registeredGroup],
      };
    } catch (error) {
      // eslint-disable-next-line import/no-named-as-default-member -- weird bug
      if (error instanceof pg.PostgresError && error.code === '23505') {
        throw new BaseError({
          statusCode: 400,
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Provided email address is already registered',
          action: 'Use a different email address',
        });
      }

      throw error;
    }
  }
}
