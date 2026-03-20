import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../utils/api'
import toast from 'react-hot-toast'

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/cart')
    return data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart')
  }
})

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/cart/add', { productId, quantity })
    return data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add item')
  }
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await API.put('/cart/update', { productId, quantity })
    return data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update item')
  }
})

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await API.delete(`/cart/remove/${productId}`)
    return data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove item')
  }
})

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await API.delete('/cart/clear')
    return []
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart')
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcTotals = (items) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 200 ? 0 : subtotal === 0 ? 0 : 30
  return { subtotal, deliveryFee, total: subtotal + deliveryFee }
}

// ─── Slice ────────────────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = []
      state.subtotal = 0
      state.deliveryFee = 0
      state.total = 0
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false
      const items = action.payload?.items || []
      state.items = items
      const totals = calcTotals(items)
      state.subtotal = totals.subtotal
      state.deliveryFee = totals.deliveryFee
      state.total = totals.total
    }

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(addToCart.pending, (state) => { state.loading = true })
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, action)
        toast.success('Added to cart! 🛒')
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        toast.error(action.payload)
      })

      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(updateCartItem.rejected, (state, action) => { toast.error(action.payload) })

      .addCase(removeFromCart.fulfilled, (state, action) => {
        setCart(state, action)
        toast.success('Item removed')
      })
      .addCase(removeFromCart.rejected, (state, action) => { toast.error(action.payload) })

      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
        state.subtotal = 0
        state.deliveryFee = 0
        state.total = 0
      })
  },
})

export const { resetCart } = cartSlice.actions
export default cartSlice.reducer
