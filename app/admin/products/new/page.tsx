import { ProductForm } from '../ProductForm';
import { createProduct } from '../actions';

export default function NewProductPage() {
  return <div><div className="admin-page-header"><div><h1>Додати товар</h1><p>Створіть картку товару, яку можна буде наповнити варіантами.</p></div></div><ProductForm action={createProduct} /></div>;
}
