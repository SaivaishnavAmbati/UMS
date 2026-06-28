import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getDepartments, createDepartment, deleteDepartment,
  getSemesters, createSemester, activateSemester, getActiveSemester,
  getCourses, createCourse, searchCourses,
  getFacultyList, createFaculty,
} from '../../api/academicApi';

// ── Departments ──────────────────────────────────────────────────────────────
export const fetchDepartments = createAsyncThunk('academic/fetchDepartments', async (_, { rejectWithValue }) => {
  try { return (await getDepartments()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const addDepartment = createAsyncThunk('academic/addDepartment', async (data, { rejectWithValue }) => {
  try { return (await createDepartment(data)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const removeDepartment = createAsyncThunk('academic/removeDepartment', async (id, { rejectWithValue }) => {
  try { await deleteDepartment(id); return id; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ── Semesters ──────────────────────────────────────────────────────────────
export const fetchSemesters = createAsyncThunk('academic/fetchSemesters', async (_, { rejectWithValue }) => {
  try { return (await getSemesters()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const fetchActiveSemester = createAsyncThunk('academic/fetchActiveSemester', async (_, { rejectWithValue }) => {
  try { return (await getActiveSemester()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const addSemester = createAsyncThunk('academic/addSemester', async (data, { rejectWithValue }) => {
  try { return (await createSemester(data)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const triggerActivateSemester = createAsyncThunk('academic/activateSemester', async (id, { rejectWithValue }) => {
  try { return (await activateSemester(id)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ── Courses ──────────────────────────────────────────────────────────────────
export const fetchCourses = createAsyncThunk('academic/fetchCourses', async (_, { rejectWithValue }) => {
  try { return (await getCourses()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const searchCoursesThunk = createAsyncThunk('academic/searchCourses', async (query, { rejectWithValue }) => {
  try { return (await searchCourses(query)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const addCourse = createAsyncThunk('academic/addCourse', async (data, { rejectWithValue }) => {
  try { return (await createCourse(data)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ── Faculty ──────────────────────────────────────────────────────────────────
export const fetchFaculty = createAsyncThunk('academic/fetchFaculty', async (_, { rejectWithValue }) => {
  try { return (await getFacultyList()).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const addFaculty = createAsyncThunk('academic/addFaculty', async (data, { rejectWithValue }) => {
  try { return (await createFaculty(data)).data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const academicSlice = createSlice({
  name: 'academic',
  initialState: {
    departments: [], semesters: [], activeSemester: null,
    courses: [], faculty: [],
    loading: false, error: null,
  },
  reducers: {
    clearAcademicError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const failed = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchDepartments.pending, pending)
      .addCase(fetchDepartments.fulfilled, (s, a) => { s.loading = false; s.departments = a.payload || []; })
      .addCase(fetchDepartments.rejected, failed)

      .addCase(addDepartment.fulfilled, (s, a) => { s.departments.push(a.payload); })
      .addCase(removeDepartment.fulfilled, (s, a) => { s.departments = s.departments.filter(d => d.id !== a.payload); })

      .addCase(fetchSemesters.pending, pending)
      .addCase(fetchSemesters.fulfilled, (s, a) => { s.loading = false; s.semesters = a.payload || []; })
      .addCase(fetchSemesters.rejected, failed)

      .addCase(fetchActiveSemester.fulfilled, (s, a) => { s.activeSemester = a.payload; })
      .addCase(addSemester.fulfilled, (s, a) => { s.semesters.push(a.payload); })
      .addCase(triggerActivateSemester.fulfilled, (s, a) => {
        s.semesters = s.semesters.map(sem => ({ ...sem, isActive: sem.id === a.payload.id }));
        s.activeSemester = a.payload;
      })

      .addCase(fetchCourses.pending, pending)
      .addCase(fetchCourses.fulfilled, (s, a) => { s.loading = false; s.courses = a.payload || []; })
      .addCase(fetchCourses.rejected, failed)

      .addCase(searchCoursesThunk.pending, pending)
      .addCase(searchCoursesThunk.fulfilled, (s, a) => { s.loading = false; s.courses = a.payload || []; })
      .addCase(searchCoursesThunk.rejected, failed)

      .addCase(addCourse.fulfilled, (s, a) => { s.courses.push(a.payload); })

      .addCase(fetchFaculty.pending, pending)
      .addCase(fetchFaculty.fulfilled, (s, a) => { s.loading = false; s.faculty = a.payload || []; })
      .addCase(fetchFaculty.rejected, failed)

      .addCase(addFaculty.fulfilled, (s, a) => { s.faculty.push(a.payload); });
  },
});

export const { clearAcademicError } = academicSlice.actions;
export const selectDepartments = (s) => s.academic.departments;
export const selectSemesters = (s) => s.academic.semesters;
export const selectActiveSemester = (s) => s.academic.activeSemester;
export const selectCourses = (s) => s.academic.courses;
export const selectFaculty = (s) => s.academic.faculty;
export const selectAcademicLoading = (s) => s.academic.loading;
export const selectAcademicError = (s) => s.academic.error;
export default academicSlice.reducer;
