import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../utils/api'
import toast from 'react-hot-toast'

export const fetchProducts = createAsyncThunk('products/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/products', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products')
  }
})

export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/products/featured')
    return data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/products/${id}`)
    return data.product
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found')
  }
})

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/products/categories')
    return data.categories
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

// Admin actions
export const createProduct = createAsyncThunk('products/create', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/products', productData)
    toast.success('Product created!')
    return data.product
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create product')
  }
})

export const updateProduct = createAsyncThunk('products/update', async ({ id, ...productData }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/products/${id}`, productData)
    toast.success('Product updated!')
    return data.product
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update product')
  }
})

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/products/${id}`)
    toast.success('Product deleted!')
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete product')
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    categories: [],
    selectedProduct: null,
    pagination: null,
    loading: false,
    error: null,
    filters: { search: '', category: '', minPrice: '', maxPrice: '', sort: 'createdAt', order: 'desc' },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { search: '', category: '', minPrice: '', maxPrice: '', sort: 'createdAt', order: 'desc' }
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.products
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => { state.featured = action.payload })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload })

      .addCase(fetchProductById.pending, (state) => { state.loading = true })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.selectedProduct = action.payload })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(createProduct.fulfilled, (state, action) => { state.items.unshift(action.payload) })
      .addCase(createProduct.rejected, (state, action) => { toast.error(action.payload) })

      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p._id === action.payload._id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateProduct.rejected, (state, action) => { toast.error(action.payload) })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => { toast.error(action.payload) })
  },
})

export const { setFilters, clearFilters, clearSelectedProduct } = productSlice.actions
export default productSlice.reducer
