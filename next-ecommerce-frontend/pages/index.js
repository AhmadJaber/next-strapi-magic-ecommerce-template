import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { fromImageToUrl, API_URL } from '../utils/urls';
import { twoDecimals } from '../utils/format';

export default function Home({ products }) {
  return (
    <div className='wrapper'>
      <Head>
        <title>next e-commerce frontend</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {products.map((product) => (
        <div key={product.name} className={styles.product}>
          <Link href={`/products/${product.slug}`}>
            <a>
              <div className={styles.product__Row}>
                <div className={styles.product__ColImg}>
                  <img src={fromImageToUrl(product.image)} alt={product.name} />
                </div>
                <div className={styles.product__Col}>
                  <h3>{product.name}</h3>
                  <h5 className={styles.product__price}>
                    ${twoDecimals(product.price)}
                  </h5>
                </div>
              </div>
            </a>
          </Link>
        </div>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  // fetch products
  const product_res = await fetch(`${API_URL}/products`);
  const products = await product_res.json();

  return {
    props: {
      products,
    },
  };
}
