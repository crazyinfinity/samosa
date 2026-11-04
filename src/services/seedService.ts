import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Material, MaterialPermission, PREDEFINED_USERNAMES } from '../types';
import { encodeUsernameToEmail, hashPassword } from './authService';

export const DEFAULT_DEMO_PASSWORD = 'password123';

export const INITIAL_MATERIALS: Omit<Material, 'uploadedAt'>[] = [
  {
    materialId: 'mat_g10_math_01',
    title: 'Grade 10 Mathematics PDF 1 - Quadratic Equations & Arithmetic Progressions',
    description: 'Comprehensive derivation of the quadratic formula, discriminant nature of roots, word problems, and AP nth term formulas.',
    grade: 'GRADE_10',
    subject: 'Mathematics',
    chapter: 'Chapter 4 & 5: Quadratic Equations',
    fileSize: '3.4 MB',
    pageCount: 18,
    uploadedBy: 'inf/admin',
    status: 'published',
    pdfPages: [
      `samosa.com MASTER NOTE | GRADE 10 MATHEMATICS
CHAPTER 4: QUADRATIC EQUATIONS

1. Standard Form:
   ax² + bx + c = 0, where a ≠ 0 and a, b, c ∈ ℝ.

2. Quadratic Formula:
   x = (-b ± √(b² - 4ac)) / (2a)
   where Discriminant D = b² - 4ac.

3. Nature of Roots:
   • If D > 0: Two distinct real roots.
   • If D = 0: Two equal real roots (-b / 2a).
   • If D < 0: No real roots (imaginary conjugate pair).

4. Key Exam Invariant:
   Sum of roots (α + β) = -b/a
   Product of roots (α · β) = c/a

5. Example Problem:
   Solve 2x² - 7x + 3 = 0.
   D = (-7)² - 4(2)(3) = 49 - 24 = 25 (> 0).
   x = (7 ± √25) / 4 = (7 ± 5) / 4 => x = 3 or x = 1/2.`,

      `samosa.com MASTER NOTE | GRADE 10 MATHEMATICS
CHAPTER 5: ARITHMETIC PROGRESSIONS (AP)

1. nth Term Definition:
   aₙ = a + (n - 1)d
   where 'a' is first term, 'd' is common difference.

2. Sum of First n Terms:
   Sₙ = (n / 2)[2a + (n - 1)d] = (n / 2)[a + l]
   where 'l' is the last term aₙ.

3. Standard Arithmetic Mean:
   For terms a, b, c in AP:
   b = (a + c) / 2

4. Confidential Practice Problem:
   Find the 20th term of AP: 2, 7, 12, 17...
   a = 2, d = 5, n = 20.
   a₂₀ = 2 + (19 * 5) = 2 + 95 = 97.`
    ]
  },
  {
    materialId: 'mat_g10_sci_02',
    title: 'Grade 10 Science PDF 2 - Chemical Reactions & Equations',
    description: 'Balancing oxidation-reduction reactions, precipitation, exothermic vs endothermic processes, and corrosion prevention.',
    grade: 'GRADE_10',
    subject: 'Science (Chemistry)',
    chapter: 'Chapter 1: Chemical Reactions',
    fileSize: '4.1 MB',
    pageCount: 22,
    uploadedBy: 'inf/admin',
    status: 'published',
    pdfPages: [
      `samosa.com MASTER NOTE | GRADE 10 SCIENCE
CHAPTER 1: CHEMICAL REACTIONS & EQUATIONS

1. Indicators of Chemical Change:
   • Change in state
   • Change in colour
   • Evolution of gas
   • Change in temperature

2. Balanced Equation Principle:
   Law of Conservation of Mass:
   Total mass of reactants = Total mass of products.
   Example: 3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g)

3. Types of Reactions:
   • Combination: CaO + H₂O → Ca(OH)₂ + Heat (Slaked lime)
   • Decomposition: 2FeSO₄ → Fe₂O₃ + SO₂ + SO₃
   • Displacement: Fe + CuSO₄ → FeSO₄ + Cu (Blue to green)
   • Double Displacement: Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl
   • Redox: CuO + H₂ → Cu + H₂O (CuO is reduced, H₂ is oxidized).`,

      `samosa.com MASTER NOTE | GRADE 10 SCIENCE
PREVENTION OF CORROSION & RANCIDITY

1. Corrosion:
   Degradation of metals due to moist air.
   Rusting of iron: 2Fe + 3/2 O₂ + xH₂O → Fe₂O₃·xH₂O
   Prevention: Galvanisation (Zinc coating), Electroplating, Alloying.

2. Rancidity:
   Oxidation of fats and oils leading to foul smell and taste.
   Prevention:
   • Flushing food packets with inert Nitrogen gas (N₂).
   • Adding BHT/BHA antioxidants.
   • Vacuum air-tight storage.`
    ]
  },
  {
    materialId: 'mat_g12_phy_01',
    title: 'Grade 12 Physics PDF 1 - Electrostatics & Electric Potential',
    description: 'Coulombs Law in vector form, Gauss Theorem applications, electric field due to dipole, capacitors in series and parallel.',
    grade: 'GRADE_12',
    subject: 'Physics',
    chapter: 'Unit 1: Electrostatics',
    fileSize: '5.8 MB',
    pageCount: 34,
    uploadedBy: 'inf/admin',
    status: 'published',
    pdfPages: [
      `samosa.com MASTER NOTE | GRADE 12 ADVANCED PHYSICS
CHAPTER 1: ELECTRIC CHARGES AND FIELDS

1. Coulomb's Law (Vector Form):
   F⃗₁₂ = (1 / 4πε₀) · (q₁q₂ / r²) · r̂₂₁
   where ε₀ = 8.854 × 10⁻¹² C² N⁻¹ m⁻²
   1 / 4πε₀ ≈ 9 × 10⁹ N m² C⁻²

2. Electric Field of Dipole:
   Dipole Moment: p⃗ = q · (2a⃗)
   • Axial Line: E⃗_axial = (1 / 4πε₀) · (2p⃗ / r³)  (for r >> a)
   • Equatorial: E⃗_eq = -(1 / 4πε₀) · (p⃗ / r³)  (for r >> a)
   Ratio E_axial / E_eq = 2 : 1.

3. Gauss's Law:
   ∮ E⃗ · dA⃗ = q_enclosed / ε₀
   Applications:
   • Infinite straight wire: E = λ / (2πε₀r)
   • Infinite planar sheet: E = σ / (2ε₀)`,

      `samosa.com MASTER NOTE | GRADE 12 ADVANCED PHYSICS
CHAPTER 2: CAPACITANCE & DIELECTRICS

1. Parallel Plate Capacitor:
   C = ε₀A / d
   With dielectric slab of constant K: C' = K · C

2. Combinations:
   • Series: 1/C_eq = 1/C₁ + 1/C₂ + 1/C₃
   • Parallel: C_eq = C₁ + C₂ + C₃

3. Energy Stored in Capacitor:
   U = (1/2)CV² = (1/2)(Q² / C) = (1/2)QV
   Energy density u = (1/2)ε₀E²`
    ]
  },
  {
    materialId: 'mat_g12_math_02',
    title: 'Grade 12 Mathematics PDF 2 - Differential Calculus & Applications',
    description: 'Continuity and Differentiability, Chain rule, Mean Value Theorems, Maxima and Minima, tangents and normals.',
    grade: 'GRADE_12',
    subject: 'Mathematics',
    chapter: 'Unit 3: Calculus',
    fileSize: '4.6 MB',
    pageCount: 28,
    uploadedBy: 'inf/admin',
    status: 'published',
    pdfPages: [
      `samosa.com MASTER NOTE | GRADE 12 MATHEMATICS
CONTINUITY & APPLICATION OF DERIVATIVES

1. Definition of Continuity:
   f(x) is continuous at x = c iff:
   lim(x→c⁻) f(x) = lim(x→c⁺) f(x) = f(c)

2. Critical Point Test for Local Extrema:
   • First derivative test: f'(c) = 0 or undefined.
   • Second derivative test:
     If f''(c) < 0 => Local Maximum at c.
     If f''(c) > 0 => Local Minimum at c.
     If f''(c) = 0 => Test inconclusive.`,

      `samosa.com MASTER NOTE | GRADE 12 MATHEMATICS
INTEGRATION AS INVERSE DERIVATIVE

1. Fundamental Theorem of Calculus:
   ∫ₐᵇ f(x) dx = F(b) - F(a), where F'(x) = f(x).

2. Integration by Parts:
   ∫ u v dx = u ∫ v dx - ∫ [u' (∫ v dx)] dx
   Order of preference: ILATE
   (Inverse, Logarithmic, Algebraic, Trigonometric, Exponential).`
    ]
  }
];

export async function checkAndSeedInitialData(): Promise<{
  seeded: boolean;
  message: string;
}> {
  try {
    const adminRef = doc(db, 'users', 'admin_predefined');
    const snap = await getDoc(adminRef);

    if (snap.exists()) {
      return { seeded: false, message: 'Platform data is already initialized.' };
    }

    // 1. Seed users
    for (const username of PREDEFINED_USERNAMES) {
      const isAdmin = username === 'inf/admin';
      const uid = username.replace('/', '_').replace('#', 'hash');
      const email = encodeUsernameToEmail(username);
      const passwordHash = await hashPassword(isAdmin ? 'qp2026@' : DEFAULT_DEMO_PASSWORD);

      const profile: UserProfile = {
        uid,
        username,
        email,
        role: isAdmin ? 'admin' : 'student',
        gradeAccess: ['GRADE_10', 'GRADE_12'],
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'system_bootstrap',
        passwordHash
      };

      await setDoc(doc(db, 'users', uid), profile, { merge: true });

      if (isAdmin) {
        await setDoc(doc(db, 'admins', uid), {
          uid,
          username,
          email,
          createdAt: profile.createdAt
        });
      }
    }

    // 2. Seed materials
    for (const mat of INITIAL_MATERIALS) {
      await setDoc(doc(db, 'materials', mat.materialId), {
        ...mat,
        uploadedAt: new Date().toISOString()
      });
    }

    // 3. Seed specific permissions as mandated in project specification:
    // Student: inf/thilak
    // - Grade 10 Mathematics PDF 1 -> Approved
    // - Grade 10 Science PDF 2 -> Rejected
    // - Grade 12 Physics PDF 1 -> Pending / Not approved
    const thilakUid = 'inf_thilak';
    
    // Permission 1: Approved
    await setDoc(doc(db, 'permissions', `${thilakUid}_mat_g10_math_01`), {
      permissionId: `${thilakUid}_mat_g10_math_01`,
      uid: thilakUid,
      username: 'inf/thilak',
      materialId: 'mat_g10_math_01',
      materialTitle: 'Grade 10 Mathematics PDF 1 - Quadratic Equations',
      grade: 'GRADE_10',
      subject: 'Mathematics',
      status: 'approved',
      approvedBy: 'inf/admin',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as MaterialPermission);

    // Permission 2: Rejected
    await setDoc(doc(db, 'permissions', `${thilakUid}_mat_g10_sci_02`), {
      permissionId: `${thilakUid}_mat_g10_sci_02`,
      uid: thilakUid,
      username: 'inf/thilak',
      materialId: 'mat_g10_sci_02',
      materialTitle: 'Grade 10 Science PDF 2 - Chemical Reactions',
      grade: 'GRADE_10',
      subject: 'Science (Chemistry)',
      status: 'rejected',
      approvedBy: 'inf/admin',
      updatedAt: new Date().toISOString(),
      notes: 'Access restricted per academic cohort revision schedule.'
    } as MaterialPermission);

    // Permission 3: Pending
    await setDoc(doc(db, 'permissions', `${thilakUid}_mat_g12_phy_01`), {
      permissionId: `${thilakUid}_mat_g12_phy_01`,
      uid: thilakUid,
      username: 'inf/thilak',
      materialId: 'mat_g12_phy_01',
      materialTitle: 'Grade 12 Physics PDF 1 - Electrostatics',
      grade: 'GRADE_12',
      subject: 'Physics',
      status: 'pending',
      updatedAt: new Date().toISOString()
    } as MaterialPermission);

    // Seed some approved materials for other students (e.g. inf/rag, inf/suji)
    const ragUid = 'inf_rag';
    await setDoc(doc(db, 'permissions', `${ragUid}_mat_g10_math_01`), {
      permissionId: `${ragUid}_mat_g10_math_01`,
      uid: ragUid,
      username: 'inf/rag',
      materialId: 'mat_g10_math_01',
      materialTitle: 'Grade 10 Mathematics PDF 1 - Quadratic Equations',
      grade: 'GRADE_10',
      subject: 'Mathematics',
      status: 'approved',
      approvedBy: 'inf/admin',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as MaterialPermission);

    await setDoc(doc(db, 'permissions', `${ragUid}_mat_g12_phy_01`), {
      permissionId: `${ragUid}_mat_g12_phy_01`,
      uid: ragUid,
      username: 'inf/rag',
      materialId: 'mat_g12_phy_01',
      materialTitle: 'Grade 12 Physics PDF 1 - Electrostatics',
      grade: 'GRADE_12',
      subject: 'Physics',
      status: 'approved',
      approvedBy: 'inf/admin',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as MaterialPermission);

    return { seeded: true, message: 'Platform seeded with predefined users, materials and permissions!' };
  } catch (err) {
    console.warn('Seed operation warning:', err);
    return { seeded: false, message: 'Seeding completed or partially applied.' };
  }
}
