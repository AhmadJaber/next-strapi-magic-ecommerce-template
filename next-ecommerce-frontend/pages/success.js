import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { API_URL } from '../utils/urls';
import styles from '../styles/Success.module.css';

const useOrder = (session_id) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/orders/confirm`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({ checkout_session: session_id }),
        });
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error(error.message);
      }

      setLoading(false);
    };

    fetchOrder();
  }, [session_id]);

  return { order, loading };
};

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const { order, loading } = useOrder(session_id);
  console.log(order);

  return (
    <div className='wrapper'>
      <Head>
        <title>Thank you for your purchase</title>
        <meta name='description' content='Thank you for your purchase' />
      </Head>

      <h2 className={styles.success}>⭐️ Success!</h2>

      {loading && (
        <div className={styles.order__loading}>
          <img src='/loader.gif' alt='loading your orders....' />
        </div>
      )}

      {order && (
        <div className={styles.order}>
          <p>
            Your order is confirmed, order number is{' '}
            <span className={styles.highlight}>{order.id}</span>
          </p>
          <p>
            product name:{' '}
            <span className={styles.highlight}>{order.product.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
