import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getStudentProfile, createStudentProfile, updateStudentProfile } from '../../api/studentApi';

export const fetchStudentProfile = createAsyncThunk('student/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await getStudentProfile();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const createProfile = createAsyncThunk('student/createProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await createStudentProfile(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create profile');
  }
});

export const editProfile = createAsyncThunk('student/editProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await updateStudentProfile(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

const studentSlice = createSlice({
  name: 'student',
  initialState: { profile: null, loading: false, error: null },
  reducers: {
    clearStudentState(state) { state.profile = null; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProfile.pending, (state) => { state.loading = true; state.error = null; state.profile = null; })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchStudentProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.profile = null; })
      
      .addCase(createProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(createProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(editProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(editProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(editProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearStudentState } = studentSlice.actions;
export const selectStudentProfile = (state) => state.student.profile;
export default studentSlice.reducer;
