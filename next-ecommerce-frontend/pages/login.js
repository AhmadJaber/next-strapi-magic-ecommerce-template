import Head from 'next/head';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/Login.module.css';

export default function Login() {
  const { loginUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');

  //TODO:add validation
  const handleSubmit = (event) => {
    event.preventDefault();
    loginUser(email);
  };

  return (
    <div className='wrapper'>
      <Head>
        <title>Login</title>
        <meta name='description' content='login here to make your purchase' />
      </Head>

      <h2 className='page-title'>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='email'
          name='email'
          id='email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder='Email Address'
          className={styles.field}
        />
        <button type='submit' className={styles.btn}>
          Login
        </button>
      </form>
    </div>
  );
}
