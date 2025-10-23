import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

export default function Scanner({ onProductScanned, onClose }) {
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  useEffect(() => {
    // Focus the input on mount
    inputRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose()
      // NOTE: don't trigger Enter here — let the form handle Enter/submission natively
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault()
    if (!barcode.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.get(`/products/?barcode=${barcode}`)
      const product = response.data?.[0]
      if (product) {
        onProductScanned(product)
        setBarcode('')  // Clear for next scan
      } else {
        setError('Product not found')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to look up product')
    } finally {
      setLoading(false)
      inputRef.current?.focus()  // Re-focus for next scan
    }
  }
  return (
    <div className="scanner-root">
      <div className="scanner-content">
        <h2>Scan Products</h2>
        
        <form onSubmit={handleBarcodeSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type barcode..."
              className="barcode-input"
              autoComplete="off"
            />
            <button type="submit" disabled={loading || !barcode.trim()}>
              {loading ? 'Looking up...' : 'Add'}
            </button>
          </form>

        {error && <div className="error">{error}</div>}

        <div className="scanner-help">
          <p>Point scanner at barcode or type it manually</p>
          <small>Products will be added to cart automatically</small>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
          <button onClick={() => onClose && onClose()}>Close</button>
        </div>
      </div>
    </div>
  )
}
