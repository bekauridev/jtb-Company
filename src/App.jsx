import { useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, BatteryFull, Bell, Camera, Check, ChevronDown,
  CircleDollarSign, Clock3, Compass, Flashlight, LayoutDashboard, LockKeyhole,
  Menu, MessageCircle, Minus, Package, Pencil, Phone, Plus, RotateCcw,
  Search, ShoppingBag, Sparkles, Star, Store, Trash2, Users, Wifi, X, Zap,
} from 'lucide-react'
import { categories, demoOrders, initialProducts } from './data'
import './App.css'

const CATALOG_KEY = 'jtb-demo-products'
const ORDER_KEY = 'jtb-demo-new-order'

function useCatalog() {
  const [products, setProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CATALOG_KEY)) || initialProducts
    } catch {
      return initialProducts
    }
  })

  useEffect(() => localStorage.setItem(CATALOG_KEY, JSON.stringify(products)), [products])
  return [products, setProducts]
}

function useOrderNotifications() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let timer
    const show = (event = {}) => {
      setToast({ id: event.id || Date.now(), message: 'თქვენ გაქვთ ახალი შეკვეთა' })
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setToast(null), 5200)
    }
    const channel = 'BroadcastChannel' in window ? new BroadcastChannel('jtb-orders') : null
    const onStorage = (event) => {
      if (event.key === ORDER_KEY && event.newValue) show(JSON.parse(event.newValue))
    }
    if (channel) channel.onmessage = ({ data }) => show(data)
    window.addEventListener('storage', onStorage)
    return () => {
      channel?.close()
      window.removeEventListener('storage', onStorage)
      window.clearTimeout(timer)
    }
  }, [])

  const trigger = () => {
    const event = { id: Date.now(), createdAt: new Date().toISOString() }
    localStorage.setItem(ORDER_KEY, JSON.stringify(event))
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('jtb-orders')
      channel.postMessage(event)
      channel.close()
    }
    setToast({ id: event.id, message: 'თქვენ გაქვთ ახალი შეკვეთა' })
  }

  return { toast, setToast, trigger }
}

function Brand({ compact = false }) {
  return (
    <a className={`brand ${compact ? 'brand--compact' : ''}`} href="/" aria-label="JTB Company მთავარი გვერდი">
      <span className="brand__mark">JTB</span>
      <span className="brand__words"><strong>JTB Company</strong><small>ქართული სისუფთავე</small></span>
    </a>
  )
}

function NotificationToast({ toast, onClose }) {
  if (!toast) return null
  return (
    <div className="order-toast" role="status" aria-live="polite">
      <span className="order-toast__icon"><Bell size={20} /></span>
      <span><small>ახალი შეტყობინება</small><strong>{toast.message}</strong></span>
      <button className="icon-button" type="button" onClick={onClose} aria-label="დახურვა"><X size={18} /></button>
    </div>
  )
}

function Header({ cartCount, onCart, query, setQuery }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header__inner shell">
        <Brand />
        <nav className={mobileOpen ? 'nav nav--open' : 'nav'} aria-label="მთავარი ნავიგაცია">
          <a href="#products" onClick={() => setMobileOpen(false)}>პროდუქცია</a>
          <a href="#advantages" onClick={() => setMobileOpen(false)}>რატომ JTB</a>
          <a href="#contact" onClick={() => setMobileOpen(false)}>კონტაქტი</a>
          <a className="mobile-admin-link" href="/admin">ადმინისტრირება</a>
        </nav>
        <div className="header__actions">
          <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ძიება" aria-label="პროდუქტის ძიება" /></label>
          <a className="admin-link" href="/admin" title="ადმინისტრირება"><LayoutDashboard size={19} /></a>
          <button className="cart-button" type="button" onClick={onCart} aria-label={`კალათა, ${cartCount} პროდუქტი`}><ShoppingBag size={20} /><span>{cartCount}</span></button>
          <button className="menu-button" type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="მენიუ">{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
    </header>
  )
}

function ProductCard({ product, onAdd, onOpen }) {
  return (
    <article className="product-card">
      <button className="product-card__image" type="button" onClick={() => onOpen(product)} aria-label={`${product.name} დეტალურად`}>
        {product.featured && <span className="featured-tag"><Star size={13} fill="currentColor" /> რჩეული</span>}
        <img src={product.image} alt={`${product.name} ${product.volume}`} />
      </button>
      <div className="product-card__body">
        <div className="product-card__meta"><span>{product.category}</span><span>{product.volume}</span></div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card__footer"><strong>{product.price.toFixed(2)} ₾</strong><button className="add-button" type="button" onClick={() => onAdd(product)} disabled={!product.inStock}>{product.inStock ? <><Plus size={18} /> დამატება</> : 'არ არის მარაგში'}</button></div>
      </div>
    </article>
  )
}

function ProductModal({ product, onClose, onAdd }) {
  if (!product) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-label={product.name} onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="დახურვა"><X size={20} /></button>
        <div className="product-modal__visual"><img src={product.image} alt={product.name} /></div>
        <div className="product-modal__content">
          <span className="eyebrow">{product.category} · {product.volume}</span><h2>{product.name}</h2><p>{product.description}</p>
          <ul className="benefit-list"><li><Check size={17} /> დამზადებულია საქართველოში</li><li><Check size={17} /> ეფექტური კონცენტრირებული ფორმულა</li><li><Check size={17} /> მოსახერხებელი ყოველდღიური გამოყენება</li></ul>
          <div className="product-modal__action"><strong>{product.price.toFixed(2)} ₾</strong><button className="primary-button" type="button" onClick={() => { onAdd(product); onClose() }}><ShoppingBag size={18} /> კალათაში</button></div>
        </div>
      </section>
    </div>
  )
}

function CartDrawer({ open, cart, products, onClose, setCart, onOrder }) {
  const entries = Object.entries(cart).map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity })).filter(({ product }) => product)
  const total = entries.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const adjust = (id, delta) => setCart((current) => {
    const next = { ...current, [id]: Math.max(0, (current[id] || 0) + delta) }
    if (!next[id]) delete next[id]
    return next
  })
  if (!open) return null
  return (
    <div className="drawer-layer" role="presentation" onMouseDown={onClose}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="კალათა" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer__header"><div><span className="eyebrow">თქვენი არჩევანი</span><h2>კალათა</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="დახურვა"><X size={20} /></button></div>
        <div className="cart-list">
          {entries.length === 0 && <div className="empty-state"><ShoppingBag size={34} /><h3>კალათა ცარიელია</h3><p>დაამატეთ სასურველი პროდუქტი კატალოგიდან.</p></div>}
          {entries.map(({ product, quantity }) => <div className="cart-item" key={product.id}><img src={product.image} alt="" /><div><strong>{product.name}</strong><small>{product.volume} · {product.price.toFixed(2)} ₾</small><div className="quantity-control"><button type="button" onClick={() => adjust(product.id, -1)} aria-label="რაოდენობის შემცირება"><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => adjust(product.id, 1)} aria-label="რაოდენობის გაზრდა"><Plus size={15} /></button></div></div><button className="icon-button" type="button" onClick={() => adjust(product.id, -quantity)} aria-label="პროდუქტის წაშლა"><Trash2 size={17} /></button></div>)}
        </div>
        {entries.length > 0 && <div className="cart-summary"><div><span>ჯამი</span><strong>{total.toFixed(2)} ₾</strong></div><button className="primary-button primary-button--wide" type="button" onClick={() => { onOrder(); setCart({}); onClose() }}><Check size={19} /> შეკვეთის გაფორმება</button><small>ეს არის დემო შეკვეთა. გადახდა არ შესრულდება.</small></div>}
      </aside>
    </div>
  )
}

function Storefront({ products, notification }) {
  const [category, setCategory] = useState('ყველა')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [orderDone, setOrderDone] = useState(false)
  const filtered = products.filter((product) => (category === 'ყველა' || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase()))
  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0)
  const addToCart = (product) => { setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 })); setCartOpen(true) }
  const placeOrder = () => { notification.trigger(); setOrderDone(true); window.setTimeout(() => setOrderDone(false), 4800) }

  return (
    <div className="storefront">
      <Header cartCount={cartCount} onCart={() => setCartOpen(true)} query={query} setQuery={setQuery} />
      <main>
        <section className="hero-section">
          <div className="hero-noise" />
          <div className="hero__content shell">
            <div className="hero__copy">
              <span className="hero-label"><Sparkles size={16} /> დამზადებულია საქართველოში</span>
              <h1>სისუფთავე,<br /><em>რომელიც იგრძნობა.</em></h1>
              <p>ეფექტური საწმენდი საშუალებები თქვენი სახლის ყველა ზედაპირისთვის — ქართული ხარისხი, რომელსაც ენდობით.</p>
              <div className="hero__actions"><a className="primary-button" href="#products"><ShoppingBag size={18} /> პროდუქციის ნახვა</a><a className="text-button" href="#advantages">რატომ JTB <ArrowRight size={18} /></a></div>
              <div className="hero__trust"><span><strong>10+</strong> პროდუქტი</span><span><strong>100%</strong> ქართული</span><span><strong>3 სთ</strong> სწრაფი მიწოდება</span></div>
            </div>
            <div className="hero__products" aria-label="JTB პროდუქცია"><div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" /><img className="hero-product hero-product--back" src="/products/pearl-5l.webp" alt="მარგალიტი 5 ლიტრი" /><img className="hero-product hero-product--main" src="/products/khalasi-1l.webp" alt="ხალასი 1 ლიტრი" /><img className="hero-product hero-product--side" src="/products/typhoon-1l.webp" alt="ტაიფუნი 1 ლიტრი" /><span className="hero-note"><Zap size={16} fill="currentColor" /><b>2%</b> კონცენტრატი</span></div>
          </div>
          <a className="hero-scroll" href="#products">აღმოაჩინე პროდუქცია <ChevronDown size={17} /></a>
        </section>

        <section className="products-section shell" id="products">
          <div className="section-heading"><div><span className="eyebrow">ჩვენი პროდუქცია</span><h2>სისუფთავე ყველა სივრცისთვის</h2></div><p>აირჩიეთ პროდუქტი დანიშნულების მიხედვით და შეუკვეთეთ რამდენიმე წამში.</p></div>
          <div className="category-bar" role="tablist" aria-label="პროდუქტის კატეგორიები">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} type="button" onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} onOpen={setSelected} />)}</div>
          {filtered.length === 0 && <div className="no-results"><Search size={28} /><h3>პროდუქტი ვერ მოიძებნა</h3><button className="text-button" type="button" onClick={() => setQuery('')}>ძიების გასუფთავება</button></div>}
        </section>

        <section className="advantages" id="advantages"><div className="shell advantages__inner"><div className="advantages__intro"><span className="eyebrow eyebrow--light">რატომ JTB</span><h2>ძლიერი ფორმულა.<br />მარტივი ყოველდღიურობა.</h2><p>პროდუქტები შექმნილია სხვადასხვა ზედაპირის უსაფრთხოდ და ეფექტურად მოსავლელად.</p><a className="text-button text-button--light" href="tel:+995599550625"><Phone size={18} /> +995 599 550 625</a></div><div className="advantages__list"><article><span>01</span><div><h3>ქართული წარმოება</h3><p>ადგილობრივად დამზადებული, ხარისხზე ორიენტირებული პროდუქცია.</p></div></article><article><span>02</span><div><h3>ეკონომიური გამოყენება</h3><p>კონცენტრირებული ფორმულა ნაკლები დანახარჯისთვის.</p></div></article><article><span>03</span><div><h3>სწრაფი მიწოდება</h3><p>შეკვეთა პირდაპირ თქვენს კართან, მარტივად და სწრაფად.</p></div></article></div></div></section>
        <section className="cta-band shell"><div><span className="eyebrow">სახლისთვის თუ ბიზნესისთვის</span><h2>სისუფთავე იწყება სწორი არჩევანით.</h2></div><a className="primary-button" href="#products">აირჩიე პროდუქტი <ArrowRight size={18} /></a></section>
      </main>
      <footer id="contact"><div className="shell footer__main"><Brand compact /><p>ქართული საწმენდი საშუალებები სახლისა და პროფესიული სივრცეებისთვის.</p><div className="footer__links"><a href="tel:+995599550625"><Phone size={17} /> +995 599 550 625</a><a href="https://www.facebook.com/JTBkhalasi" target="_blank" rel="noreferrer"><MessageCircle size={17} /> Facebook</a><a href="/admin"><LayoutDashboard size={17} /> დემო ადმინი</a></div></div><div className="shell footer__bottom"><span>© 2026 JTB Company</span><span>სადემონსტრაციო ვერსია</span></div></footer>
      <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />
      <CartDrawer open={cartOpen} cart={cart} products={products} onClose={() => setCartOpen(false)} setCart={setCart} onOrder={placeOrder} />
      <NotificationToast toast={notification.toast} onClose={() => notification.setToast(null)} />
      {orderDone && <div className="success-toast"><Check size={20} /> დემო შეკვეთა წარმატებით გაფორმდა</div>}
    </div>
  )
}

function StatusBadge({ status }) {
  return <span className={`status status--${status === 'ახალი' ? 'new' : status === 'მუშავდება' ? 'progress' : 'done'}`}>{status}</span>
}

function Admin({ products, setProducts, notification }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id)
  const [saved, setSaved] = useState(false)
  const [section, setSection] = useState('products')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState(products[0])
  const visible = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
  const save = (event) => { event.preventDefault(); setProducts((current) => current.map((product) => product.id === draft.id ? draft : product)); setSaved(true); window.setTimeout(() => setSaved(false), 2600) }
  const reset = () => { setProducts(initialProducts); setSelectedId(initialProducts[0].id); setDraft(initialProducts[0]) }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar"><Brand compact /><nav aria-label="ადმინისტრირების მენიუ"><button className={section === 'dashboard' ? 'active' : ''} type="button" onClick={() => setSection('dashboard')}><LayoutDashboard size={19} /> მიმოხილვა</button><button className={section === 'products' ? 'active' : ''} type="button" onClick={() => setSection('products')}><Package size={19} /> პროდუქტები <span>{products.length}</span></button><button className={section === 'orders' ? 'active' : ''} type="button" onClick={() => setSection('orders')}><ShoppingBag size={19} /> შეკვეთები <i>1</i></button><button type="button"><Users size={19} /> მომხმარებლები</button></nav><div className="sidebar-bottom"><a href="/" target="_blank"><Store size={18} /> საიტის ნახვა</a><a href="/notification" target="_blank"><Bell size={18} /> შეტყობინების დემო</a></div></aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><span className="demo-badge">DEMO</span><span>ადმინისტრირების სივრცე</span></div><div className="admin-profile"><span>JTB</span><div><strong>ადმინისტრატორი</strong><small>admin@jtb.ge</small></div></div></header>
        <div className="admin-content">
          <div className="admin-title"><div><span className="eyebrow">კატალოგის მართვა</span><h1>{section === 'orders' ? 'შეკვეთები' : section === 'dashboard' ? 'მიმოხილვა' : 'პროდუქტები'}</h1><p>მართეთ პროდუქცია, ფასები და ხელმისაწვდომობა ერთ სივრცეში.</p></div><div><button className="secondary-button" type="button" onClick={reset}><RotateCcw size={17} /> აღდგენა</button><a className="primary-button" href="/" target="_blank">საიტის ნახვა <ArrowRight size={17} /></a></div></div>
          <section className="metrics-grid"><article><span className="metric-icon metric-icon--green"><Package size={20} /></span><div><small>აქტიური პროდუქტი</small><strong>{products.filter((product) => product.inStock).length}</strong><em>კატალოგში</em></div></article><article><span className="metric-icon metric-icon--coral"><ShoppingBag size={20} /></span><div><small>ახალი შეკვეთა</small><strong>12</strong><em>+18% ამ კვირაში</em></div></article><article><span className="metric-icon metric-icon--yellow"><CircleDollarSign size={20} /></span><div><small>გაყიდვები</small><strong>1,285 ₾</strong><em>ბოლო 30 დღე</em></div></article><article><span className="metric-icon metric-icon--blue"><Clock3 size={20} /></span><div><small>საშუალო პასუხი</small><strong>8 წთ</strong><em>ძალიან კარგი</em></div></article></section>
          {section === 'orders' ? <OrdersPanel notification={notification} /> : section === 'dashboard' ? <DashboardPanel setSection={setSection} /> : <div className="catalog-admin"><section className="admin-panel product-list-panel"><div className="panel-heading"><div><h2>ყველა პროდუქტი</h2><p>{products.length} ჩანაწერი კატალოგში</p></div><label className="admin-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ძიება..." /></label></div><div className="admin-product-list">{visible.map((product) => <button type="button" className={selectedId === product.id ? 'admin-product active' : 'admin-product'} key={product.id} onClick={() => { setSelectedId(product.id); setDraft(product) }}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.category} · {product.volume}</small></span><b>{product.price.toFixed(2)} ₾</b><StatusBadge status={product.inStock ? 'გაგზავნილი' : 'მუშავდება'} /><Pencil size={16} /></button>)}</div></section>{draft && <EditPanel draft={draft} setDraft={setDraft} save={save} saved={saved} />}</div>}
        </div>
      </main>
      <NotificationToast toast={notification.toast} onClose={() => notification.setToast(null)} />
    </div>
  )
}

function EditPanel({ draft, setDraft, save, saved }) {
  return <form className="admin-panel edit-panel" onSubmit={save}><div className="panel-heading"><div><h2>ჩანაწერის რედაქტირება</h2><p>ცვლილება გამოჩნდება დემო საიტზე</p></div><span className="edit-live"><span /> LIVE</span></div><div className="edit-preview"><img src={draft.image} alt="" /><div><small>საიტის წინასწარი ნახვა</small><strong>{draft.name}</strong><span>{Number(draft.price).toFixed(2)} ₾ · {draft.volume}</span></div></div><label className="field"><span>პროდუქტის დასახელება</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><div className="field-row"><label className="field"><span>ფასი (₾)</span><input type="number" min="0" step="0.5" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></label><label className="field"><span>მოცულობა</span><input value={draft.volume} onChange={(event) => setDraft({ ...draft, volume: event.target.value })} /></label></div><label className="field"><span>კატეგორია</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>მოკლე აღწერა</span><textarea rows="4" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><ToggleRow title="მარაგშია" subtitle="მომხმარებელს შეუძლია შეკვეთა" active={draft.inStock} onClick={() => setDraft({ ...draft, inStock: !draft.inStock })} /><ToggleRow title="რჩეული პროდუქტი" subtitle="გამოიკვეთოს კატალოგში" active={draft.featured} onClick={() => setDraft({ ...draft, featured: !draft.featured })} /><button className="primary-button primary-button--wide" type="submit"><Check size={18} /> {saved ? 'შენახულია' : 'ცვლილებების შენახვა'}</button></form>
}

function ToggleRow({ title, subtitle, active, onClick }) {
  return <div className="toggle-row"><div><strong>{title}</strong><small>{subtitle}</small></div><button className={active ? 'toggle active' : 'toggle'} type="button" onClick={onClick} aria-pressed={active}><span /></button></div>
}

function OrdersPanel({ notification }) {
  return <section className="admin-panel orders-panel"><div className="panel-heading"><div><h2>ბოლო შეკვეთები</h2><p>დემონსტრაციის მონაცემები</p></div><button className="primary-button" type="button" onClick={notification.trigger}><Bell size={17} /> ახალი შეკვეთის დემო</button></div><div className="orders-table"><div className="table-row table-row--head"><span>შეკვეთა</span><span>მომხმარებელი</span><span>დრო</span><span>ჯამი</span><span>სტატუსი</span></div>{demoOrders.map((order) => <div className="table-row" key={order.id}><strong>{order.id}</strong><span>{order.customer}</span><span>{order.time}</span><strong>{order.total.toFixed(2)} ₾</strong><StatusBadge status={order.status} /></div>)}</div></section>
}

function DashboardPanel({ setSection }) {
  return <section className="dashboard-grid"><div className="admin-panel"><div className="panel-heading"><div><h2>ბოლო შეკვეთები</h2><p>დღევანდელი აქტივობა</p></div><button className="text-button" type="button" onClick={() => setSection('orders')}>ყველას ნახვა <ArrowRight size={16} /></button></div>{demoOrders.slice(0, 2).map((order) => <div className="compact-order" key={order.id}><span className="avatar">{order.customer.charAt(0)}</span><div><strong>{order.customer}</strong><small>{order.id} · {order.time}</small></div><b>{order.total.toFixed(2)} ₾</b><StatusBadge status={order.status} /></div>)}</div><div className="admin-panel demo-callout"><Bell size={26} /><h2>შეტყობინების დემო</h2><p>გახსენით ცალკე გვერდი და აჩვენეთ, როგორ მიიღებს გუნდი ახალ შეკვეთას.</p><a className="primary-button" href="/notification" target="_blank">დემო გვერდის გახსნა <ArrowRight size={17} /></a></div></section>
}

function NotificationDemo() {
  return (
    <main className="notification-demo">
      <div className="notification-top"><Brand compact /><a href="/admin"><ArrowLeft size={17} /> ადმინისტრირება</a></div>
      <section className="notification-gallery">
        <div className="notification-gallery__heading">
          <span className="demo-badge">WEB PUSH</span>
          <h1>შეტყობინება ყველა ეკრანზე</h1>
          <p>ახალი შეკვეთის შეტყობინება გამოჩნდება მოწყობილობის სისტემურ სივრცეში.</p>
        </div>
        <div className="device-showcase">
          <article className="device-example device-example--desktop">
            <div className="device-example__label"><span><Bell size={17} /></span><div><small>დესკტოპი</small><strong>ლეპტოპზე</strong></div></div>
            <div className="laptop-frame">
              <div className="laptop-camera" />
              <div className="device-crop device-crop--desktop"><img src="/push-notification-examples.png" alt="Google Chrome web push შეტყობინების მაგალითი ლეპტოპზე" /></div>
            </div>
            <div className="laptop-base" />
          </article>
          <article className="device-example device-example--phone">
            <div className="device-example__label"><span><Bell size={17} /></span><div><small>მობილური</small><strong>ტელეფონზე</strong></div></div>
            <div className="phone-frame">
              <div className="phone-speaker" />
              <div className="ios-screen" role="img" aria-label="Safari web push შეტყობინების მაგალითი iPhone-ზე">
                <div className="ios-status"><strong>9:41</strong><span><Wifi size={12} /><BatteryFull size={15} /></span></div>
                <LockKeyhole className="ios-lock" size={20} />
                <time className="ios-time">9:41</time>
                <span className="ios-date">სამშაბათი, 12 სექტემბერი</span>
                <div className="ios-notification">
                  <div className="ios-notification__top"><span><Compass size={12} /></span><strong>SAFARI</strong><time>9:41</time></div>
                  <b>JTB Company</b>
                  <p>თქვენ გაქვთ ახალი შეკვეთა</p>
                  <small>შეკვეთა #1049 · 45.00 ₾</small>
                </div>
                <div className="ios-shortcuts"><span><Flashlight size={17} /></span><span><Camera size={17} /></span></div>
              </div>
            </div>
          </article>
        </div>
        <a className="notification-source" href="https://web.dev/articles/push-notifications-overview" target="_blank" rel="noreferrer">Google web.dev მაგალითი <ArrowRight size={15} /></a>
      </section>
    </main>
  )
}

function App() {
  const [products, setProducts] = useCatalog()
  const notification = useOrderNotifications()
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (path === '/admin') return <Admin products={products} setProducts={setProducts} notification={notification} />
  if (path === '/notification') return <NotificationDemo />
  return <Storefront products={products} notification={notification} />
}

export default App
