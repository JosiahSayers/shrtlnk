import { expect } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { db } from './db.server';

describe('db', () => {
  it('returns an instance of a prisma client', () => {
    expect(db).toBeInstanceOf(PrismaClient);
  });
});
