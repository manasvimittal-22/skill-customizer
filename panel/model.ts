// The panel's logic, kept free of the mod API so the repo's own tests cover it.
// The panel never edits files itself: it runs the bundled engine (`sc.mjs`) like the
// skill does, and only its `overview` and `settings set|reset` commands.

export interface PanelSkillRef {
  readonly scope: 'user' | 'project' | 'plugin';
  readonly name: string;
  readonly pluginId?: string;
  readonly projectPath?: string;
}

export type PanelSetting =
  | {
      readonly key: string;
      readonly type: 'boolean';
      readonly description: string;
      readonly whenTrue?: string;
      readonly whenFalse?: string;
    }
  | {
      readonly key: string;
      readonly type: 'enum';
      readonly description: string;
      readonly options: readonly { readonly value: string; readonly instruction: string }[];
    }
  | {
      readonly key: string;
      readonly type: 'integer';
      readonly description: string;
      readonly min: number;
      readonly max: number;
      readonly instruction: string;
    };

/** One entry of `sc overview`. */
export interface PanelSkill {
  readonly skill: PanelSkillRef;
  readonly label: string;
  readonly settingsFile: string;
  readonly settings: readonly PanelSetting[] | null;
  readonly values: Readonly<Record<string, boolean | string | number>> | null;
  readonly invalid: readonly string[] | null;
  readonly update: 'unchanged' | 'changed-intact' | 'changed' | 'needs-rewrite' | 'missing';
  readonly lost: number;
}

export type EngineResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly message: string };

/** Reads the engine's one JSON envelope. */
export function parseEnvelope<T>(stdout: string, stderr = ''): EngineResult<T> {
  try {
    const envelope = JSON.parse(stdout) as { ok?: boolean; data?: T; error?: { message?: string } };
    if (envelope.ok === true) return { ok: true, data: envelope.data as T };
    return { ok: false, message: envelope.error?.message ?? 'The engine reported an error.' };
  } catch {
    const detail = (stderr || stdout).trim().split('\n')[0] ?? '';
    return { ok: false, message: detail ? `The engine failed: ${detail}` : 'The engine printed nothing.' };
  }
}

export function enginePath(pluginRoot: string): string {
  return `${pluginRoot.replace(/[\\/]+$/, '')}/skills/customize/scripts/sc.mjs`;
}

/** The arguments that name one skill exactly, so the engine never has to guess between scopes. */
export function skillArgs(ref: PanelSkillRef): string[] {
  const args = [ref.name, '--scope', ref.scope];
  if (ref.pluginId) args.push('--plugin', ref.pluginId);
  if (ref.projectPath) args.push('--project', ref.projectPath);
  return args;
}

export function overviewArgv(engine: string): string[] {
  return ['node', engine, 'overview'];
}

export function setArgv(engine: string, ref: PanelSkillRef, key: string, value: string | number | boolean): string[] {
  const [, ...options] = skillArgs(ref);
  return ['node', engine, 'settings', 'set', ref.name, `${key}=${String(value)}`, ...options];
}

export function resetArgv(engine: string, ref: PanelSkillRef): string[] {
  return ['node', engine, 'settings', 'reset', ...skillArgs(ref)];
}

/** What the skill does with the current value, in the schema's own words. */
export function effectOf(setting: PanelSetting, value: unknown): string {
  if (setting.type === 'boolean') return (value === true ? setting.whenTrue : setting.whenFalse) ?? '';
  if (setting.type === 'enum') return setting.options.find((o) => o.value === value)?.instruction ?? '';
  return setting.instruction.split('{value}').join(String(value));
}

export function scopeLabel(ref: PanelSkillRef): string {
  return ref.scope === 'plugin' ? `plugin ${ref.pluginId ?? ''}`.trim() : ref.scope;
}

/** A line telling the user an update needs them, or null. */
export function updateNote(skill: PanelSkill): string | null {
  if (skill.update === 'changed' || skill.update === 'needs-rewrite') {
    const changes = skill.lost === 1 ? '1 of your changes' : `${skill.lost} of your changes`;
    return `Updated: ${changes} need putting back. Run /skill-customizer:customize ${skill.skill.name}.`;
  }
  if (skill.update === 'missing') return 'This skill is not installed any more.';
  return null;
}

/** A stable element address for a skill's control, unique across the pane. */
export function controlKey(ref: PanelSkillRef, part: string): string {
  return [ref.scope, ref.pluginId ?? '', ref.projectPath ?? '', ref.name, part].join('|');
}
