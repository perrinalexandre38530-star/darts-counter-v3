// src/types.ts
// =====================================================
// Types globaux pour Darts Counter
// =====================================================

// Multiplicateur : S (1), D (2), T (3)
export type Mult = 1 | 2 | 3;

// Donnée d'une fléchette (valeur + multiplicateur)
export type Dart = {
  value: number;   // 0..20, 25 pour BULL
  mult: Mult;      // S=1, D=2, T=3
};

// Informations de joueur
export type Player = {
  id: string;
  name: string;
  score: number;
};