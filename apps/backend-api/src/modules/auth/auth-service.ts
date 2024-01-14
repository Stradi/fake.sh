import { generateId } from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { accountsTable } from '@modules/accounts/accounts-schema';
import { eq } from 'drizzle-orm';
import type { LoginBody, RegisterBody } from './auth-dto';

export default class AuthService {
  private readonly db = getDb();

  public async login(body: LoginBody) {
    const records = await this.db.query.accounts.findMany({
      where: eq(accountsTable.email, body.email),
    });

    if (records.length === 0) {
      return null;
    }

    const passwordsMatch = await Bun.password.verify(
      body.password,
      records[0].password_hash,
      'argon2i'
    );

    if (!passwordsMatch) {
      return null;
    }

    return records[0];
  }

  public async register(body: RegisterBody) {
    const records = await this.db
      .insert(accountsTable)
      .values({
        id: generateId(),
        email: body.email,
        password_hash: await Bun.password.hash(body.password, 'argon2i'),
      })
      .returning();

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }
}
