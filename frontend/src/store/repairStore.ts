import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockRepairRecords } from '@/mock/data';
import type { RepairRecord, RepairPart } from '@/types';

interface RepairPhoto {
  id: string;
  url: string;
  type: 'before' | 'after';
  name: string;
  uploadTime: string;
}

interface RepairState {
  repairs: RepairRecord[];
  photos: Record<string, RepairPhoto[]>;
  addRepair: (repair: Omit<RepairRecord, 'id' | 'receiveDate' | 'status' | 'partsUsed' | 'beforePhotos' | 'afterPhotos' | 'laborCost' | 'partsCost' | 'totalCost'> & { customerId: string; customerName: string; clockId: string; clockInfo: string }) => RepairRecord;
  getRepair: (id: string) => RepairRecord | undefined;
  updateRepair: (id: string, updates: Partial<RepairRecord>) => void;
  updateStatus: (id: string, status: RepairRecord['status']) => void;
  addPart: (repairId: string, part: RepairPart) => void;
  removePart: (repairId: string, partId: string) => void;
  uploadPhoto: (repairId: string, photo: Omit<RepairPhoto, 'id' | 'uploadTime'>) => void;
  deletePhoto: (repairId: string, photoId: string) => void;
  getPhotos: (repairId: string, type?: 'before' | 'after') => RepairPhoto[];
  deleteRepair: (id: string) => void;
}

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const generateRepairId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `RX-${year}-${month}${random}`;
};

const isBlobUrl = (url: string) => typeof url === 'string' && url.startsWith('blob:');

const cleanBlobUrls = (state: { repairs: RepairRecord[]; photos: Record<string, RepairPhoto[]> }) => {
  const cleanedPhotos: Record<string, RepairPhoto[]> = {};
  for (const [repairId, photoList] of Object.entries(state.photos)) {
    cleanedPhotos[repairId] = photoList.filter((p) => !isBlobUrl(p.url));
  }

  const cleanedRepairs = state.repairs.map((r) => ({
    ...r,
    beforePhotos: r.beforePhotos.filter((url: string) => !isBlobUrl(url)),
    afterPhotos: r.afterPhotos.filter((url: string) => !isBlobUrl(url)),
  }));

  return { repairs: cleanedRepairs, photos: cleanedPhotos };
};

export const useRepairStore = create<RepairState>()(
  persist(
    (set, get) => ({
      repairs: mockRepairRecords,
      photos: {},

      addRepair: (data) => {
        const newRepair: RepairRecord = {
          id: generateRepairId(),
          clockId: data.clockId,
          clockInfo: data.clockInfo,
          customerId: data.customerId,
          customerName: data.customerName,
          type: data.type || '维修',
          status: '待接收',
          priority: data.priority || '中',
          description: data.description || '',
          diagnosis: '',
          solution: '',
          partsUsed: [],
          laborCost: 0,
          partsCost: 0,
          totalCost: 0,
          beforePhotos: [],
          afterPhotos: [],
          receiveDate: formatDate(new Date()),
          expectedDate: data.expectedDate,
          completeDate: undefined,
          technician: data.technician,
          notes: data.notes,
        };

        set((state) => ({
          repairs: [newRepair, ...state.repairs],
        }));

        return newRepair;
      },

      getRepair: (id) => {
        return get().repairs.find((r) => r.id === id);
      },

      updateRepair: (id, updates) => {
        set((state) => ({
          repairs: state.repairs.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      updateStatus: (id, status) => {
        const updates: Partial<RepairRecord> = { status };
        if (status === '已完成') {
          updates.completeDate = formatDate(new Date());
        }
        get().updateRepair(id, updates);
      },

      addPart: (repairId, part) => {
        set((state) => {
          const repairs = state.repairs.map((r) => {
            if (r.id !== repairId) return r;
            const newParts = [...r.partsUsed, part];
            const partsCost = newParts.reduce((sum, p) => sum + p.totalPrice, 0);
            return {
              ...r,
              partsUsed: newParts,
              partsCost,
              totalCost: r.laborCost + partsCost,
            };
          });
          return { repairs };
        });
      },

      removePart: (repairId, partId) => {
        set((state) => {
          const repairs = state.repairs.map((r) => {
            if (r.id !== repairId) return r;
            const newParts = r.partsUsed.filter((p) => p.id !== partId);
            const partsCost = newParts.reduce((sum, p) => sum + p.totalPrice, 0);
            return {
              ...r,
              partsUsed: newParts,
              partsCost,
              totalCost: r.laborCost + partsCost,
            };
          });
          return { repairs };
        });
      },

      uploadPhoto: (repairId, photo) => {
        const newPhoto: RepairPhoto = {
          ...photo,
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          uploadTime: new Date().toISOString(),
        };

        set((state) => {
          const existingPhotos = state.photos[repairId] || [];
          const updatedPhotos = [...existingPhotos, newPhoto];

          const repairs = state.repairs.map((r) => {
            if (r.id !== repairId) return r;
            if (photo.type === 'before') {
              return { ...r, beforePhotos: [...r.beforePhotos, newPhoto.url] };
            } else {
              return { ...r, afterPhotos: [...r.afterPhotos, newPhoto.url] };
            }
          });

          return {
            photos: { ...state.photos, [repairId]: updatedPhotos },
            repairs,
          };
        });
      },

      deletePhoto: (repairId, photoId) => {
        set((state) => {
          const existingPhotos = state.photos[repairId] || [];
          const photoToDelete = existingPhotos.find((p) => p.id === photoId);
          const updatedPhotos = existingPhotos.filter((p) => p.id !== photoId);

          const repairs = state.repairs.map((r) => {
            if (r.id !== repairId) return r;
            if (photoToDelete?.type === 'before') {
              return { ...r, beforePhotos: r.beforePhotos.filter((url) => url !== photoToDelete.url) };
            } else if (photoToDelete?.type === 'after') {
              return { ...r, afterPhotos: r.afterPhotos.filter((url) => url !== photoToDelete.url) };
            }
            return r;
          });

          return {
            photos: { ...state.photos, [repairId]: updatedPhotos },
            repairs,
          };
        });
      },

      getPhotos: (repairId, type) => {
        const allRepairPhotos = get().photos[repairId] || [];
        if (!repairId) return [];
        if (type) {
          return allRepairPhotos.filter((p) => p.type === type);
        }
        return allRepairPhotos;
      },

      deleteRepair: (id) => {
        set((state) => {
          const { [id]: _, ...remainingPhotos } = state.photos;
          return {
            repairs: state.repairs.filter((r) => r.id !== id),
            photos: remainingPhotos,
          };
        });
      },
    }),
    {
      name: 'repair-storage',
      version: 2,
      partialize: (state) => ({ repairs: state.repairs, photos: state.photos }),
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return cleanBlobUrls(persistedState);
        }
        return persistedState;
      },
    }
  )
);
