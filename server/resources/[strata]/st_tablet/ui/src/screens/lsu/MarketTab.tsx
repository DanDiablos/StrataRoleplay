import { useState } from 'react'
import { ShoppingCart, Package, AlertCircle, Plus, Minus } from 'lucide-react'
import { sendNui } from '../../nui'
import ActionBtn from '../../components/ActionBtn.tsx'
import type { LSUDetails, MarketItem } from '../../types'

interface Props {
  lsuData: LSUDetails | null
}

interface CartEntry {
  item: MarketItem
  quantity: number
}

export default function MarketTab({ lsuData }: Props): React.ReactElement {
  const [cart, setCart]     = useState<CartEntry[]>([])
  const [buying, setBuying] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const items = lsuData?.items ?? []
  const banned = lsuData?.banned

  if (banned) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <AlertCircle size={32} className="text-red-300/60" />
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.82rem] text-red-300/70">
          Access Revoked
        </span>
        <span className="font-mono text-[0.68rem] text-white/30 max-w-xs text-center">
          You have been banned from the LS Underground marketplace.
        </span>
      </div>
    )
  }

  const addToCart = (item: MarketItem) => {
    setCart(c => {
      const existing = c.find(e => e.item.id === item.id)
      if (existing) {
        const maxQty = item.qty === -1 ? 99 : item.qty
        if (existing.quantity >= maxQty) return c
        return c.map(e => e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e)
      }
      return [...c, { item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: number) => {
    setCart(c => {
      const existing = c.find(e => e.item.id === itemId)
      if (!existing || existing.quantity <= 1) return c.filter(e => e.item.id !== itemId)
      return c.map(e => e.item.id === itemId ? { ...e, quantity: e.quantity - 1 } : e)
    })
  }

  const clearCart = () => setCart([])

  const doCheckout = async () => {
    if (cart.length === 0) return
    setBuying(true)
    setResult(null)
    try {
      const r = await sendNui('LSUNDG:Market:Checkout', cart.map(e => ({
        id: e.item.id,
        quantity: e.quantity,
        qty: e.item.qty,
      })))
      const res = await r.json()
      if (res?.success) {
        setResult('Order placed! Check notifications for pickup location.')
        clearCart()
      } else {
        setResult('Checkout failed. Check your crypto balance.')
      }
    } finally {
      setBuying(false)
    }
  }

  const cartTotal = cart.reduce<Record<string, number>>((acc, e) => {
    const coin = e.item.coin
    acc[coin] = (acc[coin] ?? 0) + e.item.price * e.quantity
    return acc
  }, {})

  const cartQty = (itemId: number) => cart.find(e => e.item.id === itemId)?.quantity ?? 0

  return (
    <div className="h-full flex overflow-hidden">
      {/* Item list */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/50 shrink-0">
          Available Items
        </span>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            <Package size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No items available</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {items.map(item => {
              const inCart = cartQty(item.id)
              const available = item.qty === -1 ? true : item.qty > 0
              const delayed = item.delayed

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 bg-menu-surface border-b border-white/[0.04] last:border-0 ${
                    !available || delayed ? 'opacity-50' : ''
                  }`}
                >
                  <Package size={14} className="text-white/30 shrink-0" />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="font-medium text-[0.84rem] text-white/80">
                      {item.itemData?.label ?? item.item}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.rep && (
                        <span className="font-mono text-[0.6rem] text-white/30 uppercase">
                          Rep {item.rep} Lvl {item.repLvl}+
                        </span>
                      )}
                      {item.vpn && (
                        <span className="font-mono text-[0.6rem] text-primary/60 uppercase">VPN</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-mono text-[0.8rem] text-white/80">
                        {item.price} {item.coin}
                      </span>
                      <span className="font-mono text-[0.62rem] text-white/30">
                        {delayed ? 'Unavailable' : item.qty === -1 ? '∞' : `${item.qty} left`}
                      </span>
                    </div>
                    {!delayed && available && (
                      <div className="flex items-center gap-1">
                        {inCart > 0 && (
                          <>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 flex items-center justify-center border border-white/10 text-white/40 hover:text-white/70 transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="font-mono text-[0.75rem] text-white/70 w-5 text-center">{inCart}</span>
                          </>
                        )}
                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 flex items-center justify-center border border-primary/35 bg-primary/8 text-primary/70 hover:bg-primary/15 transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cart sidebar */}
      <div className="w-[220px] flex flex-col border-l border-white/[0.06] bg-menu-surface shrink-0">
        <div className="px-3 py-2 border-b border-white/[0.06] bg-menu-surface-lt shrink-0">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/60 flex items-center gap-2">
            <ShoppingCart size={12} />
            Cart ({cart.length})
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-1.5">
              <ShoppingCart size={20} className="text-white/15" />
              <span className="font-mono text-[0.65rem] text-white/20 uppercase">Empty</span>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {cart.map(e => (
                <div key={e.item.id} className="px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="font-medium text-[0.78rem] text-white/75 truncate">
                      {e.item.itemData?.label ?? e.item.item}
                    </span>
                    <span className="font-mono text-[0.62rem] text-white/35">
                      {e.quantity} × {e.item.price} {e.item.coin}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t border-white/[0.06] flex flex-col gap-2 shrink-0">
          {Object.entries(cartTotal).map(([coin, total]) => (
            <div key={coin} className="flex justify-between">
              <span className="font-mono text-[0.65rem] text-white/40 uppercase">{coin}</span>
              <span className="font-mono text-[0.72rem] text-white/80">{total}</span>
            </div>
          ))}
          {result && (
            <p className="font-mono text-[0.62rem] text-menu-success-lt leading-snug">{result}</p>
          )}
          <ActionBtn
            onClick={doCheckout}
            variant="primary"
            disabled={buying || cart.length === 0}
            className="w-full justify-center"
          >
            {buying ? 'Processing…' : 'Checkout'}
          </ActionBtn>
          {cart.length > 0 && (
            <ActionBtn onClick={clearCart} className="w-full justify-center">Clear</ActionBtn>
          )}
        </div>
      </div>
    </div>
  )
}
