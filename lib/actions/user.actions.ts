'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient } from '../appwrite';
import { appwriteConfig } from '../appwrite/config';
import { parseStringy } from '../utils';
import { cookies } from 'next/headers';

// create a new accout flow
// 1. Users enters full name and email address
// 2. Check if the user already exists using the email address
// 3. Send the OTP to user's email address
// 4. This will send a secret key for creating a session.
// 5. Create a new user document if th user is a new user
// 6 . Return the user's accoundId that will be user to complete the login process
// 7 .Verify the OTP adn authenticate to login

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal('email', [email])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, 'Failed to send email OTP');
  }
};
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });

  if (!accountId) throw new Error('Failed to send an OTP');

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar:
          'https://imgs.search.brave.com/ZOkeuTi7GPN8IsUYjJxXCv7Y-0Macn6K39_YR90iZlg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1LzQ5Lzk4LzM5/LzM2MF9GXzU0OTk4/Mzk3MF9iUkNrWWZr/MFA2UFA1ZktiTWha/TUliMDdtQ0o2ZXNY/TC5qcGc',
        accountId,
      }
    );
  }

  return parseStringy({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return parseStringy({ sessionId: session.$id });
  } catch (error) {
    handleError(error, 'Failed to verify OTP');
  }
};
