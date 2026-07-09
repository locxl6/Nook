import { Model } from '@/types'
import { create } from 'zustand'

interface ModelState {
  models: Model[]
  currentModelId: string | null
}

export const useModelStore = create<ModelState>((set) => ({
  models: [],
  currentModelId: null
}))