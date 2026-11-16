// skill-customizer's panel beside the chat (a Claude Code mod). It shows every customized
// skill's settings and changes them through the bundled engine, exactly as the skill does.
// It edits setting values only, never a skill file.
import { atom, read, update } from 'claude-code';
import type { EngineInterface, Register } from 'claude-code';

import {
  controlKey,
  effectOf,
  enginePath,
  overviewArgv,
  parseEnvelope,
  resetArgv,
  scopeLabel,
  setArgv,
  updateNote,
  type PanelSkill,
  type PanelSkillRef,
} from './model';
import type { StoredSkill } from './state';

const PANE = 'skill-settings';
const TITLE = 'Skill settings';
const TOOL = 'open_settings_panel';

// Change a tag when the stored shape changes: it declines what an earlier version kept.
const skillsAtom = atom({ plugin: 'skill-customizer', key: 'skills' } as const, [] as StoredSkill[], {
  shape: 'skills-1',
});
const messageAtom = atom({ plugin: 'skill-customizer', key: 'message' } as const, '', {
  shape: 'message-1',
});

async function engine<T>($: EngineInterface, argv: string[]) {
  const ran = await $.process.run(argv, { timeoutMs: 20_000 });
  return parseEnvelope<T>(ran.stdout, ran.stderr);
}

async function refresh($: EngineInterface): Promise<void> {
  const result = await engine<{ skills: PanelSkill[] }>($, overviewArgv(enginePath($.plugin.root)));
  if (result.ok) {
    await update($, skillsAtom, () => result.data.skills);
  } else {
    await update($, messageAtom, () => result.message);
  }
}

async function change($: EngineInterface, argv: string[], done: string): Promise<void> {
  const result = await engine($, argv);
  await update($, messageAtom, () => (result.ok ? done : result.message));
  await refresh($);
}

async function openPane($: EngineInterface) {
  await update($, messageAtom, () => '');
  await refresh($);
  return $.ui.open({ id: PANE, title: TITLE });
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'skill-settings',
      description: 'Show your customized skills and their settings in a panel',
    });
    await $.tool.register({
      name: TOOL,
      description:
        "Opens skill-customizer's settings panel beside the chat, where the user can change the settings of every customized skill. Use it when the user's chosen screen is the panel.",
    });
    return next(e);
  });

  on('command.run', { command: 'skill-settings' }, async ($) => {
    const opened = await openPane($);
    return {
      text: opened.isPlaced
        ? 'Skill settings are open beside the chat.'
        : "The panel can't be shown in this session (it needs Claude Code's terminal, desktop app or VS Code). Ask Claude for /skill-customizer:customize settings to use the settings page instead.",
    };
  });

  on('tool.call', { tool: 'mcp__skill-customizer__open_settings_panel' }, async ($) => {
    const opened = await openPane($);
    return {
      result: opened.isPlaced
        ? 'The settings panel is open beside the chat. The user changes values there; run `settings get <skill>` before relying on a value.'
        : `The panel could not be shown (${opened.reason}). Open the settings page instead (\`serve\`).`,
    };
  }).catch(() => ({
    result: 'The settings panel failed to open. Open the settings page instead (`serve`).',
  }));

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Select, Input } = $.ui.resolve(e);
    const skills = await read($, skillsAtom);
    const message = await read($, messageAtom);
    const engineFile = enginePath($.plugin.root);

    const set = (ref: PanelSkillRef, key: string, value: string | boolean) =>
      void change($, setArgv(engineFile, ref, key, value), `Saved ${ref.name}: ${key}`);

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text dimColor>Changes apply the next time each skill runs.</Text>
          <Button key="refresh" dimColor onPress={() => void refresh($)}>
            Refresh
          </Button>
        </Box>
        {message !== '' && <Text color="warning">{message}</Text>}
        {skills.length === 0 && (
          <Text dimColor>No customized skills yet. Run /skill-customizer:customize with a skill's name.</Text>
        )}
        {skills.map((skill) => {
          const note = updateNote(skill);
          const ref = skill.skill;
          return (
            <Box key={controlKey(ref, 'card')} flexDirection="column" borderStyle="round" paddingX={1}>
              <Text bold>
                {ref.name} <Text dimColor>{scopeLabel(ref)}</Text>
              </Text>
              {note && <Text color="warning">{note}</Text>}
              {skill.invalid && <Text color="error">settings.yaml has problems: {skill.invalid.join('; ')}</Text>}
              {!skill.settings && <Text dimColor>No settings yet, only text changes.</Text>}
              {(skill.settings ?? []).map((setting) => {
                const value = skill.values?.[setting.key];
                const key = controlKey(ref, setting.key);
                return (
                  <Box key={key + '|row'} flexDirection="column" marginTop={1}>
                    {setting.type === 'boolean' && (
                      <Button key={key} onPress={() => set(ref, setting.key, value !== true)}>
                        {setting.description}: {value === true ? 'on' : 'off'}
                      </Button>
                    )}
                    {setting.type === 'enum' && (
                      <Select
                        key={key}
                        label={setting.description}
                        options={setting.options.map((o) => ({ value: o.value }))}
                        value={String(value)}
                        onSelect={(picked) => set(ref, setting.key, picked)}
                      />
                    )}
                    {setting.type === 'integer' && (
                      <Input
                        key={key}
                        label={`${setting.description} (${setting.min}–${setting.max})`}
                        value={String(value)}
                        submitLabel="save"
                        onSubmit={(typed) => set(ref, setting.key, typed.trim())}
                      />
                    )}
                    <Text dimColor>{effectOf(setting, value)}</Text>
                  </Box>
                );
              })}
              {skill.settings && (
                <Box marginTop={1}>
                  <Button
                    key={controlKey(ref, 'reset')}
                    dimColor
                    onPress={() => void change($, resetArgv(engineFile, ref), `Reset ${ref.name} to defaults`)}
                  >
                    Reset to defaults
                  </Button>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  });
};
