import { useState, useEffect } from 'react';
import { API_URL } from '../utils/urls';

export const useOrders = (user, getToken) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setLoading(true);
        try {
          const token = await getToken();
          const order_res = await fetch(`${API_URL}/orders`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await order_res.json();
          setOrders(data);
        } catch (error) {
          console.error('orders error', error.message);
        }

        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return { orders, loading };
};
