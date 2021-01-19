import Head from 'next/head';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { emailToUserName } from '../utils/format';
import styles from '../styles/Account.module.css';

export default function Account() {
  const { user, logoutUser } = useContext(AuthContext);

  if (!user) {
    return (
      <div className='wrapper'>
        <p>please login or register</p>
        <Link href='/login'>
          <a>login page</a>
        </Link>
      </div>
    );
  }

  return (
    <div className='wrapper'>
      <Head>
        <title>User Account page</title>
        <meta name='description' content='the account page, view your order' />
      </Head>

      <h2 className='page-title'>Account Page</h2>

      <div className={styles.userinfo}>
        <p>
          logged in as: <span>{emailToUserName(user.email)}</span>
        </p>
        <p>
          email: <span>{user.email}</span>
        </p>
      </div>

      <a href='#' onClick={logoutUser} className={styles.btn}>
        Logout
      </a>
    </div>
  );
}
