import { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/Header.module.css';
import { emailToUserName } from '../utils/format';

export default function Header() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const isHome = router.pathname === '/';

  const goBack = (event) => {
    event.preventDefault();
    router.back();
  };

  return (
    <div className={styles.header}>
      {!isHome ? (
        <div className={styles.back}>
          <a href='#' onClick={goBack}>
            &#8678; back
          </a>
        </div>
      ) : null}

      <div className={styles.header__title}>
        <Link href='/'>
          <a>
            <h2>e-commerce shop nextjs strapi magic & stripe template</h2>
          </a>
        </Link>
      </div>

      <dir className={styles.auth}>
        {user ? (
          <Link href='/account'>
            <a>{emailToUserName(user.email)}</a>
          </Link>
        ) : (
          <Link href='/login'>
            <a>Login</a>
          </Link>
        )}
      </dir>
    </div>
  );
}
