import Head from 'next/head';
import { fromImageToUrl, API_URL } from '../../utils/urls';
import styles from '../../styles/Product.module.css';
import { twoDecimals } from '../../utils/format';

export default function Product({ product }) {
  return (
    <div className={styles.wrapper}>
      <Head>
        {product.meta_title && <title>{product.meta_title}</title>}
        {product.meta_description && (
          <meta name='description' content={product.meta_description} />
        )}
      </Head>

      <h3>{product.name}</h3>
      <img src={fromImageToUrl(product.image)} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${twoDecimals(product.price)}</p>

      <p>{product.content}</p>
    </div>
  );
}

export async function getStaticProps({ params: { slug } }) {
  const product_res = await fetch(`${API_URL}/products/?slug=${slug}`);
  const found = await product_res.json();

  // ?slug={} is the query-parameter, allow us to search by slug

  return {
    props: {
      product: found[0], // ?api response for filter is an array
    },
  };
}

export async function getStaticPaths() {
  // retrive all the possible paths
  const product_res = await fetch(`${API_URL}/products`);
  const products = await product_res.json();

  // retutrn them to NextJS context
  return {
    paths: products.map((product) => ({
      params: { slug: String(product.slug) },
    })),
    fallback: false, // tells nextjs to show 404 if params doesn't match
  };
}
