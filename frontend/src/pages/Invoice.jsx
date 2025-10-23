import { useEffect } from 'react'

export default function Invoice({ order, onClose }) {
  useEffect(() => {
    // Print automatically when component mounts
    if (order) window.print()
  }, [order])

  if (!order) return null

  const date = new Date(order.created_at).toLocaleDateString()
  const time = new Date(order.created_at).toLocaleTimeString()

  return (
    <div className="invoice-root">
      <div className="invoice-content">
        <div className="invoice-header">
          <h2>Order Receipt</h2>
          <div>#{order.id}</div>
          <div>{date} {time}</div>
        </div>

        <table className="invoice-items">
          <thead>
            <tr>
              <th style={{textAlign:'left'}}>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product.name}</td>
                <td style={{textAlign:'center'}}>{item.quantity}</td>
                <td style={{textAlign:'right'}}>Rp {Number(item.price).toLocaleString()}</td>
                <td style={{textAlign:'right'}}>Rp {Number(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{textAlign:'right', fontWeight:700}}>Total</td>
              <td style={{textAlign:'right', fontWeight:700}}>Rp {Number(order.total).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

          {order.paid !== undefined && (
            <div style={{display:'flex',justifyContent:'space-between',marginTop:12,fontWeight:700}}>
              <div>Paid:</div>
              <div>Rp {Number(order.paid).toLocaleString()}</div>
            </div>
          )}

          {order.change !== undefined && (
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontWeight:700,color:'#0b6'}}>
              <div>Change:</div>
              <div>Rp {Number(order.change).toLocaleString()}</div>
            </div>
          )}

        <div className="invoice-actions">
          <button className="btn-primary" onClick={() => window.print()}>Print</button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>

        <div className="invoice-footer">
          <p>Thank you for your purchase!</p>
          <small>Warung RR</small>
        </div>
      </div>
    </div>
  )
}