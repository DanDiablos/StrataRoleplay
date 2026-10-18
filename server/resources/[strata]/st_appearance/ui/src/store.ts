import { create } from 'zustand'

export type AppState = 'CREATOR' | 'SHOP' | 'BARBER' | 'TATTOO' | 'SURGERY'

export interface OverlayEntry {
  index: number
  opacity: number
  color1?: number
  color2?: number
}

export interface ComponentEntry {
  drawableId: number
  textureId: number
}

export interface PropEntry {
  drawableId: number
  textureId: number
}

export interface FaceBlend {
  index: number
  texture: number
  mix: number
}

export interface PedCustomization {
  face: {
    face1: FaceBlend
    face2: FaceBlend
    face3: FaceBlend
    features: number[]
    eyeColor: number
  }
  overlay: Record<string, OverlayEntry>
  components: Record<string, ComponentEntry>
  props: Record<string, PropEntry>
  tattoos: TattooEntry[]
  hairOverlay: number
  colors: Record<string, Record<string, { index: number; rgb?: string }>>
}

export interface PedData {
  model: string
  customization: PedCustomization
}

export interface TattooEntry {
  Name: string
  Collection: string
  Hash?: string
  HashNameMale?: string
  HashNameFemale?: string
  Zone: string
}

interface AppStore {
  hidden: boolean
  appState: AppState | null
  ped: PedData | null
  gender: 0 | 1
  pricing: Record<string, number>
  tattooData: TattooEntry[]
  whitelistedPeds: string[]
  hairColorsMax: number
  hairOverlaysMax: number
  isNaked: boolean
  drawables: {
    components: Record<number, number[]>
    props: Record<number, number[]>
  }
  textures: {
    components: Record<string, number>
    props: Record<string, number>
  }
  componentLocks: Record<string, boolean>
  propLocks: Record<string, boolean>
  randomizerRunning: boolean
  randomizerSpeed: number
  activeAnimation: string | null
  dispatch: (type: string, payload?: Record<string, unknown>) => void
  setComponent: (name: string, type: 'drawableId' | 'textureId', value: number) => void
  setProp: (name: string, type: 'drawableId' | 'textureId', value: number) => void
  setOverlay: (overlayType: string, extraType: string, value: number) => void
  setFaceFeature: (index: number, value: number) => void
  setHeadBlend: (face: 'face1' | 'face2' | 'face3', blendType: 'index' | 'texture' | 'mix', value: number) => void
  setHairColor: (name: string, colorType: string, index: number, rgb?: string) => void
  setHairOverlay: (value: number) => void
  setEyeColor: (value: number) => void
  setTattoo: (index: number, data: TattooEntry) => void
  addTattoo: (zone: string) => void
  removeTattoo: (index: number) => void
  setNaked: (value: boolean) => void
  toggleComponentLock: (name: string) => void
  togglePropLock: (name: string) => void
  setRandomizerRunning: (running: boolean) => void
  setRandomizerSpeed: (speed: number) => void
  setActiveAnimation: (key: string | null) => void
}

const DEV_PED: PedData = {
  model: 'mp_m_freemode_01',
  customization: {
    face: {
      face1: { index: 0, texture: 0, mix: 0.5 },
      face2: { index: 0, texture: 0, mix: 0.5 },
      face3: { index: 0, texture: 0, mix: 0.5 },
      features: Array(20).fill(50),
      eyeColor: 0,
    },
    overlay: {
      blemish:               { index: 2, opacity: 0.4 },
      facialHair:            { index: 5, opacity: 0.8, color1: 3, color2: 0 },
      eyebrows:              { index: 3, opacity: 1.0, color1: 5, color2: 0 },
      ageing:                { index: 1, opacity: 0.3 },
      makeup:                { index: 0, opacity: 0,   color1: 0 },
      blush:                 { index: 0, opacity: 0,   color1: 0 },
      complexion:            { index: 1, opacity: 0.5 },
      sunDamage:             { index: 0, opacity: 0   },
      lipstick:              { index: 0, opacity: 0,   color1: 0 },
      freckles:              { index: 0, opacity: 0   },
      chestHair:             { index: 2, opacity: 0.6, color1: 3 },
      bodyBlemish:           { index: 0, opacity: 0   },
      additionalBodyBlemish: { index: 0, opacity: 0   },
    },
    components: {
      faces:       { drawableId: 0,  textureId: 0 },
      mask:        { drawableId: 0,  textureId: 0 },
      hair:        { drawableId: 5,  textureId: 1 },
      torso:       { drawableId: 15, textureId: 0 },
      legs:        { drawableId: 14, textureId: 0 },
      bags:        { drawableId: 0,  textureId: 0 },
      shoes:       { drawableId: 10, textureId: 0 },
      accessories: { drawableId: 0,  textureId: 0 },
      undershirt:  { drawableId: 2,  textureId: 0 },
      kevlar:      { drawableId: 0,  textureId: 0 },
      badge:       { drawableId: 0,  textureId: 0 },
      torso2:      { drawableId: 15, textureId: 2 },
    },
    props: {
      hat:      { drawableId: -1, textureId: 0 },
      glass:    { drawableId: -1, textureId: 0 },
      ear:      { drawableId: -1, textureId: 0 },
      watch:    { drawableId:  3, textureId: 0 },
      bracelet: { drawableId: -1, textureId: 0 },
    },
    tattoos: [],
    hairOverlay: 0,
    colors: {
      hair:      { color1: { index: 0 }, color2: { index: 0 } },
      facialHair: { color1: { index: 0 } },
      eyebrows:   { color1: { index: 0 } },
      chestHair:  { color1: { index: 0 } },
    },
  },
}

export const useStore = create<AppStore>((set) => ({
  hidden: !import.meta.env.DEV,
  appState: import.meta.env.DEV ? 'CREATOR' : null,
  ped: import.meta.env.DEV ? DEV_PED : null,
  gender: 0,
  pricing: import.meta.env.DEV ? { SHOP: 500, BARBER: 100, TATTOO: 200, SURGERY: 5000 } : {},
  tattooData: [],
  whitelistedPeds: import.meta.env.DEV ? ['mp_m_freemode_01', 'mp_f_freemode_01'] : [],
  hairColorsMax: 64,
  hairOverlaysMax: 5,
  isNaked: false,
  drawables: import.meta.env.DEV ? {
    components: {
      1:  Array.from({ length: 20 }, (_, i) => i),  // mask
      2:  Array.from({ length: 74 }, (_, i) => i),  // hair
      3:  Array.from({ length: 40 }, (_, i) => i),  // torso
      4:  Array.from({ length: 40 }, (_, i) => i),  // legs
      5:  Array.from({ length: 10 }, (_, i) => i),  // bags
      6:  Array.from({ length: 25 }, (_, i) => i),  // shoes
      7:  Array.from({ length: 20 }, (_, i) => i),  // accessories
      8:  Array.from({ length: 35 }, (_, i) => i),  // undershirt
      9:  Array.from({ length: 15 }, (_, i) => i),  // kevlar
      10: Array.from({ length: 5  }, (_, i) => i),  // badge
      11: Array.from({ length: 40 }, (_, i) => i),  // jacket
    },
    props: {
      0: Array.from({ length: 40 }, (_, i) => i),  // hat
      1: Array.from({ length: 30 }, (_, i) => i),  // glasses
      2: Array.from({ length: 10 }, (_, i) => i),  // earring
      6: Array.from({ length: 10 }, (_, i) => i),  // watch
      7: Array.from({ length: 10 }, (_, i) => i),  // bracelet
    },
  } : { components: {}, props: {} },
  textures: import.meta.env.DEV ? {
    components: { '1': 4, '2': 4, '3': 6, '4': 6, '5': 3, '6': 6, '7': 4, '8': 6, '9': 2, '10': 2, '11': 6 },
    props:      { '0': 6, '1': 4, '2': 4, '6': 4, '7': 4 },
  } : { components: {}, props: {} },
  componentLocks: {},
  propLocks: {},
  randomizerRunning: false,
  randomizerSpeed: 5,
  activeAnimation: null,

  dispatch: (type, payload = {}) => {
    switch (type) {
      case 'APP_SHOW':
        set({ hidden: false })
        break
      case 'APP_HIDE':
        set({ hidden: true, isNaked: false, randomizerRunning: false, activeAnimation: null, componentLocks: {}, propLocks: {} })
        break
      case 'UI_RESET':
        set({
          ped: null,
          pricing: {},
          isNaked: false,
          drawables: { components: {}, props: {} },
          textures: { components: {}, props: {} },
          componentLocks: {},
          propLocks: {},
          randomizerRunning: false,
          randomizerSpeed: 5,
          activeAnimation: null,
        })
        break
      case 'SET_STATE':
        set({ appState: payload.state as AppState })
        break
      case 'SET_PED_DATA':
        set({ ped: payload.ped as PedData, gender: (payload.gender as 0 | 1) ?? 0 })
        break
      case 'SET_TATTOOS_DATA':
        set({ tattooData: (payload.data as TattooEntry[]) ?? [] })
        break
      case 'SET_PRICING':
        set({ pricing: (payload.pricing as Record<string, number>) ?? {} })
        break
      case 'SET_WL_PEDS':
        set({ whitelistedPeds: (payload.data as string[]) ?? [] })
        break
      case 'SET_HAIR_COLORS_MAX':
        set({
          hairColorsMax: (payload.max as number) ?? 64,
          hairOverlaysMax: (payload.maxOverlays as number) ?? 0,
        })
        break
      case 'SET_HAIR_COLOR_RGB': {
        const { type: colorType, name, rgb } = payload as { type: string; name: string; rgb: string }
        set((s) => {
          if (!s.ped) return s
          const colors = s.ped.customization.colors
          const group = colors[name]
          if (!group || !group[colorType]) return s
          return {
            ped: {
              ...s.ped,
              customization: {
                ...s.ped.customization,
                colors: {
                  ...colors,
                  [name]: { ...group, [colorType]: { ...group[colorType], rgb } },
                },
              },
            },
          }
        })
        break
      }
      case 'SET_MAX_DRAWABLE': {
        const { id, type: drawType, max } = payload as { id: number; type: string; max: number[] }
        const key = drawType === 'components' ? 'components' : 'props'
        set((s) => ({
          drawables: { ...s.drawables, [key]: { ...s.drawables[key], [id]: max } },
        }))
        break
      }
      case 'SET_MAX_TEXTURE': {
        const { id, type: drawType, max } = payload as { id: number; type: string; max: number }
        const key = drawType === 'components' ? 'components' : 'props'
        set((s) => ({
          textures: { ...s.textures, [key]: { ...s.textures[key], [`${id}`]: max } },
        }))
        break
      }
      case 'SET_ALL_DRAWABLES': {
        const { components: comps, props: prps, hairColorsMax, hairOverlaysMax } = payload as {
          components: Record<string, number[]>
          props: Record<string, number[]>
          hairColorsMax?: number
          hairOverlaysMax?: number
        }
        const newComponents: Record<number, number[]> = {}
        for (const [k, v] of Object.entries(comps)) newComponents[Number(k)] = v
        const newProps: Record<number, number[]> = {}
        for (const [k, v] of Object.entries(prps)) newProps[Number(k)] = v
        set((s) => ({
          drawables: {
            components: { ...s.drawables.components, ...newComponents },
            props:      { ...s.drawables.props,      ...newProps },
          },
          ...(hairColorsMax  !== undefined ? { hairColorsMax }  : {}),
          ...(hairOverlaysMax !== undefined ? { hairOverlaysMax } : {}),
        }))
        break
      }
      case 'SET_RANDOMIZED_PED': {
        const { components, props } = payload as {
          components: Record<string, ComponentEntry>
          props: Record<string, PropEntry>
        }
        set((s) => {
          if (!s.ped) return s
          return {
            ped: {
              ...s.ped,
              customization: {
                ...s.ped.customization,
                components: { ...s.ped.customization.components, ...components },
                props: { ...s.ped.customization.props, ...props },
              },
            },
          }
        })
        break
      }
    }
  },

  setComponent: (name, type, value) =>
    set((s) => {
      if (!s.ped) return s
      return {
        ped: {
          ...s.ped,
          customization: {
            ...s.ped.customization,
            components: {
              ...s.ped.customization.components,
              [name]: { ...s.ped.customization.components[name], [type]: value },
            },
          },
        },
      }
    }),

  setProp: (name, type, value) =>
    set((s) => {
      if (!s.ped) return s
      return {
        ped: {
          ...s.ped,
          customization: {
            ...s.ped.customization,
            props: {
              ...s.ped.customization.props,
              [name]: { ...s.ped.customization.props[name], [type]: value },
            },
          },
        },
      }
    }),

  setOverlay: (overlayType, extraType, value) =>
    set((s) => {
      if (!s.ped) return s
      const overlay = s.ped.customization.overlay
      return {
        ped: {
          ...s.ped,
          customization: {
            ...s.ped.customization,
            overlay: {
              ...overlay,
              [overlayType]: { ...overlay[overlayType], [extraType]: value },
            },
          },
        },
      }
    }),

  setFaceFeature: (index, value) =>
    set((s) => {
      if (!s.ped) return s
      const features = [...s.ped.customization.face.features]
      features[index] = value
      return {
        ped: {
          ...s.ped,
          customization: {
            ...s.ped.customization,
            face: { ...s.ped.customization.face, features },
          },
        },
      }
    }),

  setHeadBlend: (face, blendType, value) =>
    set((s) => {
      if (!s.ped) return s
      const faceData = s.ped.customization.face
      return {
        ped: {
          ...s.ped,
          customization: {
            ...s.ped.customization,
            face: {
              ...faceData,
              [face]: { ...faceData[face], [blendType]: value },
            },
          },
        },
      }
    }),

  setHairColor: (name, colorType, index, rgb) =>
    set((s) => {
      if (!s.ped) return s
      const colors = s.ped.customization.colors
      const group = colors[name] ?? {}
      return {
        ped: {
          ...s.ped,
          customization: {
            ...s.ped.customization,
            colors: {
              ...colors,
              [name]: { ...group, [colorType]: { index, rgb } },
            },
          },
        },
      }
    }),

  setHairOverlay: (value) =>
    set((s) => {
      if (!s.ped) return s
      return {
        ped: {
          ...s.ped,
          customization: { ...s.ped.customization, hairOverlay: value },
        },
      }
    }),

  setEyeColor: (value) =>
    set((s) => {
      if (!s.ped) return s
      return {
        ped: {
          ...s.ped,
          customization: {
            ...s.ped.customization,
            face: { ...s.ped.customization.face, eyeColor: value },
          },
        },
      }
    }),

  setTattoo: (index, data) =>
    set((s) => {
      if (!s.ped) return s
      const tattoos = [...s.ped.customization.tattoos]
      tattoos[index] = data
      return {
        ped: { ...s.ped, customization: { ...s.ped.customization, tattoos } },
      }
    }),

  addTattoo: (zone) =>
    set((s) => {
      if (!s.ped) return s
      return {
        ped: {
          ...s.ped,
          customization: {
            ...s.ped.customization,
            tattoos: [
              ...s.ped.customization.tattoos,
              { Name: '', Collection: '', Zone: zone },
            ],
          },
        },
      }
    }),

  removeTattoo: (index) =>
    set((s) => {
      if (!s.ped) return s
      const tattoos = [...s.ped.customization.tattoos]
      tattoos.splice(index, 1)
      return {
        ped: { ...s.ped, customization: { ...s.ped.customization, tattoos } },
      }
    }),

  setNaked: (value) => set({ isNaked: value }),

  toggleComponentLock: (name) =>
    set((s) => ({ componentLocks: { ...s.componentLocks, [name]: !s.componentLocks[name] } })),

  togglePropLock: (name) =>
    set((s) => ({ propLocks: { ...s.propLocks, [name]: !s.propLocks[name] } })),

  setRandomizerRunning: (running) => set({ randomizerRunning: running }),

  setRandomizerSpeed: (speed) => set({ randomizerSpeed: speed }),

  setActiveAnimation: (key) => set({ activeAnimation: key }),
}))
