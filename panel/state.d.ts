// The panel's $.state contract: what it keeps between redraws of the session.
// Self-contained by rule (no imports). It mirrors the types in model.ts; `claude plugin
// validate` type-checks register.tsx, which passes values both ways, so a drift fails there.

export type StoredSkillRef = {
  scope: 'user' | 'project' | 'plugin';
  name: string;
  pluginId?: string;
  projectPath?: string;
};

export type StoredSetting =
  | { key: string; type: 'boolean'; description: string; whenTrue?: string; whenFalse?: string }
  | { key: string; type: 'enum'; description: string; options: { value: string; instruction: string }[] }
  | { key: string; type: 'integer'; description: string; min: number; max: number; instruction: string };

export type StoredSkill = {
  skill: StoredSkillRef;
  label: string;
  settingsFile: string;
  settings: StoredSetting[] | null;
  values: Record<string, boolean | string | number> | null;
  invalid: string[] | null;
  update: 'unchanged' | 'changed-intact' | 'changed' | 'needs-rewrite' | 'missing';
  lost: number;
};

declare module 'claude-code' {
  interface PluginState {
    'skill-customizer': { skills: Shaped<StoredSkill[]>; message: Shaped<string> };
  }
}
