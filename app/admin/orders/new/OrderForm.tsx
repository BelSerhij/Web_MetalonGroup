'use client';

import { useState } from 'react';
import Link from 'next/link';

import {
  Plus,
  Package,
  Trash2,
  Search,
  FileText,
} from 'lucide-react';
import { CATALOG_COLORS, findCatalogColor } from '@/lib/catalog/colors';

import {
  createOrder,
} from '@/app/admin/orders/actions';

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  companyName: string | null;
};
type SalesManager = { id:string; name:string };

type Variant = {
  id: string;
  thickness: number;
  color: string;
  coating: string;
  paintingType: string;
  metalBrand: string;
  zincContent: number;
  price: number;
  inStock: boolean;
  stock: number;
};

type Product = {
  id: string;
  title: string;
  unit: string;
  category: string;
  variants: Variant[];
};

type SheetItem = {
  id: number;
  quantity: number;
  length: number | '';
};
type ExtraProductLine = { id: number; category: string; productId: string; variantId: string; colorQuery: string; thickness: string; brand: string; quantity: string; length: string };

type OrderFormProps = {
  customers: Customer[];
  salesManagers: SalesManager[];
  products: Product[];
};

export default function OrderForm({
  customers,
  salesManagers,
  products,
}: OrderFormProps) {
  const [customerId, setCustomerId] =
    useState('');
  const [salesManagerId,setSalesManagerId]=useState('');

  const [productId, setProductId] =
    useState('');
  const [category, setCategory] = useState('');
  const [colorQuery, setColorQuery] = useState('');
  const [thicknessFilter, setThicknessFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [coatingFilter, setCoatingFilter] = useState('');

  const [variantId, setVariantId] =
    useState('');

  const [price, setPrice] =
    useState(0);

  const [note, setNote] =
    useState('');
  const [deliveryService, setDeliveryService] = useState('Самовивіз');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [manualItem, setManualItem] = useState({ title: '', unit: 'шт.', quantity: '1', purchasePrice: '', price: '', note: '' });
  const [extraLines, setExtraLines] = useState<ExtraProductLine[]>([]);

  const [sheetItems, setSheetItems] =
    useState<SheetItem[]>([
      {
        id: 1,
        quantity: 1,
        length: '',
      },
    ]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const selectedProduct =
    products.find(
      (product) =>
        product.id === productId
    );

  const categories = [...new Set(products.map((product) => product.category))].sort((a,b)=>a.localeCompare(b,'uk'));
  const categoryProducts = products.filter((product)=>!category||product.category===category);
  const variantMatchesColor = (variant: Variant, query: string) => {
    const normalized=query.trim().toLocaleLowerCase('uk-UA');
    if(!normalized)return true;
    const digits=normalized.match(/\d{4}/)?.[0];
    const haystack=variant.color.toLocaleLowerCase('uk-UA');
    return haystack.includes(normalized)||Boolean(digits&&haystack.includes(digits))||Boolean(findCatalogColor(normalized)&&findCatalogColor(normalized)?.code===findCatalogColor(variant.color)?.code);
  };
  const colorFilteredVariants=selectedProduct?.variants.filter((variant)=>variantMatchesColor(variant,colorQuery))??[];
  const thicknessOptions=[...new Set(colorFilteredVariants.map((variant)=>variant.thickness))].sort((a,b)=>a-b);
  const thicknessFilteredVariants=colorFilteredVariants.filter((variant)=>!thicknessFilter||String(variant.thickness)===thicknessFilter);
  const brandOptions=[...new Set(thicknessFilteredVariants.map((variant)=>variant.metalBrand))].sort((a,b)=>a.localeCompare(b,'uk'));
  const brandFilteredVariants=thicknessFilteredVariants.filter((variant)=>!brandFilter||variant.metalBrand===brandFilter);
  const coatingOptions=[...new Set(brandFilteredVariants.map((variant)=>`${variant.coating} · ${variant.paintingType}`))].sort((a,b)=>a.localeCompare(b,'uk'));
  const matchingVariants=brandFilteredVariants.filter((variant)=>!coatingFilter||`${variant.coating} · ${variant.paintingType}`===coatingFilter);

  const selectedVariant =
    selectedProduct?.variants.find(
      (variant) =>
        variant.id === variantId
    );

  const handleProductChange = (
    newProductId: string
  ) => {
    setProductId(newProductId);
    setCategory(products.find(p=>p.id===newProductId)?.category||category);
    setColorQuery('');setThicknessFilter('');setBrandFilter('');setCoatingFilter('');
    setVariantId('');

    setPrice(0);
  };

  const handleVariantChange = (
    newVariantId: string
  ) => {
    setVariantId(newVariantId);

    const product =
      products.find(
        (product) =>
          product.id === productId
      );

    const variant =
      product?.variants.find(
        (variant) =>
          variant.id === newVariantId
      );

    setPrice(
      Number(variant?.price ?? 0)
    );
  };

  const resetOrderItemFilters = (nextCategory:string) => { setCategory(nextCategory);setProductId('');setVariantId('');setColorQuery('');setThicknessFilter('');setBrandFilter('');setCoatingFilter('');setPrice(0); };
  const selectVariantFromFilters = (id:string) => handleVariantChange(id);

  const updateSheetItem = (
    id: number,
    field: 'quantity' | 'length',
    value: number | ''
  ) => {
    setSheetItems(
      (currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item
        )
    );
  };

  const addSheetItem = () => {
    setSheetItems(
      (currentItems) => [
        ...currentItems,
        {
          id: Math.max(...currentItems.map((item) => item.id)) + 1,
          quantity: 1,
          length: '',
        },
      ]
    );
  };

  const removeSheetItem = (
    id: number
  ) => {
    if (sheetItems.length === 1) {
      return;
    }

    setSheetItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  const totalSheets =
    (productId ? sheetItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    ) : 0) + extraLines.reduce((sum,line)=>sum+Number(line.quantity||0),0);

  const totalLength =
    (productId ? sheetItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) *
          Number(item.length || 0),
      0
    ) : 0) + extraLines.reduce((sum,line)=>sum+Number(line.quantity||0)*Number(line.length||0),0);

  const totalAmount =
    totalLength *
    Number(price || 0) + extraLines.reduce((sum,line)=>{const v=products.find(p=>p.id===line.productId)?.variants.find(x=>x.id===line.variantId);return sum+Number(line.quantity||0)*Number(line.length||0)*Number(v?.price||0)},0) + Number(manualItem.quantity || 0) * Number(manualItem.price || 0);

  const addExtraLine = () => setExtraLines((lines)=>[...lines,{id:Date.now(),category:'',productId:'',variantId:'',colorQuery:'',thickness:'',brand:'',quantity:'1',length:''}]);
  const updateExtraLine = (id:number, patch:Partial<ExtraProductLine>) => setExtraLines((lines)=>lines.map((line)=>line.id===id?{...line,...patch}:line));

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const hasCatalogItem = Boolean(productId && variantId);
    const hasExtraCatalog = extraLines.some((line)=>line.productId && line.variantId);
    if (productId && !variantId) { alert('Оберіть варіант товару'); return; }
    if (extraLines.some((line)=>Boolean(line.productId)!==Boolean(line.variantId) || (line.productId && (!Number(line.quantity)||!Number(line.length)||Number(line.quantity)<=0||Number(line.length)<=0)))) { alert('Перевірте товар, варіант, кількість і довжину додаткових позицій'); return; }
    if (!hasCatalogItem && !hasExtraCatalog && !manualItem.title.trim()) { alert('Додайте товар із сайту або заповніть ручну позицію'); return; }
    if (manualItem.title.trim() && (!manualItem.purchasePrice || Number(manualItem.purchasePrice) < 0 || Number(manualItem.price) <= 0 || Number(manualItem.quantity) <= 0)) { alert('Для ручної позиції вкажіть кількість, закупівельну та продажну ціну'); return; }

    if (hasCatalogItem && (
      sheetItems.some(
        (item) =>
          item.quantity <= 0 ||
          item.length === '' ||
          Number(item.length) <= 0
      )
    )) {
      alert(
        'Заповніть кількість та висоту всіх листів'
      );

      return;
    }

    if (hasCatalogItem && price <= 0) {
      alert(
        'Вкажіть ціну за погонний метр'
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await createOrder({
        customerId:
          customerId || null,
        salesManagerId: salesManagerId || null,

        note,
        deliveryService,
        deliveryAddress,
        trackingNumber,

        items: [...(hasCatalogItem ? sheetItems.map(
          (item) => ({
            productId,

            variantId,

            quantity:
              Number(item.quantity),

            length:
              Number(item.length),

            price:
              Number(price),
          })
        ) : []), ...extraLines.filter((line)=>line.productId&&line.variantId).map((line)=>({productId:line.productId,variantId:line.variantId,quantity:Number(line.quantity),length:Number(line.length),price:Number(products.find(p=>p.id===line.productId)?.variants.find(v=>v.id===line.variantId)?.price||0)}))],
        manualItems: manualItem.title.trim() ? [{ title: manualItem.title, unit: manualItem.unit, quantity: Number(manualItem.quantity), purchasePrice: Number(manualItem.purchasePrice) || undefined, price: Number(manualItem.price), note: manualItem.note }] : [],
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : 'Помилка при створенні замовлення'
      );

      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit}
    >
      {/* КЛІЄНТ */}

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Клієнт
            </h2>

            <p>
              Оберіть клієнта для замовлення
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="customer">
              Клієнт
            </label>

            <select
              id="customer"
              value={customerId}
              onChange={(event) =>
                setCustomerId(
                  event.target.value
                )
              }
            >
              <option value="">
                Без клієнта
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}

                    {customer.phone
                      ? ` — ${customer.phone}`
                      : ''}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="admin-form-group"><label htmlFor="salesManager">Відповідальний менеджер</label><select id="salesManager" value={salesManagerId} onChange={(e)=>setSalesManagerId(e.target.value)}><option value="">Не призначено</option>{salesManagers.map((manager)=><option key={manager.id} value={manager.id}>{manager.name}</option>)}</select></div>
        </div>
      </div>

      <details className="admin-section-card order-manual-compact order-optional-section">
        <summary><Package size={18}/><span><strong>Позиція поза каталогом</strong><small>За потреби додайте товар, якого немає на сайті.</small></span><Plus size={17}/></summary>
        <div className="admin-form-grid">
          <label className="admin-form-group">Назва товару<input value={manualItem.title} onChange={(e)=>setManualItem({...manualItem,title:e.target.value})} placeholder="Наприклад, планка нестандартного розміру" /></label>
          <label className="admin-form-group">Кількість<input type="number" min="0.001" step="0.001" value={manualItem.quantity} onChange={(e)=>setManualItem({...manualItem,quantity:e.target.value})} /></label>
          <label className="admin-form-group">Одиниця<select value={manualItem.unit} onChange={(e)=>setManualItem({...manualItem,unit:e.target.value})}><option>шт.</option><option>м.п.</option><option>м²</option><option>компл.</option></select></label>
          <label className="admin-form-group">Закупівельна ціна, грн<input type="number" min="0" step="0.01" value={manualItem.purchasePrice} onChange={(e)=>setManualItem({...manualItem,purchasePrice:e.target.value})} /></label>
          <label className="admin-form-group">Продажна ціна за одиницю, грн<input type="number" min="0.01" step="0.01" value={manualItem.price} onChange={(e)=>setManualItem({...manualItem,price:e.target.value})} /></label>
          <label className="admin-form-group">Примітка<input value={manualItem.note} onChange={(e)=>setManualItem({...manualItem,note:e.target.value})} /></label>
        </div>
        {manualItem.title && <p className="admin-order-stock-hint">Позиція буде в черзі закупівлі. Вона не змінює залишки готової продукції автоматично.</p>}
      </details>

      {/* ТОВАР */}

      <div className="admin-section-card order-invoice-card">
        <div className="admin-section-header">
          <div>
            <h2><FileText size={20}/> Рахунок · позиції</h2>
            <p>Спочатку група сайту, далі модель і параметри матеріалу.</p>
          </div>
        </div>

        <div className="order-invoice-selector">
          <div className="order-category-picker" role="group" aria-label="Категорія товару">
            {categories.map((item)=><button type="button" key={item} className={category===item?'active':''} onClick={()=>resetOrderItemFilters(item)}>{item}</button>)}
          </div>
          <div className="order-variant-filters">
            <label>Модель<select value={productId} onChange={(event)=>handleProductChange(event.target.value)}><option value="">Оберіть модель</option>{categoryProducts.map((product)=><option key={product.id} value={product.id}>{product.title}</option>)}</select></label>
            <label className="order-color-search"><span>Колір або RAL</span><div><Search size={16}/><input list="order-ral-colors" value={colorQuery} disabled={!selectedProduct} onChange={(event)=>{setColorQuery(event.target.value);setThicknessFilter('');setBrandFilter('');setCoatingFilter('');setVariantId('');setPrice(0)}} placeholder="Наприклад, RAL 3005"/><datalist id="order-ral-colors">{[...new Set((selectedProduct?.variants??[]).map((v)=>v.color))].map((color)=><option key={color} value={color}/>)}{CATALOG_COLORS.map((color)=><option key={color.code} value={color.code}>{color.name}</option>)}</datalist></div></label>
            <label>Товщина<select value={thicknessFilter} disabled={!selectedProduct||!colorFilteredVariants.length} onChange={(event)=>{setThicknessFilter(event.target.value);setBrandFilter('');setCoatingFilter('');setVariantId('');setPrice(0)}}><option value="">Усі товщини</option>{thicknessOptions.map((value)=><option key={value} value={value}>{value} мм</option>)}</select></label>
            <label>Виробник<select value={brandFilter} disabled={!thicknessFilteredVariants.length} onChange={(event)=>{setBrandFilter(event.target.value);setCoatingFilter('');setVariantId('');setPrice(0)}}><option value="">Усі виробники</option>{brandOptions.map((value)=><option key={value}>{value}</option>)}</select></label>
            <label>Покриття<select value={coatingFilter} disabled={!brandFilteredVariants.length} onChange={(event)=>{setCoatingFilter(event.target.value);setVariantId('');setPrice(0)}}><option value="">Усі покриття</option>{coatingOptions.map((value)=><option key={value}>{value}</option>)}</select></label>
          </div>
          {selectedProduct&&colorFilteredVariants.length>0&&<div className="order-color-swatches">{[...new Map(colorFilteredVariants.map((v)=>[v.color,v])).entries()].map(([color])=>{const swatch=findCatalogColor(color);return <button type="button" key={color} className={colorQuery===color?'active':''} onClick={()=>{setColorQuery(color);setThicknessFilter('');setBrandFilter('');setCoatingFilter('');setVariantId('');setPrice(0)}} title={`${color}${swatch?` · ${swatch.name}`:''}`}><i style={{background:swatch?.hex??'#d6d9d2'}}/><span>{color}</span></button>})}</div>}
          {selectedProduct&&colorQuery&&matchingVariants.length>0&&<label className="order-exact-variant">Точна позиція<select value={variantId} onChange={(event)=>selectVariantFromFilters(event.target.value)}><option value="">Оберіть варіант · {matchingVariants.length}</option>{matchingVariants.map((variant)=><option key={variant.id} value={variant.id}>{variant.color} · {variant.thickness} мм · {variant.metalBrand} · {variant.coating} {variant.paintingType} · {variant.price.toLocaleString('uk-UA')} грн/{selectedProduct.unit}</option>)}</select></label>}
          {selectedProduct&&colorQuery&&!colorFilteredVariants.length&&<p className="order-no-match">За цим кольором у вибраній моделі варіантів не знайдено.</p>}
        </div>

        {selectedVariant && (
          <div className="admin-order-variant-info">
            <span>
              Колір:{' '}
              {selectedVariant.color}
            </span>

            <span>
              Товщина:{' '}
              {selectedVariant.thickness} мм
            </span>

            <span>
              Покриття:{' '}
              {selectedVariant.coating}
            </span>

            <span>
              Тип фарбування:{' '}
              {
                selectedVariant.paintingType
              }
            </span>

            <span>
              Виробник:{' '}
              {selectedVariant.metalBrand}
            </span>

            <span>
              Цинк:{' '}
              {selectedVariant.zincContent} г/м²
            </span>
          </div>
        )}
        {selectedVariant && selectedVariant.stock <= 0 && <p className="admin-order-stock-hint">Немає готового залишку. Це замовлення можна оформити, але товар потрібно буде закупити або виготовити.</p>}
        <div className="admin-order-extra-products"><div className="admin-section-header"><div><h3>Ще позиції</h3><p>Додавайте інші товари через ті самі групи й характеристики.</p></div><button type="button" className="admin-secondary-button" onClick={addExtraLine}><Plus size={16}/> Додати позицію</button></div>
          {extraLines.map((line)=>{const p=products.find((item)=>item.id===line.productId);const v=p?.variants.find((item)=>item.id===line.variantId);const lineCategoryProducts=products.filter((item)=>!line.category||item.category===line.category);const lineColorVariants=(p?.variants??[]).filter((item)=>variantMatchesColor(item,line.colorQuery));const lineThicknessVariants=lineColorVariants.filter((item)=>!line.thickness||String(item.thickness)===line.thickness);const lineBrandVariants=lineThicknessVariants.filter((item)=>!line.brand||item.metalBrand===line.brand);const lineThicknesses=[...new Set(lineColorVariants.map((item)=>item.thickness))].sort((a,b)=>a-b);const lineBrands=[...new Set(lineThicknessVariants.map((item)=>item.metalBrand))].sort((a,b)=>a.localeCompare(b,'uk'));return <div className="admin-order-sheet-row admin-order-extra-row" key={line.id}><label className="admin-form-group">Категорія<select value={line.category} onChange={(e)=>updateExtraLine(line.id,{category:e.target.value,productId:'',variantId:'',colorQuery:'',thickness:'',brand:''})}><option value="">Оберіть групу</option>{categories.map((cat)=><option key={cat}>{cat}</option>)}</select></label><label className="admin-form-group">Модель<select value={line.productId} onChange={(e)=>updateExtraLine(line.id,{productId:e.target.value,variantId:'',colorQuery:'',thickness:'',brand:''})}><option value="">Оберіть модель</option>{lineCategoryProducts.map((item)=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label className="admin-form-group">Колір / RAL<input list={`extra-ral-${line.id}`} value={line.colorQuery} disabled={!p} placeholder="RAL 3005" onChange={(e)=>updateExtraLine(line.id,{colorQuery:e.target.value,variantId:'',thickness:'',brand:''})}/><datalist id={`extra-ral-${line.id}`}>{[...new Set((p?.variants??[]).map((item)=>item.color))].map((color)=><option key={color} value={color}/>)}{CATALOG_COLORS.map((color)=><option key={color.code} value={color.code}/>)}</datalist></label><label className="admin-form-group">Товщина<select value={line.thickness} onChange={(e)=>updateExtraLine(line.id,{thickness:e.target.value,brand:'',variantId:''})}><option value="">Будь-яка</option>{lineThicknesses.map((item)=><option key={item} value={item}>{item} мм</option>)}</select></label><label className="admin-form-group">Виробник<select value={line.brand} onChange={(e)=>updateExtraLine(line.id,{brand:e.target.value,variantId:''})}><option value="">Будь-який</option>{lineBrands.map((item)=><option key={item}>{item}</option>)}</select></label><label className="admin-form-group">Варіант<select value={line.variantId} disabled={!line.colorQuery} onChange={(e)=>updateExtraLine(line.id,{variantId:e.target.value})}><option value="">Оберіть · {lineBrandVariants.length}</option>{lineBrandVariants.map((item)=><option key={item.id} value={item.id}>{item.color} · {item.thickness} мм · {item.metalBrand} · {item.coating} {item.paintingType}</option>)}</select></label><label className="admin-form-group">Кількість<input type="number" min="1" step="1" value={line.quantity} onChange={(e)=>updateExtraLine(line.id,{quantity:e.target.value})}/></label><label className="admin-form-group">Довжина, м<input type="number" min="0.1" step="0.01" value={line.length} onChange={(e)=>updateExtraLine(line.id,{length:e.target.value})}/></label><div className="admin-order-sheet-result"><span>Сума</span><strong>{(Number(line.quantity||0)*Number(line.length||0)*Number(v?.price||0)).toLocaleString('uk-UA')} грн</strong></div><button type="button" className="admin-danger-button" onClick={()=>setExtraLines((lines)=>lines.filter((item)=>item.id!==line.id))}><Trash2 size={16}/> Прибрати</button></div>})}
        </div>
      </div>

      <details className="admin-section-card order-optional-section">
        <summary><Package size={18}/><span><strong>Доставка</strong><small>Служба, адреса й ТТН</small></span><Plus size={17}/></summary>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label htmlFor="deliveryService">Служба / спосіб</label><select id="deliveryService" value={deliveryService} onChange={(e) => setDeliveryService(e.target.value)}>{['Нова пошта','Укрпошта','Делівері','Наша доставка','Самовивіз'].map((name) => <option key={name}>{name}</option>)}</select></div>
          <div className="admin-form-group"><label htmlFor="deliveryAddress">Адреса / відділення</label><input id="deliveryAddress" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Місто, відділення або адреса" /></div>
          <div className="admin-form-group"><label htmlFor="trackingNumber">ТТН (за наявності)</label><input id="trackingNumber" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} /></div>
        </div>
      </details>

      {/* РОЗМІРИ ЛИСТІВ */}

      <div className="admin-section-card order-dimensions-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Розміри листів
            </h2>

            <p>
              Додайте кількість та висоту
              кожної групи листів
            </p>
          </div>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={addSheetItem}
          >
            <Plus size={18} />

            Додати розмір
          </button>
        </div>

        <div className="admin-order-sheets">
          {sheetItems.map(
            (item) => {
              const itemLength =
                Number(item.quantity || 0) *
                Number(item.length || 0);

              return (
                <div
                  key={item.id}
                  className="admin-order-sheet-row"
                >
                  <div className="admin-form-group">
                    <label>
                      Кількість листів
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateSheetItem(
                          item.id,
                          'quantity',
                          Number(
                            event.target.value
                          )
                        )
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>
                      Висота листа, м
                    </label>

                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={item.length}
                      onChange={(event) =>
                        updateSheetItem(
                          item.id,
                          'length',
                          event.target.value === ''
                            ? ''
                            : Number(
                                event.target.value
                              )
                        )
                      }
                    />
                  </div>

                  <div className="admin-order-sheet-result">
                    <span>
                      Разом
                    </span>

                    <strong>
                      {itemLength.toLocaleString(
                        'uk-UA',
                        {
                          maximumFractionDigits: 2,
                        }
                      )}{' '}
                      м.п.
                    </strong>
                  </div>

                  {sheetItems.length > 1 && (
                    <button
                      type="button"
                      className="admin-danger-button"
                      onClick={() =>
                        removeSheetItem(
                          item.id
                        )
                      }
                    >
                      <Trash2 size={18} />

                      Видалити
                    </button>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* ВАРТІСТЬ */}

      <div className="admin-section-card order-price-card">
        <div className="admin-section-header">
          <div>
            <h2>
              Вартість
            </h2>

            <p>
              Ви можете змінити стандартну ціну
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>
              Ціна за погонний метр, грн
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(
                  Number(
                    event.target.value
                  )
                )
              }
            />
          </div>

          {selectedVariant && (
            <div className="admin-form-group">
              <label>
                Стандартна ціна
              </label>

              <div className="admin-readonly-value">
                {selectedVariant.price.toLocaleString(
                  'uk-UA'
                )}{' '}
                грн / м.п.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ПІДСУМОК */}

      <div className="admin-order-summary">
        <div>
          <span>
            Загальна кількість листів
          </span>

          <strong>
            {totalSheets.toLocaleString(
              'uk-UA'
            )}{' '}
            шт.
          </strong>
        </div>

        <div>
          <span>
            Загальна кількість метрів
          </span>

          <strong>
            {totalLength.toLocaleString(
              'uk-UA',
              {
                maximumFractionDigits: 2,
              }
            )}{' '}
            м.п.
          </strong>
        </div>

        <div>
          <span>
            Ціна за метр
          </span>

          <strong>
            {Number(price).toLocaleString(
              'uk-UA'
            )}{' '}
            грн
          </strong>
        </div>

        <div className="admin-order-summary-total">
          <span>
            Загальна сума
          </span>

          <strong>
            {totalAmount.toLocaleString(
              'uk-UA',
              {
                maximumFractionDigits: 2,
              }
            )}{' '}
            грн
          </strong>
        </div>
      </div>

      {/* ДОДАТКОВА ІНФОРМАЦІЯ */}

      <details className="admin-section-card order-optional-section order-note-section">
        <summary><FileText size={18}/><span><strong>Примітка до замовлення</strong><small>Додаткова інформація для команди</small></span><Plus size={17}/></summary>

        <div className="admin-form-group">
          <label htmlFor="note">
            Примітка
          </label>

          <textarea
            id="note"
            placeholder="Додаткова інформація щодо замовлення..."
            rows={5}
            value={note}
            onChange={(event) =>
              setNote(
                event.target.value
              )
            }
          />
        </div>
      </details>

      {/* КНОПКИ */}

      <div className="admin-form-actions">
        <Link
          href="/admin/orders"
          className="admin-secondary-button"
        >
          Скасувати
        </Link>

        <button
          type="submit"
          className="admin-primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Створення...'
            : 'Створити замовлення'}
        </button>
      </div>
    </form>
  );
}
