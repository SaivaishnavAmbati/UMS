import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRegistrations, getPendingRegistrations, getMyRegistrations, submitRegistration, processRegistration } from '../../api/registrationApi';

export const fetchAllRegistrations = createAsyncThunk('registration/fetchAll', async (_, { rejectWithValue }) => {
  try { return (await getRegistrations()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchPendingRegistrations = createAsyncThunk('registration/fetchPending', async (_, { rejectWithValue }) => {
  try { return (await getPendingRegistrations()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchMyRegistrations = createAsyncThunk('registration/fetchMy', async (_, { rejectWithValue }) => {
  try { return (await getMyRegistrations()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const submitCourseRegistration = createAsyncThunk('registration/submit', async (data, { rejectWithValue }) => {
  try { return (await submitRegistration(data)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const processRegistrationThunk = createAsyncThunk('registration/process', async ({ id, data }, { rejectWithValue }) => {
  try { return (await processRegistration(id, data)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const registrationSlice = createSlice({
  name: 'registration',
  initialState: { all: [], pending: [], mine: [], loading: false, error: null },
  reducers: { clearRegistrationError(state) { state.error = null; } },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const failed = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(fetchAllRegistrations.pending, pending)
      .addCase(fetchAllRegistrations.fulfilled, (s, a) => { s.loading = false; s.all = a.payload || []; })
      .addCase(fetchAllRegistrations.rejected, failed)
      .addCase(fetchPendingRegistrations.pending, pending)
      .addCase(fetchPendingRegistrations.fulfilled, (s, a) => { s.loading = false; s.pending = a.payload || []; })
      .addCase(fetchPendingRegistrations.rejected, failed)
      .addCase(fetchMyRegistrations.pending, pending)
      .addCase(fetchMyRegistrations.fulfilled, (s, a) => { s.loading = false; s.mine = a.payload || []; })
      .addCase(fetchMyRegistrations.rejected, failed)
      .addCase(submitCourseRegistration.fulfilled, (s, a) => { s.mine.push(a.payload); })
      .addCase(processRegistrationThunk.fulfilled, (s, a) => {
        s.pending = s.pending.filter(r => r.id !== a.payload.id);
        s.all = s.all.map(r => r.id === a.payload.id ? a.payload : r);
      });
  },
});

export const { clearRegistrationError } = registrationSlice.actions;
export const selectAllRegistrations = (s) => s.registration.all;
export const selectPendingRegistrations = (s) => s.registration.pending;
export const selectMyRegistrations = (s) => s.registration.mine;
export const selectRegistrationLoading = (s) => s.registration.loading;
export const selectRegistrationError = (s) => s.registration.error;
export default registrationSlice.reducer;
