import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardMetrics } from '../../api/reportApi';

export const fetchDashboardMetrics = createAsyncThunk('report/fetchDashboard', async (_, { rejectWithValue }) => {
  try { return (await getDashboardMetrics()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const reportSlice = createSlice({
  name: 'report',
  initialState: { metrics: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchDashboardMetrics.fulfilled, (s, a) => { s.loading = false; s.metrics = a.payload; })
      .addCase(fetchDashboardMetrics.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const selectMetrics = (s) => s.report.metrics;
export const selectReportLoading = (s) => s.report.loading;
export default reportSlice.reducer;
