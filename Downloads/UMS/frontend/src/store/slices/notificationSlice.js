import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotifications, sendNotification } from '../../api/notificationApi';

export const fetchNotifications = createAsyncThunk('notification/fetch', async (recipient, { rejectWithValue }) => {
  try { return (await getNotifications(recipient)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const sendNotificationThunk = createAsyncThunk('notification/send', async (data, { rejectWithValue }) => {
  try { return (await sendNotification(data)).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { list: [], loading: false, error: null, sent: false },
  reducers: { resetSent(state) { state.sent = false; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchNotifications.fulfilled, (s, a) => { s.loading = false; s.list = a.payload || []; })
      .addCase(fetchNotifications.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(sendNotificationThunk.pending, (s) => { s.loading = true; s.sent = false; })
      .addCase(sendNotificationThunk.fulfilled, (s) => { s.loading = false; s.sent = true; })
      .addCase(sendNotificationThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { resetSent } = notificationSlice.actions;
export const selectNotifications = (s) => s.notification.list;
export const selectNotifLoading = (s) => s.notification.loading;
export const selectNotifSent = (s) => s.notification.sent;
export default notificationSlice.reducer;
