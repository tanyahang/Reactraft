import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Message = {
  severity: 'success' | 'error' | 'info';
  text: string;
};

type AppState = {
  message: Message | null;
  page: 'HOME' | 'NEW_DESIGN';
  selectedIdx: number | null;
  windowHeight: number;
  windowWidth: number;
  zoom: number;
};

const initialState: AppState = {
  message: null,
  page: 'HOME',
  selectedIdx: null,
  windowHeight: window.innerHeight,
  windowWidth: window.innerWidth,
  zoom: 100,
};

const appSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    setMessage: (state: AppState, action: PayloadAction<Message | null>) => {
      state.message = action.payload;
    },
    setZoom: (state: AppState, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    resetMessage: (state: AppState) => {
      state.message = null;
    },
    setWindowSize: (
      state: AppState,
      action: PayloadAction<{ height: number; width: number }>
    ) => {
      state.windowHeight = action.payload.height;
      state.windowWidth = action.payload.width;
    },
    goToPage: (
      state: AppState,
      action: PayloadAction<'HOME' | 'NEW_DESIGN'>
    ) => {
      state.page = action.payload;
    },
    resetApp: () => initialState,
    setSelectedIdx: (state: AppState, action: PayloadAction<number | null>) => {
      state.selectedIdx = action.payload;
    },
  },
});

export const {
  setMessage,
  resetMessage,
  goToPage,
  resetApp,
  setSelectedIdx,
  setWindowSize,
  setZoom,
} = appSlice.actions;

export default appSlice.reducer;
