import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Material, MaterialPermission, ApprovalStatus, Grade, UserProfile } from '../types';
import { logAdminAction } from './authService';

export async function createMaterial(
  materialData: Omit<Material, 'materialId' | 'uploadedAt'>,
  adminProfile: UserProfile
): Promise<Material> {
  const materialId = `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullMaterial: Material = {
    ...materialData,
    materialId,
    uploadedAt: new Date().toISOString()
  };

  try {
    const matRef = doc(db, 'materials', materialId);
    await setDoc(matRef, fullMaterial);

    await logAdminAction({
      adminUid: adminProfile.uid,
      adminUsername: adminProfile.username,
      action: 'UPLOAD_MATERIAL',
      materialId,
      materialTitle: fullMaterial.title,
      details: `Uploaded ${fullMaterial.grade} material: "${fullMaterial.title}" (${fullMaterial.subject})`
    });

    return fullMaterial;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `materials/${materialId}`);
    throw err;
  }
}

export async function updateMaterial(
  materialId: string,
  updates: Partial<Material>,
  adminProfile: UserProfile
): Promise<void> {
  try {
    const matRef = doc(db, 'materials', materialId);
    await updateDoc(matRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await logAdminAction({
      adminUid: adminProfile.uid,
      adminUsername: adminProfile.username,
      action: 'UPDATE_MATERIAL',
      materialId,
      materialTitle: updates.title,
      details: `Updated material information for ${materialId}`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `materials/${materialId}`);
    throw err;
  }
}

export async function deleteMaterial(materialId: string, title: string, adminProfile: UserProfile): Promise<void> {
  try {
    // Delete material
    await deleteDoc(doc(db, 'materials', materialId));

    // Cleanup permissions for this material
    const permCol = collection(db, 'permissions');
    const q = query(permCol, where('materialId', '==', materialId));
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    await logAdminAction({
      adminUid: adminProfile.uid,
      adminUsername: adminProfile.username,
      action: 'DELETE_MATERIAL',
      materialId,
      materialTitle: title,
      details: `Deleted material "${title}" and cleaned up ${snap.docs.length} permission entries`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `materials/${materialId}`);
    throw err;
  }
}

export async function fetchAllMaterials(): Promise<Material[]> {
  try {
    const col = collection(db, 'materials');
    const snapshot = await getDocs(col);
    return snapshot.docs.map(d => d.data() as Material);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'materials');
    return [];
  }
}

// Student fetch: only get materials that are approved for this student
export async function fetchApprovedMaterialsForStudent(studentUid: string): Promise<Material[]> {
  try {
    // 1. Fetch student's approved permissions
    const permCol = collection(db, 'permissions');
    const q = query(permCol, where('uid', '==', studentUid), where('status', '==', 'approved'));
    const permSnap = await getDocs(q);
    const approvedMaterialIds = permSnap.docs.map(d => (d.data() as MaterialPermission).materialId);

    if (approvedMaterialIds.length === 0) {
      return [];
    }

    // 2. Fetch all materials and filter by approved IDs
    const allMaterials = await fetchAllMaterials();
    return allMaterials.filter(m => approvedMaterialIds.includes(m.materialId) && m.status === 'published');
  } catch (err) {
    console.error('Error fetching approved materials:', err);
    return [];
  }
}

// Fetch all permissions (Admin view)
export async function fetchAllPermissions(): Promise<MaterialPermission[]> {
  try {
    const permCol = collection(db, 'permissions');
    const snap = await getDocs(permCol);
    return snap.docs.map(d => d.data() as MaterialPermission);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'permissions');
    return [];
  }
}

// Fetch permissions for a specific student
export async function fetchPermissionsForStudent(studentUid: string): Promise<MaterialPermission[]> {
  try {
    const permCol = collection(db, 'permissions');
    const q = query(permCol, where('uid', '==', studentUid));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as MaterialPermission);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'permissions');
    return [];
  }
}

// Set or update a permission
export async function setStudentMaterialPermission(params: {
  uid: string;
  username: string;
  materialId: string;
  materialTitle: string;
  grade: Grade;
  subject: string;
  status: ApprovalStatus;
  adminProfile: UserProfile;
  notes?: string;
}): Promise<MaterialPermission> {
  const { uid, username, materialId, materialTitle, grade, subject, status, adminProfile, notes } = params;
  const permissionId = `${uid}_${materialId}`;
  const now = new Date().toISOString();

  const record: MaterialPermission = {
    permissionId,
    uid,
    username,
    materialId,
    materialTitle,
    grade,
    subject,
    status,
    approvedBy: adminProfile.username,
    approvedAt: status === 'approved' ? now : undefined,
    updatedAt: now,
    notes: notes || ''
  };

  try {
    const permRef = doc(db, 'permissions', permissionId);
    await setDoc(permRef, record, { merge: true });

    await logAdminAction({
      adminUid: adminProfile.uid,
      adminUsername: adminProfile.username,
      action: `PERMISSION_${status.toUpperCase()}`,
      targetUid: uid,
      targetUsername: username,
      materialId,
      materialTitle,
      details: `Set status to ${status.toUpperCase()} for "${materialTitle}"`
    });

    return record;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `permissions/${permissionId}`);
    throw err;
  }
}

// Record last accessed timestamp when student opens the viewer
export async function recordStudentAccess(permissionId: string): Promise<void> {
  try {
    const permRef = doc(db, 'permissions', permissionId);
    await updateDoc(permRef, {
      lastAccessDate: new Date().toISOString()
    });
  } catch {
    // Non-fatal
  }
}
