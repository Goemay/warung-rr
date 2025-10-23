import { useEffect, useState, useRef } from 'react'
import api from '../utils/api'
import '../App.css'
// Scanner UI is present in the codebase but intentionally not enabled in the main UI
// to keep the cashier UI simple and focused. If you want to enable it later,
// re-import and wire it back in.
import Invoice from './Invoice'

const DEMO_PRODUCTS = [
  { id: 1, barcode: '000000000001', name: 'Nasi Goreng Special', price: '15000.00', stock: 50 },
  { id: 2, barcode: '000000000002', name: 'Es Teh Manis', price: '5000.00', stock: 100 },
  { id: 3, barcode: '000000000003', name: 'Ayam Goreng Crispy', price: '25000.00', stock: 40 },
]

export default function FirstLook() {
  // Scanner state removed to keep UI simple; scanner feature is currently disabled
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState({})
  const lastAddRef = useRef({})

  useEffect(() => {
    let mounted = true

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/products/')
        if (!mounted) return
        setProducts(res.data || [])
      } catch (err) {
        console.error('Product load error', err)
        // capture useful message
        const msg = err?.response ? `${err.response.status} ${err.response.statusText}` : err.message || 'Network error'
        setError(`Failed to load products: ${msg}`)
      } finally {
        mounted && setLoading(false)
      }
    }

    fetchProducts()

    return () => { mounted = false }
  }, [])

  function addToCart(p) {
    // Debounce very rapid duplicate calls for the same product (e.g., accidental double events)
    const now = Date.now()
    const last = lastAddRef.current[p.id] || 0
    if (now - last < 200) return
    lastAddRef.current[p.id] = now

    setCart((c) => {
      // copy top-level map
      const next = { ...c }
      const existing = next[p.id]
      if (existing) {
        // copy nested entry to avoid mutating previous state
        next[p.id] = { product: existing.product, qty: existing.qty + 1 }
      } else {
        next[p.id] = { product: p, qty: 1 }
      }
      return next
    })
  }

  function removeFromCart(id) {
    setCart((c) => {
      const next = { ...c }
      if (!next[id]) return next
      next[id].qty -= 1
      if (next[id].qty <= 0) delete next[id]
      return next
    })
  }

  const items = Object.values(cart)
  const subtotal = items.reduce((s, it) => s + (it.product.price || 0) * it.qty, 0)
  const [cash, setCash] = useState('')
  const [orderError, setOrderError] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)
  // common Indonesian currency denominations (in rupiah)
  const DENOMINATIONS = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]

  return (
    <div className="firstlook-root">
      <aside className="product-list">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2>Products</h2>
          <div>
            <button disabled title="Scanner not enabled" style={{marginRight:8,opacity:0.6,cursor:'not-allowed'}}>Scan (disabled)</button>
            <button onClick={() => { setLoading(true); setError(null); api.get('/products/').then(r=>setProducts(r.data)).catch(()=>setError('Failed to load products')).finally(()=>setLoading(false)) }}>Refresh</button>
          </div>
        </div>
        {loading && <p>Loading products…</p>}
        {error && (
          <div style={{padding:12}}>
            <p className="error">{error}</p>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => { setLoading(true); setError(null); api.get('/products/').then(r=>setProducts(r.data)).catch(e=>setError(String(e))).finally(()=>setLoading(false)) }}>Retry</button>
              <button onClick={() => { setProducts(DEMO_PRODUCTS); setError(null) }}>Use demo data</button>
            </div>
          </div>
        )}
        {!loading && !error && products.length === 0 && <p>No products found.</p>}
        <div className="product-grid">
          {products.map((p) => (
            <div className="product-card" key={p.id}>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <div style={{width:48,height:48,borderRadius:6,background:'rgba(255,255,255,0.03)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>IMG</div>
                <div>
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">Rp {Number(p.price).toLocaleString()}</div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); addToCart(p) }}>Add</button>
            </div>
          ))}
        </div>
      </aside>

      <main className="cart-panel">
        <h2>Cart</h2>
        {items.length === 0 && <p>Cart is empty</p>}
        {items.map((it) => (
          <div className="cart-item" key={it.product.id}>
            <div className="ci-name">{it.product.name}</div>
            <div className="ci-qty">x{it.qty}</div>
            <div className="ci-price">Rp {(it.product.price * it.qty).toLocaleString()}</div>
            <div className="ci-actions">
              <button onClick={(e) => { e.stopPropagation(); removeFromCart(it.product.id) }}>-</button>
              <button onClick={(e) => { e.stopPropagation(); addToCart(it.product) }}>+</button>
            </div>
          </div>
        ))}

        <div className="cart-summary">
          <div>Subtotal:</div>
          <div className="subtotal">Rp {subtotal.toLocaleString()}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{display:'flex',gap:8,alignItems:'center',flexDirection:'column'}}>
            <div style={{display:'flex',gap:8,alignItems:'center',width:'100%'}}>
              <input placeholder="Cash amount" value={cash} onChange={(e)=>setCash(e.target.value)} style={{padding:6,borderRadius:6,border:'1px solid rgba(255,255,255,0.06)',flex:1}} />
              <button disabled={items.length === 0} className="pay-btn" onClick={async ()=>{
              setOrderError(null)
              const orderItems = Object.values(cart).map(({ product, qty }) => ({ product_id: product.id, quantity: qty, price: product.price }))
              try{
                const res = await api.post('/orders/', { items: orderItems, total: subtotal })
                const order = res.data
                // attach paid and change for invoice view
                const paid = Number(cash) || Number(subtotal)
                order.paid = paid
                order.change = paid - Number(order.total)
                setCurrentOrder(order)
                setCart({})
                setCash('')
              }catch(err){
                console.error('Order create error', err)
                const msg = err?.response?.data?.detail || err?.response?.data || err.message || 'Order creation failed'
                setOrderError(String(msg))
              }
            }}>Pay</button>
            </div>

            {/* denomination buttons */}
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
              {DENOMINATIONS.map((d) => (
                <button key={d} onClick={(e) => { e.stopPropagation(); const cur = Number(cash) || 0; setCash(String(cur + d)) }} style={{padding:'6px 10px',borderRadius:6,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.04)',cursor:'pointer'}}>
                  Rp {d.toLocaleString()}
                </button>
              ))}
              <button onClick={(e) => { e.stopPropagation(); setCash(String(Math.ceil(subtotal || 0)) ) }} style={{padding:'6px 10px',borderRadius:6,background:'#06a84b',color:'#fff',border:'none',cursor:'pointer'}}>Exact</button>
              <button onClick={(e) => { e.stopPropagation(); setCash('') }} style={{padding:'6px 10px',borderRadius:6,background:'transparent',border:'1px solid rgba(255,255,255,0.04)',cursor:'pointer'}}>Clear</button>
            </div>

            {orderError && <div style={{color:'var(--danger)',marginTop:8}}>{orderError}</div>}
          </div>
        </div>
      </main>
      {currentOrder && <Invoice order={currentOrder} onClose={()=>setCurrentOrder(null)} />}

      {/* Scanner overlay intentionally not rendered here to keep UI focused and simple. */}
    </div>
  )
}
