import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../utils/api'
import toast from 'react-hot-toast'

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/orders', orderData)
    toast.success('Order placed successfully! 🎉')
    return data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to place order')
  }
})

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/orders/myorders', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders')
  }
})

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/orders/${id}`)
    return data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Order not found')
  }
})

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/orders/${id}/cancel`, { reason })
    toast.success('Order cancelled')
    return data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel order')
  }
})

// Admin
export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/admin/orders', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/admin/orders/${id}/status`, { status })
    toast.success('Order status updated!')
    return data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    selectedOrder: null,
    pagination: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearOrderSuccess: (state) => { state.success = false },
    clearSelectedOrder: (state) => { state.selectedOrder = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.selectedOrder = action.payload
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })

      .addCase(fetchMyOrders.pending, (state) => { state.loading = true })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchOrderById.pending, (state) => { state.loading = true })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.selectedOrder = action.payload })
      .addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o._id === action.payload._id)
        if (idx !== -1) state.orders[idx] = action.payload
        if (state.selectedOrder?._id === action.payload._id) state.selectedOrder = action.payload
      })

      .addCase(fetchAllOrders.pending, (state) => { state.loading = true })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAllOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o._id === action.payload._id)
        if (idx !== -1) state.orders[idx] = action.payload
      })
  },
})

export const { clearOrderSuccess, clearSelectedOrder } = orderSlice.actions
export default orderSlice.reducer
