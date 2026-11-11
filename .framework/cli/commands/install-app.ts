/**
 * The RegistrationConfig interface defines the configuration options for user registration in the application. It allows customization of registration behavior, including role assignment and account strategies.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:registrationconfig:interface" type="interface" identity="RegistrationConfig" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Manifest-declared registration options for an app"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the manifest.json registration block shape: enabled, default_role, redirect_path, account_strategy, target_account, parent_account, default_workspace_name, allow_domain_join"]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files="spine.config.json"]
// CIL[DOC-CONTRACT inputs="manifest.json fields" outputs="typed registration config" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Field bag consumed by updateRegistrationConfig and mirrored into apps.config.registration" notable_decisions="parent_account stamps parent_id on accounts created via the 'new' strategy"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface RegistrationConfig {
  enabled: boolean
  default_role: string
  redirect_path: string
  account_strategy?: 'existing' | 'new' | 'choice'
  target_account?: string
  /** Account slug that becomes parent_id for accounts created via the 'new'
      strategy — e.g. 'spine-system' gives staff hierarchical visibility. */
  parent_account?: string
  /** When true, registration skips the personal/company choice and
      auto-names the workspace from the user's name/email. */
  default_workspace_name?: boolean
  allow_domain_join?: boolean
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:registrationconfig:interface"]
/**
 * The SpineConfig interface defines the configuration structure for application registration and role management within the CLI framework. It allows for flexible configuration of applications, roles, and their associated settings.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:spineconfig:interface" type="interface" identity="SpineConfig" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Runtime shape of spine.config.json registration section"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the spine.config.json registration structure, including the per-app runtime entry (roles, default_role, path, enabled, account_strategy, target_account, parent_account, default_workspace_name, allow_domain_join)"]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files="spine.config.json,.framework/src/pages/auth/RegisterPage.tsx"]
// CIL[DOC-CONTRACT inputs="spine.config.json on disk" outputs="typed config object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Mirrors the runtime config the RegisterPage fetches and completeRegistration resolves via apps.config.registration" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface SpineConfig {
  registration?: {
    default_app?: string
    default_role?: string
    allow_url_override?: boolean
    default_app_by_role?: Record<string, string>
    apps?: Record<string, {
      roles: string[]
      default_role: string
      path: string
      enabled: boolean
      account_strategy: 'existing' | 'new' | 'choice'
      target_account?: string
      parent_account?: string
      default_workspace_name?: boolean
      allow_domain_join?: boolean
    }>
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:spineconfig:interface"]
/**
 * @module   install-app
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module handles the installation of applications by managing file operations and executing necessary migrations. It serves as a command-line interface (CLI) command that integrates with the Supabase client for database interactions. INVARIANT: The application must exist in the specified directory before installation can proceed.
 *
 * @seeAlso migrate.js (provides migration functionality).
 * @seeAlso supabase-js (used for database interactions).
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="The RegistrationConfig interface defines the configuration options for user registration in the application."]
// CIL[DOC-RESPONSIBILITY responsibility="The RegistrationConfig interface defines the configuration options for user registration in the application. It allows customization of registration behavior, including role assignment and account strategies."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The RegistrationConfig interface defines the configuration options for user registration in the application. It allows customization of registration behavior, including role assignment and account strategies." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]












// CIL[DOC-MACRO purpose="RegistrationConfig interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the RegistrationConfig interface."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the RegistrationConfig interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='The RegistrationConfig interface defines the configuration options for user registration in the application.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="The SpineConfig interface defines the configuration structure for application registration and role management within the CLI framework."]
// CIL[DOC-RESPONSIBILITY responsibility="The SpineConfig interface defines the configuration structure for application registration and role management within the CLI framework. It allows for flexible configuration of applications, roles, and their associated settings."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The SpineConfig interface defines the configuration structure for application registration and role management within the CLI framework. It allows for flexible configuration of applications, roles, and their associated settings." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-MACRO purpose="SpineConfig interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the SpineConfig interface."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the SpineConfig interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='The SpineConfig interface defines the configuration structure for application registration and role management within the CLI framework.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="This module handles the installation of applications by managing file operations and executing necessary migrations."]
// CIL[DOC-RESPONSIBILITY responsibility="This module handles the installation of applications by managing file operations and executing necessary migrations. It serves as a command-line interface (CLI) command that integrates with the Supabase client for database interactions. INVARIANT: The application must exist in the specified directory before installation can proceed."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files="migrate.js (provides migration functionality).,supabase-js (used for database interactions)."]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="This module handles the installation of applications by managing file operations and executing necessary migrations. It serves as a command-line interface (CLI) command that integrates with the Supabase client for database interactions. INVARIANT: The application must exist in the specified directory before installation can proceed." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import type { Command } from 'commander'
import { existsSync, readFileSync, mkdirSync, cpSync, writeFileSync, realpathSync, statSync, readdirSync, rmSync } from 'fs'
import { resolve, dirname, join, basename, isAbsolute, sep } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import * as readline from 'readline'
import { createClient } from '@supabase/supabase-js'
import { runMigrations } from './migrate.js'
import { validateAppStructure } from './validate-app.js'
import { guardUpdateApp } from '../lib/update-app-guard.js'
import { generateValidationSchema } from '../../functions/_shared/schema-utils.ts'
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='This module handles the installation of applications by managing file operations and executing necessary migrations.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="__filename is a constant that holds the resolved path of the current module's file URL."]
// CIL[DOC-RESPONSIBILITY responsibility="__filename is a constant that holds the resolved path of the current module's file URL. It exists to provide a reliable reference to the file's location in the filesystem."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none dependencies="fileURLToPath"]
// CIL[DOC-MICRO logic_summary="__filename is a constant that holds the resolved path of the current module's file URL. It exists to provide a reliable reference to the file's location in the filesystem." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * __filename is a constant that holds the resolved path of the current module's file URL. It exists to provide a reliable reference to the file's location in the filesystem.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       fileURLToPath
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="__filename constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the __filename constant."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the __filename constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __filename = fileURLToPath(import.meta.url)
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:__filename:constant"]
// CIL[DOC-MACRO purpose="__filename constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the __filename constant."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the __filename constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='__filename is a constant that holds the resolved path of the current module's file URL.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="__dirname is a constant that holds the directory name of the current module, allowing for relative path resolution."]
// CIL[DOC-RESPONSIBILITY responsibility="__dirname is a constant that holds the directory name of the current module, allowing for relative path resolution. It exists to facilitate file operations within the module's directory context."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none dependencies="dirname"]
// CIL[DOC-MICRO logic_summary="__dirname is a constant that holds the directory name of the current module, allowing for relative path resolution. It exists to facilitate file operations within the module's directory context." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * __dirname is a constant that holds the directory name of the current module, allowing for relative path resolution. It exists to facilitate file operations within the module's directory context.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       dirname
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="__dirname constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the __dirname constant."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the __dirname constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __dirname = dirname(__filename)
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:__dirname:constant"]
// CIL[DOC-MACRO purpose="__dirname constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the __dirname constant."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the __dirname constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='__dirname is a constant that holds the directory name of the current module, allowing for relative path resolution.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="PROJECT_ROOT holds the current working directory of the process."]
// CIL[DOC-RESPONSIBILITY responsibility="PROJECT_ROOT holds the current working directory of the process. It is used to determine the base path for file operations within the application."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="PROJECT_ROOT holds the current working directory of the process. It is used to determine the base path for file operations within the application." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * PROJECT_ROOT holds the current working directory of the process. It is used to determine the base path for file operations within the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:project_root:constant" type="constant" identity="PROJECT_ROOT" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="PROJECT_ROOT constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the PROJECT_ROOT constant."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the PROJECT_ROOT constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const PROJECT_ROOT = process.cwd()
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:project_root:constant"]
// CIL[DOC-MACRO purpose="PROJECT_ROOT constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the PROJECT_ROOT constant."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the PROJECT_ROOT constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='PROJECT_ROOT holds the current working directory of the process.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="SPINE_CONFIG_PATH defines the path to the spine configuration file, which is essential for the application's setup process."]
// CIL[DOC-RESPONSIBILITY responsibility="SPINE_CONFIG_PATH defines the path to the spine configuration file, which is essential for the application's setup process. This constant ensures that the application can locate the configuration file reliably."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none dependencies="join"]
// CIL[DOC-MICRO logic_summary="SPINE_CONFIG_PATH defines the path to the spine configuration file, which is essential for the application's setup process. This constant ensures that the application can locate the configuration file reliably." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * SPINE_CONFIG_PATH defines the path to the spine configuration file, which is essential for the application's setup process. This constant ensures that the application can locate the configuration file reliably.
 *
 * @sideEffects none
 * @stability   stable
 * @calls       join
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:spine_config_path:constant" type="constant" identity="SPINE_CONFIG_PATH" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="SPINE_CONFIG_PATH constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the SPINE_CONFIG_PATH constant."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the SPINE_CONFIG_PATH constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const SPINE_CONFIG_PATH = join(PROJECT_ROOT, 'spine.config.json')
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:spine_config_path:constant"]
// CIL[DOC-MACRO purpose="SPINE_CONFIG_PATH constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the SPINE_CONFIG_PATH constant."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the SPINE_CONFIG_PATH constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-VECTOR type="context" content="purpose='SPINE_CONFIG_PATH defines the path to the spine configuration file, which is essential for the application's setup process.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:appcopyentries:constant" type="constant" identity="APP_COPY_ENTRIES" parent="none"]
// CIL[DOC-MACRO purpose="Single allowlist of package entries copied into custom/apps/<slug>/ on install and update"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the shared copy allowlist so install-app and update-app cannot drift apart"]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="readonly string[] of top-level package entries" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Union of both commands' previous lists plus entries real apps ship (lib/views/docs/installer/mcp/migrations/tests/standalone.config.json); 'agent' is handled separately by syncAppAgentAssets" notable_decisions="['shared_allowlist_prevents_drift','agent_staged_not_copied_verbatim']"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const APP_COPY_ENTRIES: readonly string[] = [
  'index.tsx', 'manifest.json', 'package.json', 'standalone.config.json',
  'pages', 'components', 'hooks', 'utils', 'lib', 'views', 'docs',
  'functions', 'api', 'seed', 'public', 'installer', 'mcp',
  'migrations', 'migrations-archive', 'tests', 'agent', 'decisions',
]
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:appcopyentries:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:agentskillprefixre:constant" type="constant" identity="AGENT_SKILL_PREFIX_RE" parent="none"]
// CIL[DOC-MACRO purpose="Validation regex for manifest agent.skill_prefix"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the single source of truth for the skill-prefix rule shared by install and validate paths"]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="RegExp matching 1-8 char lowercase-alphanumeric prefixes starting with a letter" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="/^[a-z][a-z0-9]{0,7}$/ — letter first, then up to 7 lowercase letters or digits" notable_decisions="['exported_for_shared_use']"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const AGENT_SKILL_PREFIX_RE = /^[a-z][a-z0-9]{0,7}$/
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:agentskillprefixre:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:syncappagentassets:function" type="function" identity="syncAppAgentAssets" parent="none"]
// CIL[DOC-MACRO purpose="Sync an installed app's staged agent assets (agent/skills, agent/instructions) to their live locations"]
// CIL[DOC-RESPONSIBILITY responsibility="Copy agent/skills/<prefix>_* to custom/.devin/skills/ and agent/instructions to the app's src/instructions/, enforcing the manifest-declared skill prefix"]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts,.framework/cli/lib/project-files.ts"]
// CIL[DOC-CONTRACT inputs="appDir (installed app dir), appSlug" outputs="void" errors="Throws when agent/skills exists without manifest.agent.skill_prefix, a dir violates <prefix>_ naming, or SKILL.md name mismatches its dir" side_effects="writes custom/.devin/skills and app src/instructions"]
// CIL[DOC-MICRO logic_summary="No-op without an agent/ dir; requires manifest.agent.skill_prefix /^[a-z][a-z0-9]{0,7}$/ when skills are staged; fails on cross-app prefix collisions by scanning installed manifests; copies instructions to src/instructions" notable_decisions="['fail_closed_on_missing_prefix','prefix_scoped_ownership']"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function syncAppAgentAssets(appDir: string, appSlug: string): void {
  const agentDir = join(appDir, 'agent')
  if (!existsSync(agentDir)) return

  const stagedSkills = join(agentDir, 'skills')
  const stagedInstructions = join(agentDir, 'instructions')
  const hasSkills = existsSync(stagedSkills)
  const hasInstructions = existsSync(stagedInstructions)
  if (!hasSkills && !hasInstructions) return

  const manifest: Record<string, any> = JSON.parse(readFileSync(join(appDir, 'manifest.json'), 'utf8'))
  const prefix = manifest.agent?.skill_prefix

  if (hasSkills) {
    if (typeof prefix !== 'string' || !AGENT_SKILL_PREFIX_RE.test(prefix)) {
      throw new Error(`manifest.json agent.skill_prefix for "${appSlug}" is required (^[a-z][a-z0-9]{0,7}$) when the package ships agent/skills/`)
    }

    for (const other of readdirSync(join(PROJECT_ROOT, 'custom', 'apps'), { withFileTypes: true })) {
      if (!other.isDirectory() || other.name === appSlug) continue
      const otherManifest = join(PROJECT_ROOT, 'custom', 'apps', other.name, 'manifest.json')
      try {
        const m = JSON.parse(readFileSync(otherManifest, 'utf8'))
        if (m.agent?.skill_prefix === prefix) {
          throw new Error(`skill_prefix "${prefix}" is already used by app "${other.name}" — prefixes must be unique across installed apps`)
        }
      } catch (e: any) {
        if (e.message?.includes('skill_prefix')) throw e
      }
    }

    const skillsDest = join(PROJECT_ROOT, 'custom', '.devin', 'skills')
    for (const dir of readdirSync(stagedSkills, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      if (!dir.name.startsWith(`${prefix}_`)) {
        throw new Error(`agent/skills/${dir.name} does not match the declared prefix "${prefix}_"`)
      }
      const skillFile = join(stagedSkills, dir.name, 'SKILL.md')
      if (!existsSync(skillFile)) {
        throw new Error(`agent/skills/${dir.name} is missing SKILL.md`)
      }
      const nameMatch = /^name:\s*(.+)$/m.exec(readFileSync(skillFile, 'utf8'))
      if (!nameMatch || nameMatch[1].trim() !== dir.name) {
        throw new Error(`agent/skills/${dir.name}/SKILL.md name field must equal its directory name "${dir.name}"`)
      }
      cpSync(join(stagedSkills, dir.name), join(skillsDest, dir.name), { recursive: true })
      console.log(`    Skill installed: custom/.devin/skills/${dir.name}`)
    }
  }

  if (hasInstructions) {
    const instrDest = join(appDir, 'src', 'instructions')
    mkdirSync(instrDest, { recursive: true })
    cpSync(stagedInstructions, instrDest, { recursive: true })
    console.log(`    Instructions installed: custom/apps/${appSlug}/src/instructions/`)
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:syncappagentassets:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:removeappagentskills:function" type="function" identity="removeAppAgentSkills" parent="none"]
// CIL[DOC-MACRO purpose="Remove an app's prefix-scoped skills from custom/.devin/skills on uninstall"]
// CIL[DOC-RESPONSIBILITY responsibility="Delete only the skill dirs owned by the uninstalled app's declared skill_prefix"]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="appDir, appSlug" outputs="void" errors="none" side_effects="removes custom/.devin/skills/<prefix>_* dirs"]
// CIL[DOC-MICRO logic_summary="Reads manifest.agent.skill_prefix from the app dir before deletion; globs <prefix>_* dirs and removes them; never touches unowned dirs" notable_decisions="['prefix_glob_scoped_removal']"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function removeAppAgentSkills(appDir: string, appSlug: string): void {
  try {
    const manifest: Record<string, any> = JSON.parse(readFileSync(join(appDir, 'manifest.json'), 'utf8'))
    const prefix = manifest.agent?.skill_prefix
    if (typeof prefix !== 'string' || !prefix) return
    const skillsDir = join(PROJECT_ROOT, 'custom', '.devin', 'skills')
    if (!existsSync(skillsDir)) return
    for (const dir of readdirSync(skillsDir, { withFileTypes: true })) {
      if (dir.isDirectory() && dir.name.startsWith(`${prefix}_`)) {
        rmSync(join(skillsDir, dir.name), { recursive: true, force: true })
        console.log(`  ✓ Removed skill custom/.devin/skills/${dir.name}`)
      }
    }
  } catch {
    console.log(`  ○ No agent.skill_prefix for "${appSlug}" — no skills to remove`)
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:removeappagentskills:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:islocalpackagespec:function" type="function" identity="isLocalPackageSpec" parent="none"]
// CIL[DOC-MACRO purpose="Detect package specs that resolve to a local path instead of an npm registry name"]
// CIL[DOC-RESPONSIBILITY responsibility="Return true for file:, ./, ../, / and *.tgz specs so commands can skip registry-only syntax like @latest"]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="packageName: string (the CLI <package> argument)" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Path-shaped specs (file:, dot-relative, absolute, .tgz) are local; everything else is a registry spec" notable_decisions="['local_specs_have_no_version_tag']"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function isLocalPackageSpec(packageName: string): boolean {
  return packageName.startsWith('file:')
    || packageName.startsWith('.')
    || packageName.startsWith('/')
    || packageName.endsWith('.tgz')
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:islocalpackagespec:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:resolvepackagedirname:function" type="function" identity="resolvePackageDirName" parent="none"]
// CIL[DOC-MACRO purpose="Resolve the node_modules directory name an install spec lands under"]
// CIL[DOC-RESPONSIBILITY responsibility="Map install-app/update-app/uninstall-app <package> args — registry names (plain or scoped), tarball paths, and file:/path dirs — to the name npm uses for node_modules/<name>"]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="packageName: string" outputs="npm package name (may be scoped, e.g. @scope/name)" errors="throws if a tarball or directory spec has no readable package.json" side_effects="execSync tar for .tgz specs"]
// CIL[DOC-MICRO logic_summary="Tarballs yield their embedded package/package.json name via tar -xOf; file:/path and relative/absolute dirs read package.json directly; registry specs strip only the trailing @version so scoped names survive" notable_decisions="['tarball_name_comes_from_the_package_not_the_filename','split_on_last_at_preserves_scopes']"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function resolvePackageDirName(packageName: string): string {
  let spec = packageName
  if (spec.startsWith('file:')) spec = spec.slice(5)
  if (spec.endsWith('.tgz')) {
    const json = execSync(`tar -xOf "${spec}" package/package.json`, { cwd: PROJECT_ROOT, encoding: 'utf8' })
    return JSON.parse(json).name
  }
  if (spec.startsWith('.') || spec.startsWith('/')) {
    return JSON.parse(readFileSync(join(PROJECT_ROOT, spec, 'package.json'), 'utf8')).name
  }
  return packageName.replace(/@[^@/]+$/, '')
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:resolvepackagedirname:function"]

// CIL[DOC-MACRO purpose="Command registration and installation handler for Spine Framework apps."]
// CIL[DOC-RESPONSIBILITY responsibility="Registers a command to install a Spine Framework app from npm and handles the installation process, including file copying and database migrations. This function ensures that the app is properly set up within the project environment."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="program: Command (required) — the command program instance to register the install-app command." outputs="Promise<void>" errors="Error — if the package is not found at the expected path." side_effects="Installs npm packages, creates directories, copies files, and potentially modifies the database. dependencies="execSync, existsSync, mkdirSync, cpSync, runMigrations, seedApp"]
// CIL[DOC-MICRO logic_summary="Executes npm install, manages file copying, runs database migrations, and aborts before seeding when migrations throw or report failures." notable_decisions="Migration failures abort the install; --no-seed skips all DB work; without credentials only an explicit --no-seed install may proceed."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Registers a command to install a Spine Framework app from npm and handles the installation process, including file copying and database migrations. This function ensures that the app is properly set up within the project environment.
 *
 * @macro       Command registration and installation handler for Spine Framework apps.
 * @micro       Executes npm install, manages file copying, and runs database migrations based on the installation outcome.
 * @inputSpec
 *   program: Command (required) — the command program instance to register the install-app command.
 * @outputSpec  Promise<void>
 * @throws      Error — if the package is not found at the expected path.
 * @sideEffects Installs npm packages, creates directories, copies files, and potentially modifies the database.
 * @stability   stable
 * @calls       execSync, existsSync, mkdirSync, cpSync, runMigrations, seedApp
 * @errorHandling Logs migration errors but continues execution.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:registerinstallappcommands:function" type="function" identity="registerInstallAppCommands" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Register app installation, manifest synchronization, and local seeding commands with fail-closed execution."]
// CIL[DOC-RESPONSIBILITY responsibility="Register app installation, manifest synchronization, and local seeding commands with fail-closed execution."]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files=".framework/cli/commands/migrate.ts,spine.config.json"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void" errors="Action errors exit nonzero instead of reporting a successful incomplete installation." side_effects="Registers CLI actions; invoked actions may install packages, copy files, migrate, seed, and synchronize config."]
// CIL[DOC-MICRO logic_summary="Register app installation, manifest synchronization, and local seeding commands with fail-closed execution; install-app and seed-app accept --reconcile-owned-types to interactively update manifest-owned types whose DB design_schema drifted from the seed." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function registerInstallAppCommands(program: Command) {
  
  program
    .command('install-app <package>')
    .description('Install a Spine Framework app from npm')
    .option('--no-seed', 'Skip seeding types and roles into the database')
    .option('--reconcile-owned-types', 'Prompt to update manifest-owned types whose DB design_schema differs from the seed')
    .action(async (packageName: string, opts) => {
      console.log(`\nInstalling app: ${packageName}\n`)

      loadEnv()

      try {
        
        console.log(`  Installing ${packageName} via npm...`)
        execSync(`npm install ${packageName} --save`, {
          cwd: PROJECT_ROOT,
          stdio: 'inherit',
        })
        console.log('  ✓ npm install complete')

        
        const pkgSlug = resolvePackageDirName(packageName)
        const pkgPath = join(PROJECT_ROOT, 'node_modules', pkgSlug)

        if (!existsSync(pkgPath)) {
          throw new Error(`Package not found at ${pkgPath}`)
        }

        console.log(`  Package path: ${pkgPath}`)
        
        
        const appSlug = resolveAppSlug(pkgPath, pkgSlug)
        console.log(`  App slug: ${appSlug}`)

        
        const appDest = join(PROJECT_ROOT, 'custom/apps', appSlug)
        const isReinstall = existsSync(appDest)
        if (!isReinstall) {
          mkdirSync(appDest, { recursive: true })
        }

        
        console.log(`  Copying files from ${pkgPath} to ${appDest}`)

        for (const entry of APP_COPY_ENTRIES) {
          const src = join(pkgPath, entry)
          if (!existsSync(src)) continue

          
          if (entry === 'manifest.json' && isReinstall) {
            console.log(`    Preserving local manifest.json (use update-db-app to sync changes)`)
            continue
          }

          console.log(`    Copying ${entry}`)
          cpSync(src, join(appDest, entry), { recursive: true })
        }
        console.log(`  ✓ App files copied to custom/apps/${appSlug}/`)

        
        syncAppAgentAssets(appDest, appSlug)

        
        console.log('  Running migrations...')
        const migrateResult = await runMigrations({ frameworkOnly: false })
        if (migrateResult === null) {
          if (opts.seed !== false) {
            throw new Error('SUPABASE_URL or SUPABASE_DB_PASSWORD not set — cannot run migrations or seed (rerun with --no-seed to install files only)')
          }
          console.log('  ○ Skipping migrations (SUPABASE_DB_PASSWORD not set)')
        } else if (migrateResult.applied > 0) {
          console.log(`  ✓ Migrations: ${migrateResult.applied} applied, ${migrateResult.skipped} skipped`)
        } else {
          console.log(`  ✓ Migrations: up to date (${migrateResult.skipped} already applied)`)
        }
        if (migrateResult && migrateResult.failed > 0) {
          throw new Error(`${migrateResult.failed} migration(s) failed — aborting install before seed`)
        }

        
        if (opts.seed !== false) {
          await seedApp(appDest, appSlug, SPINE_CONFIG_PATH, { reconcileOwnedTypes: opts.reconcileOwnedTypes === true })
        } else {
          console.log('  ○ Seed skipped (--no-seed)')
        }

        
        const manifestPath = join(appDest, 'manifest.json')
        let manifest: Record<string, any> = {}
        try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) } catch {}
        if (opts.seed === false && manifest.registration && typeof manifest.registration.enabled === 'boolean') {
          updateRegistrationConfig(appSlug, manifest.registration, manifest.required_roles ?? [], SPINE_CONFIG_PATH, manifest.route_prefix ?? '/')
        }

        let installedVersion = 'unknown'
        try { installedVersion = JSON.parse(readFileSync(join(pkgPath, 'package.json'), 'utf8')).version ?? 'unknown' } catch {}

        console.log(`\n✅ ${appSlug} installed successfully! (${pkgSlug}@${installedVersion})\n`)
        console.log('Next: npm run assemble && netlify dev\n')

      } catch (err: any) {
        console.error(`\n❌ Install failed: ${err.message}`)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }
    })

  
  program
    .command('uninstall-app <package>')
    .description('Remove an installed Spine Framework app')
    .option('--keep-data', 'Keep seeded types and roles in the database', false)
    .action(async (packageName: string, opts) => {
      console.log(`\nUninstalling app: ${packageName}\n`)
      loadEnv()

      const pkgSlug = resolvePackageDirName(packageName)
      const pkgPath = join(PROJECT_ROOT, 'node_modules', pkgSlug)
      const appSlug = resolveAppSlug(pkgPath, pkgSlug)
      const appDir = join(PROJECT_ROOT, 'custom/apps', appSlug)

      try {
        if (existsSync(appDir)) {
          removeAppAgentSkills(appDir, appSlug)
          rmSync(appDir, { recursive: true, force: true })
          console.log(`  ✓ Removed custom/apps/${appSlug}/`)
        } else {
          console.log(`  ○ custom/apps/${appSlug}/ not found, nothing to remove`)
        }

        execSync(`npm uninstall ${pkgSlug}`, { cwd: PROJECT_ROOT, stdio: 'inherit' })
        console.log(`  ✓ npm uninstall complete`)

        console.log(`\n✅ ${appSlug} uninstalled.\n`)
      } catch (err: any) {
        console.error(`\n❌ Uninstall failed: ${err.message}`)
        process.exit(1)
      }
    })

  
  program
    .command('update-app <package>')
    .description('Update an installed Spine Framework app to a newer version')
    .option('--force', 'Overwrite local modifications after writing a backup to .spine/backups/', false)
    .action(async (packageName: string, opts: { force?: boolean }) => {
      console.log(`\nUpdating app: ${packageName}\n`)
      loadEnv()

      try {
        // Guard first — before npm install changes the lockfile or the
        // package. The baseline is the currently-installed version.
        const prePkgSlug = resolvePackageDirName(packageName)
        const prePkgPath = join(PROJECT_ROOT, 'node_modules', prePkgSlug)
        const preAppSlug = resolveAppSlug(prePkgPath, prePkgSlug)
        const preAppDest = join(PROJECT_ROOT, 'custom/apps', preAppSlug)

        if (existsSync(preAppDest)) {
          const outcome = guardUpdateApp({
            projectRoot: PROJECT_ROOT,
            pkgDirName: prePkgSlug,
            appSlug: preAppSlug,
            appDest: preAppDest,
            copyEntries: APP_COPY_ENTRIES,
            force: opts.force === true,
          })
          if (!outcome.proceed) {
            console.error(`\n❌ Update aborted — ${outcome.baseline}\n`)
            process.exit(1)
          }
        } else {
          console.log(`  ○ custom/apps/${preAppSlug}/ not found — nothing local to protect`)
        }

        execSync(`npm install ${isLocalPackageSpec(packageName) ? packageName : `${packageName}@latest`} --save`, {
          cwd: PROJECT_ROOT,
          stdio: 'inherit',
        })

        const pkgSlug = resolvePackageDirName(packageName)
        const pkgPath = join(PROJECT_ROOT, 'node_modules', pkgSlug)
        const appSlug = resolveAppSlug(pkgPath, pkgSlug)
        const appDest = join(PROJECT_ROOT, 'custom/apps', appSlug)

        if (!existsSync(appDest)) {
          mkdirSync(appDest, { recursive: true })
        }

        for (const entry of APP_COPY_ENTRIES) {
          const src = join(pkgPath, entry)
          if (existsSync(src)) {
            if (entry === 'manifest.json' && existsSync(join(appDest, 'manifest.json'))) continue
            cpSync(src, join(appDest, entry), { recursive: true })
          }
        }

        syncAppAgentAssets(appDest, appSlug)

        
        const manifestPath = join(appDest, 'manifest.json')
        let manifest: Record<string, any> = {}
        try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) } catch {}
        if (manifest.registration && typeof manifest.registration.enabled === 'boolean') {
          updateRegistrationConfig(appSlug, manifest.registration, manifest.required_roles ?? [], SPINE_CONFIG_PATH, manifest.route_prefix ?? '/')
        }

        let updatedVersion = 'unknown'
        try { updatedVersion = JSON.parse(readFileSync(join(pkgPath, 'package.json'), 'utf8')).version ?? 'unknown' } catch {}

        console.log(`\n✅ ${appSlug} updated! (${pkgSlug}@${updatedVersion})\n`)
      } catch (err: any) {
        console.error(`\n❌ Update failed: ${err.message}`)
        process.exit(1)
      }
    })

  
  program
    .command('update-db-app <slug>')
    .description('Sync local manifest.json changes to the database (no npm, no file changes)')
    .action(async (slug: string) => {
      console.log(`\nSyncing manifest to DB for: ${slug}\n`)
      loadEnv()

      const appDir = join(PROJECT_ROOT, 'custom/apps', slug)
      const manifestPath = join(appDir, 'manifest.json')

      if (!existsSync(manifestPath)) {
        console.error(`❌ No app found at custom/apps/${slug}/manifest.json`)
        console.error(`   Run install-app first: npx spine-framework install-app spine-framework-${slug}`)
        process.exit(1)
      }

      const supabaseUrl = process.env.SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
        process.exit(1)
      }

      let manifest: Record<string, any>
      try {
        manifest = preflightAppInputs(appDir, slug, SPINE_CONFIG_PATH)
      } catch (err: any) {
        console.error(`❌ ${err.message}`)
        process.exit(1)
      }

      const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

      const { data: existingApp, error: existingErr } = await db
        .from('apps')
        .select('config')
        .eq('slug', slug)
        .maybeSingle()
      if (existingErr) {
        console.error(`❌ Failed to read existing app config: ${existingErr.message}`)
        process.exit(1)
      }
      if (existingApp?.config !== undefined && existingApp?.config !== null && !isPlainObject(existingApp.config)) {
        console.error(`❌ apps.config for ${slug} is not an object — refusing to merge`)
        process.exit(1)
      }

      const { data: appRow, error: appErr } = await db
        .from('apps')
        .upsert(
          appRowPayload(manifest, slug, existingApp?.config ?? undefined),
          { onConflict: 'slug' }
        )
        .select('id')
        .single()

      if (appErr || !appRow?.id) {
        console.error(`❌ Failed to update app row: ${appErr?.message ?? 'no id returned'}`)
        process.exit(1)
      }

      console.log(`  ✓ apps row updated (route_prefix: ${manifest.route_prefix ?? '/' + slug}, config: ${manifest.config ? 'synced' : 'none'})`)

      
      try {
        await syncAppRegistration(db, slug, manifest)
      } catch (err: any) {
        console.error(`❌ Registration sync failed: ${err.message}`)
        process.exit(1)
      }

      console.log(`\n✅ ${slug} DB synced from local manifest.\n`)
      console.log(`Next: npm run assemble && netlify dev\n`)
    })

  program
    .command('seed-app <slug>')
    .description('Run the manifest seed block for a local app (no npm, no file changes)')
    .option('--reconcile-owned-types', 'Prompt to update manifest-owned types whose DB design_schema differs from the seed')
    .action(async (slug: string, opts) => {
      console.log(`\nSeeding app: ${slug}\n`)
      loadEnv()

      const appDir = join(PROJECT_ROOT, 'custom/apps', slug)
      if (!existsSync(join(appDir, 'manifest.json'))) {
        console.error(`❌ No app found at custom/apps/${slug}/manifest.json`)
        process.exit(1)
      }

      try {
        await seedApp(appDir, slug, SPINE_CONFIG_PATH, { reconcileOwnedTypes: opts.reconcileOwnedTypes === true })
      } catch (err: any) {
        console.error(`\n❌ Seed failed: ${err.message}`)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }

      console.log(`\n✅ ${slug} seeded.\n`)
    })
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:registerinstallappcommands:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Registers a command to install a Spine Framework app from npm and handles the installation process, including file copying and database migrations.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Resolves the application slug from a given package path and package name."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolves the application slug from a given package path and package name. It attempts to read the slug from a manifest file, falling back to a modified package name if not found."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="pkgPath: string (required) — the file path to the package manifest.\\npkgName: string (required) — the name of the package to derive the slug from." outputs="string — the resolved application slug." errors="none" side_effects="file I/O dependencies="readFileSync, JSON.parse, join"]
// CIL[DOC-MICRO logic_summary="Resolves the application slug from a given package path and package name. It attempts to read the slug from a manifest file, falling back to a modified package name if not found." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Resolves the application slug from a given package path and package name. It attempts to read the slug from a manifest file, falling back to a modified package name if not found.
 *
 * @inputSpec
 *   pkgPath: string (required) — the file path to the package manifest.
 *   pkgName: string (required) — the name of the package to derive the slug from.
 * @outputSpec  string — the resolved application slug.
 * @sideEffects file I/O
 * @stability   stable
 * @calls       readFileSync, JSON.parse, join
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:resolveappslug:function" type="function" identity="resolveAppSlug" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="resolveAppSlug function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the resolveAppSlug function."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the resolveAppSlug function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function resolveAppSlug(pkgPath: string, pkgName: string): string {
  try {
    const manifest = JSON.parse(readFileSync(join(pkgPath, 'manifest.json'), 'utf8'))
    if (manifest.slug) return manifest.slug
  } catch {}
  
  const slug = pkgName.replace(/^spine-framework-/, '')
  return slug || pkgName // fallback to full name if replacement results in empty
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:resolveappslug:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Resolves the application slug from a given package path and package name.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Loads environment variables from a .env file located at the project root if it exists."]
// CIL[DOC-RESPONSIBILITY responsibility="Loads environment variables from a .env file located at the project root if it exists. This function ensures that environment variables are set in the process environment for the application to use."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="none" side_effects="Reads from the file system to load environment variables. dependencies="join, existsSync, readFileSync"]
// CIL[DOC-MICRO logic_summary="Loads environment variables from a .env file located at the project root if it exists. This function ensures that environment variables are set in the process environment for the application to use." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Loads environment variables from a .env file located at the project root if it exists. This function ensures that environment variables are set in the process environment for the application to use.
 *
 * @outputSpec  void
 * @sideEffects Reads from the file system to load environment variables.
 * @stability   stable
 * @calls       join, existsSync, readFileSync
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:loadenv:function" type="function" identity="loadEnv" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="loadEnv function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the loadEnv function."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the loadEnv function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function loadEnv() {
  const envPath = join(PROJECT_ROOT, '.env')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) process.env[key] = val
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:loadenv:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Loads environment variables from a .env file located at the project root if it exists.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Database seeding function for application setup."]
// CIL[DOC-RESPONSIBILITY responsibility="Seeds the application database with initial data based on the provided manifest file. It ensures that necessary environment variables are set and handles the upsertion of application details into the database."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="appDir: string (required) — the directory where the application files are located.\\nappSlug: string (required) — a unique identifier for the application." outputs="Promise<void>" errors="none" side_effects="Writes to the database and reads from the file system. dependencies="createClient, db.from, db.upsert, db.select, readFileSync, existsSync, join"]
// CIL[DOC-MICRO logic_summary="Validates the app structure, preloads declared seed files with root confinement, performs fail-closed upsert operations, and syncs registration policy to DB and spine.config.json." notable_decisions="throws on missing environment variables and database errors instead of warning and continuing."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Seeds the application database with initial data based on the provided manifest file. It ensures that necessary environment variables are set and handles the upsertion of application details into the database.
 *
 * @macro       Database seeding function for application setup.
 * @micro       Reads a manifest file to determine seed entries and performs upsert operations on the database.
 * @inputSpec
 *   appDir: string (required) — the directory where the application files are located.
 *   appSlug: string (required) — a unique identifier for the application.
 * @outputSpec  Promise<void>
 * @sideEffects Writes to the database and reads from the file system.
 * @stability   stable
 * @calls       createClient, db.from, db.upsert, db.select, readFileSync, existsSync, join
 * @errorHandling logs warnings for missing environment variables and database errors without throwing.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:seedapp:function" type="function" identity="seedApp" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Preflight source and config before seeding declared records, then synchronize one registration policy."]
// CIL[DOC-RESPONSIBILITY responsibility="Preflight source and config before seeding declared records, then synchronize one registration policy."]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files=".framework/cli/commands/validate-app.ts,.framework/functions/_shared/schema-utils.ts,spine.config.json"]
// CIL[DOC-CONTRACT inputs="appDir: string, appSlug: string, configPath: string defaults to SPINE_CONFIG_PATH, opts.reconcileOwnedTypes?: boolean" outputs="Promise<void>" errors="Throws for credentials, source/config validation, row writes, missing references, type design_schema conflicts with existing rows, invalid owned_types declarations, unknown pipeline stage_types, invalid notification recipients, or policy synchronization errors." side_effects="Reads source files, writes app seed records, optionally asks permission-patch and owned-type reconcile choices, and synchronizes local/server policy."]
// CIL[DOC-MICRO logic_summary="Preflight the app structure, manifest, registration block, and local config, preload declared seeds with root confinement while validating type design_schema and permission-patch rows and generating validation_schema on normalized copies, stable-sort prepared entries into dependency order (roles, types, link_types, actions, ai_agents, prompt_configs, pipelines, triggers; permissions_patch ranks just after types; unknown tables last in declared order), then upsert the app row with merged config, apply each seed entry fail-closed — types rows are read-then-compared so identical rows skip and differing rows throw unless reconciled via --reconcile-owned-types, pipeline stages are checked against public.actions and send_notification recipients against roles — and sync registration policy to DB and file" notable_decisions="All input validation happens before createClient so malformed manifests, seeds, or config produce zero DB clients or writes; declared seed entries are mandatory; legacy fallback and auto-added type_permissions files are optional but must be well-formed when present; types rows are never silently overwritten — a DB-vs-seed design_schema diff throws unless the manifest owns the slug and --reconcile-owned-types was passed; action and role slug lookups are fetched once per run and only when pipelines demand them"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function seedApp(
  appDir: string,
  appSlug: string,
  configPath: string = SPINE_CONFIG_PATH,
  opts: { reconcileOwnedTypes?: boolean } = {},
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to seed')
  }

  const reconcileOwnedTypes = opts.reconcileOwnedTypes === true
  const manifest = preflightAppInputs(appDir, appSlug, configPath)

  interface SeedEntry {
    file: string
    table: string
    conflict: string
    inject_app_id?: boolean
    ignore_duplicates?: boolean
    permissions_patch?: boolean
  }

  const declaredEntries: SeedEntry[] = Array.isArray(manifest.seed)
    ? manifest.seed.map((entry: SeedEntry) => ({ ...entry }))
    : []
  const declared = new Set<SeedEntry>(declaredEntries)

  const seedEntries: SeedEntry[] = Array.isArray(manifest.seed)
    ? declaredEntries
    : [

        { file: 'seed/roles.json',      table: 'roles',      conflict: 'slug' },
        { file: 'seed/types.json',       table: 'types',      conflict: 'kind,slug', inject_app_id: false },
        { file: 'seed/link-types.json',  table: 'link_types', conflict: 'app_id,slug' },
      ]


  const hasPermissionsPatch = seedEntries.some(e => e.permissions_patch)
  if (!hasPermissionsPatch) {
    seedEntries.push({
      file: 'seed/type_permissions.json',
      table: 'types',
      conflict: 'kind,slug',
      inject_app_id: false,
      permissions_patch: true,
    })
  }

  const prepared: { entry: SeedEntry; records: Record<string, any>[] }[] = []
  for (const entry of seedEntries) {
    const filePath = canonicalFileWithin(appDir, entry.file)
    if (!filePath) {
      if (declared.has(entry)) {
        throw new Error(`Declared seed file not found or escapes the app root: ${entry.file}`)
      }
      console.log(`  ○ ${entry.file} not found, skipping`)
      continue
    }

    let records: unknown
    try {
      records = JSON.parse(readFileSync(filePath, 'utf8'))
    } catch {
      throw new Error(`Could not parse seed file: ${entry.file}`)
    }
    if (!Array.isArray(records)) {
      throw new Error(`Seed file must contain a JSON array of records: ${entry.file}`)
    }
    for (const record of records) {
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        throw new Error(`Seed file contains a non-object record: ${entry.file}`)
      }
    }

    let preparedRecords = records as Record<string, any>[]
    if (entry.permissions_patch) {
      for (const record of preparedRecords) {
        validatePermissionsPatchRow(record, entry.file)
      }
    } else if (entry.table === 'types') {
      preparedRecords = preparedRecords.map(record => {
        if (!('design_schema' in record)) return { ...record }
        if (!isPlainObject(record.design_schema)) {
          const label = record.slug ?? record.name ?? JSON.stringify(record).slice(0, 40)
          throw new Error(`types seed "${label}": design_schema must be a non-null object`)
        }
        return { ...record, validation_schema: generateValidationSchema(record.design_schema) }
      })
    }
    prepared.push({ entry, records: preparedRecords })
  }

  // Deterministic dependency ordering — seeds apply in SEED_TABLE_ORDER rather
  // than manifest declaration order, so e.g. a trigger's pipeline_slug lookup
  // can never race its pipeline. permissions_patch ranks just after types (it
  // patches types rows) and unknown tables keep declared relative order last.
  // Array.prototype.sort is stable, so equal ranks preserve declaration order.
  prepared.sort((a, b) => seedTableRank(a.entry) - seedTableRank(b.entry))

  // Type slugs this app seeds (non-patch types entries) plus the conventional
  // seed/types.json — owned_types declarations resolve against this set, and
  // role slugs from this run's roles seeds backstop recipient validation.
  const seedTypeSlugs = new Set<string>()
  const seedRoleSlugs = new Set<string>()
  for (const { entry, records } of prepared) {
    const target = entry.table === 'types' && !entry.permissions_patch ? seedTypeSlugs
      : entry.table === 'roles' ? seedRoleSlugs
      : null
    if (!target) continue
    for (const record of records) {
      if (typeof record.slug === 'string' && record.slug) target.add(record.slug)
    }
  }
  const typesSeedPath = canonicalFileWithin(appDir, 'seed/types.json')
  if (typesSeedPath) {
    try {
      const extra: unknown = JSON.parse(readFileSync(typesSeedPath, 'utf8'))
      if (Array.isArray(extra)) {
        for (const row of extra) {
          if (row && typeof row === 'object' && typeof row.slug === 'string') seedTypeSlugs.add(row.slug)
        }
      }
    } catch { /* an undeclared malformed file is not this check's concern */ }
  }

  const ownedTypeSlugs = new Set<string>()
  if (reconcileOwnedTypes) {
    const owned = manifest.owned_types
    if (!Array.isArray(owned) || owned.length === 0) {
      throw new Error(`--reconcile-owned-types requires manifest.json to declare "owned_types" — a non-empty array of type slugs this app owns`)
    }
    for (const slug of owned) {
      if (!seedTypeSlugs.has(slug)) {
        throw new Error(`manifest.json owned_types declares "${slug}" but no record with that slug exists in the app's types seed (seed/types.json)`)
      }
      ownedTypeSlugs.add(slug)
    }
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: existingApp, error: existingErr } = await db
    .from('apps')
    .select('config')
    .eq('slug', appSlug)
    .maybeSingle()
  if (existingErr) {
    throw new Error(`Could not read existing app config for ${appSlug}: ${existingErr.message}`)
  }
  if (existingApp?.config !== undefined && existingApp?.config !== null && !isPlainObject(existingApp.config)) {
    throw new Error(`apps.config for ${appSlug} is not an object — refusing to merge`)
  }

  const { data: appRow, error: appErr } = await db
    .from('apps')
    .upsert(
      appRowPayload(manifest, appSlug, existingApp?.config ?? undefined),
      { onConflict: 'slug' }
    )
    .select('id')
    .single()

  if (appErr || !appRow?.id) {
    throw new Error(`Could not upsert app row for ${appSlug}: ${appErr?.message ?? 'no id returned'}`)
  }

  const appId = appRow.id
  console.log(`  ✓ App registered (id: ${appId}, config: ${manifest.config ? 'synced' : 'none'})`)

  // Lazily fetched once per run — stage_type and recipient lookups only happen
  // when a pipelines seed actually demands them.
  let cachedActionSlugs: Set<string> | null = null
  const getActionSlugs = async (): Promise<Set<string>> => {
    if (!cachedActionSlugs) {
      const { data, error } = await db.from('actions').select('slug')
      if (error) {
        throw new Error(`Could not read public.actions for pipeline stage validation: ${error.message}`)
      }
      cachedActionSlugs = new Set(
        (data ?? []).map((r: any) => r?.slug).filter((s: any) => typeof s === 'string')
      )
    }
    return cachedActionSlugs
  }
  let cachedRoleSlugs: Set<string> | null = null
  const getRoleSlugs = async (): Promise<Set<string>> => {
    if (!cachedRoleSlugs) {
      const { data, error } = await db.from('roles').select('slug')
      if (error) {
        throw new Error(`Could not read public.roles for recipient validation: ${error.message}`)
      }
      cachedRoleSlugs = new Set(
        (data ?? []).map((r: any) => r?.slug).filter((s: any) => typeof s === 'string')
      )
      // Roles seeded earlier in this same run are valid references even if the
      // read raced the write.
      for (const slug of seedRoleSlugs) cachedRoleSlugs.add(slug)
    }
    return cachedRoleSlugs
  }

  for (const { entry, records } of prepared) {
    if (records.length === 0) {
      console.log(`  ○ ${entry.file} is empty, skipping`)
      continue
    }


    if (entry.permissions_patch) {
      console.log(`  Patching record_permissions for ${records.length} type(s) from ${entry.file}...`)
      for (const record of records) {
        const { kind, slug, record_permissions: newPerms } = record


        const { data: existing, error: existingTypeErr } = await db
          .from('types')
          .select('id, design_schema')
          .eq('kind', kind)
          .eq('slug', slug)
          .maybeSingle()

        if (existingTypeErr) {
          throw new Error(`Could not read type ${kind}/${slug}: ${existingTypeErr.message}`)
        }
        if (!existing) {
          throw new Error(`Type ${kind}/${slug} not found in DB — cannot apply permissions patch (install the owning app first)`)
        }

        const existingSchema = (existing.design_schema ?? {}) as Record<string, any>
        const existingPerms = existingSchema.record_permissions ?? null


        if (JSON.stringify(existingPerms) === JSON.stringify(newPerms)) {
          console.log(`    ✓ ${kind}/${slug} record_permissions unchanged — skipped`)
          continue
        }


        console.log(`\n    Type: ${kind}/${slug}`)
        console.log(`    Existing record_permissions:`)
        console.log('    ' + JSON.stringify(existingPerms, null, 2).replace(/\n/g, '\n    '))
        console.log(`    New record_permissions:`)
        console.log('    ' + JSON.stringify(newPerms, null, 2).replace(/\n/g, '\n    '))

        const choice = await prompt('    Replace? [R]eplace / [K]eep  → ')
        if (choice.trim().toLowerCase() !== 'r') {
          console.log(`    ○ Kept existing`)
          continue
        }


        const mergedSchema = { ...existingSchema, record_permissions: newPerms }
        const { error: patchErr } = await db
          .from('types')
          .update({
            design_schema: mergedSchema,
            validation_schema: generateValidationSchema(mergedSchema),
          })
          .eq('id', existing.id)

        if (patchErr) {
          throw new Error(`Could not patch ${kind}/${slug}: ${patchErr.message}`)
        }
        console.log(`    ✓ ${kind}/${slug} record_permissions updated`)
      }
      console.log(`  ✓ type_permissions patch complete`)
      continue
    }


    const injectAppId = entry.inject_app_id !== false // default true
    console.log(`  Seeding ${records.length} record(s) from ${entry.file} → ${entry.table}...`)

    for (const record of records) {
      const row = injectAppId ? { ...record, app_id: appId } : { ...record }

      // Types are global (conflict kind,slug) — fetch the existing row first so
      // a drifted design_schema fails loudly instead of being silently skipped
      // by ignoreDuplicates. Identical rows skip cleanly; differing rows throw
      // unless the slug is manifest-owned and --reconcile-owned-types was set.
      if (entry.table === 'types') {
        const { data: existingType, error: typeReadErr } = await db
          .from('types')
          .select('id, design_schema')
          .eq('kind', row.kind)
          .eq('slug', row.slug)
          .maybeSingle()
        if (typeReadErr) {
          throw new Error(`types "${row.kind}/${row.slug}": could not read existing row: ${typeReadErr.message}`)
        }
        if (existingType) {
          if (canonicalJson(existingType.design_schema) === canonicalJson(row.design_schema)) {
            console.log(`    ✓ ${row.kind}/${row.slug} already seeded — identical`)
            continue
          }
          if (ownedTypeSlugs.has(row.slug)) {
            await reconcileOwnedType(db, existingType, row)
            continue
          }
          throw new Error(
            `Type conflict on ${row.kind}/${row.slug} (${entry.file}): the DB row's design_schema differs from the seed — ` +
            `refusing to overwrite. Inspect the diff and rerun with --reconcile-owned-types if this app owns the type.`
          )
        }
        // Absent — fall through to the upsert; ignoreDuplicates stays as the
        // race guard for a concurrent insert between the read and the write.
      }

      // Pipeline seeds are validated at install time so a bad stage_type or
      // notification recipient fails here, not at first trigger fire.
      if (entry.table === 'pipelines') {
        await validatePipelineSeedStages(row, entry.file, getActionSlugs, getRoleSlugs)
      }

      // Trigger seeds reference pipelines by slug — resolve to pipeline_id so
      // the trigger engine can dispatch. Pipelines must be seeded first.
      if (entry.table === 'triggers' && row.pipeline_slug && !row.pipeline_id) {
        const { data: pipeline, error: pipelineErr } = await db
          .from('pipelines')
          .select('id')
          .eq('slug', row.pipeline_slug)
          .eq('app_id', appId)
          .maybeSingle()
        if (pipelineErr) {
          throw new Error(`trigger "${row.name || row.slug}": could not resolve pipeline '${row.pipeline_slug}': ${pipelineErr.message}`)
        }
        if (!pipeline?.id) {
          throw new Error(`trigger "${row.name || row.slug}": pipeline '${row.pipeline_slug}' not found — seed pipelines first`)
        }
        row.pipeline_id = pipeline.id
        delete row.pipeline_slug
      }

      const { error } = await db
        .from(entry.table)
        .upsert(row, {
          onConflict: entry.conflict,
          ignoreDuplicates: entry.table === 'types' || entry.ignore_duplicates === true,
        })
      if (error) {
        const label = record.slug ?? record.name ?? JSON.stringify(record).slice(0, 40)
        throw new Error(`${entry.table} "${label}": ${error.message}`)
      }
    }

    console.log(`  ✓ ${entry.table} seeded`)
  }

  await syncAppRegistration(db, appSlug, manifest, configPath)
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:seedapp:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Seeds the application database with initial data based on the provided manifest file.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:canonicalfilewithin:function" type="function" identity="canonicalFileWithin" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Resolve a root-contained file path for manifest-referenced seed files"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the canonical path of an existing regular file inside the app root, or null"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/validate-app.ts"]
// CIL[DOC-CONTRACT inputs="appDir: string, relPath: string" outputs="string canonical path or null" errors="none" side_effects="reads filesystem metadata via realpathSync and statSync"]
// CIL[DOC-MICRO logic_summary="Rejects absolute paths, lexical escapes, symlink escapes, and non-file targets by canonicalizing app root and target with realpathSync; mirrors the reviewed validate-app helper" notable_decisions="local copy because the validate-app helper is module-private"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function canonicalFileWithin(appDir: string, relPath: string): string | null {
  try {
    if (isAbsolute(relPath)) return null
    const root = realpathSync(appDir)
    const lexical = resolve(root, relPath)
    if (lexical !== root && !lexical.startsWith(root + sep)) return null
    const canonical = realpathSync(lexical)
    if (canonical !== root && !canonical.startsWith(root + sep)) return null
    if (!statSync(canonical).isFile()) return null
    return canonical
  } catch {
    return null
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:canonicalfilewithin:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:isplainobject:function" type="function" identity="isPlainObject" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Narrow a value to a non-null non-array plain object"]
// CIL[DOC-RESPONSIBILITY responsibility="Return true only for JSON-object-shaped values, excluding null and arrays"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="v: any" outputs="boolean type guard for Record<string,any>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Checks typeof object while excluding null and Array.isArray" notable_decisions="used to validate manifest.config, registration blocks, seed rows, and stored apps.config before merging"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function isPlainObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:isplainobject:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:preflightappinputs:function" type="function" identity="preflightAppInputs" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Validate an app directory, manifest, registration block, and local config before any DB work"]
// CIL[DOC-RESPONSIBILITY responsibility="Run validateAppStructure, require slug match, check manifest.config and registration shapes, and preflight the local spine config — all before createClient"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/validate-app.ts,spine.config.json"]
// CIL[DOC-CONTRACT inputs="appDir: string, appSlug: string, configPath: string" outputs="parsed manifest Record<string,any>" errors="Throws on invalid app slug, invalid app structure, slug mismatch, non-object manifest.config, malformed registration block, or malformed local config" side_effects="reads manifest, seed files, and local config from disk"]
// CIL[DOC-MICRO logic_summary="Requires the app slug to match /^[a-z][a-z0-9-]*$/ before anything else, delegates structural checks to validateAppStructure, then enforces slug equality, object-typed manifest.config when non-null, a plain-object registration block with boolean enabled and required nonempty fields when enabled, and loads the local config to surface corruption early" notable_decisions="the local config is only read when the manifest declares a registration block, so data-only seeds never touch unrelated config; slug validation runs before all filesystem reads so hostile slugs like __proto__ can never reach config indexing"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function preflightAppInputs(appDir: string, appSlug: string, configPath: string): Record<string, any> {
  if (typeof appSlug !== 'string' || !/^[a-z][a-z0-9-]*$/.test(appSlug)) {
    throw new Error(`Invalid app slug "${appSlug}" — expected /^[a-z][a-z0-9-]*$/`)
  }

  validateAppStructure(appDir)

  const manifest: Record<string, any> = JSON.parse(readFileSync(join(appDir, 'manifest.json'), 'utf8'))
  if (manifest.slug !== appSlug) {
    throw new Error(`manifest.json slug "${manifest.slug}" does not match app slug "${appSlug}"`)
  }
  if (manifest.config !== undefined && manifest.config !== null && !isPlainObject(manifest.config)) {
    throw new Error(`manifest.json config for "${appSlug}" must be an object`)
  }
  if (manifest.agent !== undefined && manifest.agent !== null) {
    if (!isPlainObject(manifest.agent)) {
      throw new Error(`manifest.json agent for "${appSlug}" must be an object`)
    }
    if (manifest.agent.skill_prefix !== undefined && !AGENT_SKILL_PREFIX_RE.test(manifest.agent.skill_prefix)) {
      throw new Error(`manifest.json agent.skill_prefix for "${appSlug}" must match ${AGENT_SKILL_PREFIX_RE}`)
    }
  }
  if (manifest.owned_types !== undefined) {
    if (!Array.isArray(manifest.owned_types) || manifest.owned_types.some((s: any) => typeof s !== 'string' || !s.trim())) {
      throw new Error(`manifest.json owned_types for "${appSlug}" must be an array of non-empty strings`)
    }
  }
  if (manifest.registration !== undefined && manifest.registration !== null) {
    const reg = manifest.registration
    if (!isPlainObject(reg)) {
      throw new Error(`manifest.json registration for "${appSlug}" must be an object`)
    }
    if (reg.enabled !== undefined && typeof reg.enabled !== 'boolean') {
      throw new Error(`manifest.json registration.enabled for "${appSlug}" must be a boolean`)
    }
    if (reg.enabled === true) {
      if (typeof reg.default_role !== 'string' || !reg.default_role.trim()) {
        throw new Error(`manifest.json registration.default_role for "${appSlug}" must be a non-empty string when registration is enabled`)
      }
      if (typeof reg.redirect_path !== 'string' || !reg.redirect_path.trim()) {
        throw new Error(`manifest.json registration.redirect_path for "${appSlug}" must be a non-empty string when registration is enabled`)
      }
    }
    loadSpineConfig(configPath)
  }
  return manifest
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:preflightappinputs:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:validatepermissionspatchrow:function" type="function" identity="validatePermissionsPatchRow" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Validate a type_permissions patch seed row before any DB work"]
// CIL[DOC-RESPONSIBILITY responsibility="Require nonempty string kind and slug plus a record_permissions map whose values are arrays of CRUD action strings"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="record: Record<string,any>, file: string" outputs="void" errors="Throws on missing/blank kind or slug, a non-object record_permissions, or grants that are not arrays of create/read/update/delete" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Checks kind and slug as nonempty trimmed strings, record_permissions as a plain object, and every grant list as an array whose members are within the CRUD action set" notable_decisions="empty maps and empty grant arrays remain valid explicit no-grant declarations"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function validatePermissionsPatchRow(record: Record<string, any>, file: string): void {
  const crudActions = new Set(['create', 'read', 'update', 'delete'])
  const { kind, slug, record_permissions: perms } = record
  if (typeof kind !== 'string' || !kind.trim() || typeof slug !== 'string' || !slug.trim()) {
    throw new Error(`Malformed permissions patch entry in ${file} (requires kind, slug, record_permissions)`)
  }
  if (!isPlainObject(perms)) {
    throw new Error(`Malformed permissions patch entry in ${file} (record_permissions must be an object)`)
  }
  for (const [role, actions] of Object.entries(perms)) {
    if (!Array.isArray(actions) || actions.some(a => !crudActions.has(a))) {
      throw new Error(`Malformed permissions patch entry in ${file} (record_permissions.${role} must be an array of create/read/update/delete)`)
    }
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:validatepermissionspatchrow:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:seed_table_order:constant" type="constant" identity="SEED_TABLE_ORDER" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Declare the deterministic dependency order for manifest seed tables"]
// CIL[DOC-RESPONSIBILITY responsibility="Rank known seed tables so dependent rows are written after the rows they reference"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ordered table name list" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="roles before types before link_types before actions before ai_agents before prompt_configs before pipelines before triggers" notable_decisions="permissions_patch entries rank just after types via seedTableRank; unknown tables sort after the known set while keeping declared relative order"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const SEED_TABLE_ORDER: readonly string[] = [
  'roles', 'types', 'link_types', 'actions',
  'ai_agents', 'prompt_configs', 'pipelines', 'triggers',
]
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:seed_table_order:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:seedtablerank:function" type="function" identity="seedTableRank" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Map a seed entry to its deterministic apply-order rank"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the SEED_TABLE_ORDER index for the entry's table, 1.5 for permissions_patch entries, or past-the-end for unknown tables"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="entry: { table: string; permissions_patch?: boolean }" outputs="number rank" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="permissions_patch always ranks between types and link_types so it still runs after every types seed regardless of declaration order; stable sort keeps equal ranks in declared order" notable_decisions="fractional rank keeps the patch slot expressible without renumbering the known-table list"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function seedTableRank(entry: { table: string; permissions_patch?: boolean }): number {
  if (entry.permissions_patch) return 1.5
  const idx = SEED_TABLE_ORDER.indexOf(entry.table)
  return idx === -1 ? SEED_TABLE_ORDER.length : idx
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:seedtablerank:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:canonicaljson:function" type="function" identity="canonicalJson" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Serialize JSON with recursively sorted object keys for order-insensitive comparison"]
// CIL[DOC-RESPONSIBILITY responsibility="Produce a canonical string form so jsonb key order never counts as a schema difference"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="value: any" outputs="canonical JSON string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sort object keys recursively, serialize arrays in order, and skip undefined-valued keys the way JSON.stringify does" notable_decisions="undefined serializes as null so a missing design_schema compares equal to a NULL column"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function canonicalJson(value: any): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value).filter(k => value[k] !== undefined).sort()
    return `{${keys.map(k => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:canonicaljson:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:designschemadifflines:function" type="function" identity="designSchemaDiffLines" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Describe a field-level diff between a stored and a seeded design_schema"]
// CIL[DOC-RESPONSIBILITY responsibility="List added, changed, and DB-only field names plus record_permissions and functionality changes"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/install-app.ts,.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-CONTRACT inputs="dbSchema: any, seedSchema: any" outputs="string[] of human-readable diff lines" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compare the fields maps key-by-key with canonicalJson, then flag record_permissions and functionality changes; DB-only fields are noted as preserved because the owned-type merge keeps them" notable_decisions="views and other top-level keys are not itemized — the diff stays semantic rather than a raw JSON dump"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function designSchemaDiffLines(dbSchema: any, seedSchema: any): string[] {
  const lines: string[] = []
  const dbFields = isPlainObject(dbSchema?.fields) ? dbSchema.fields : {}
  const seedFields = isPlainObject(seedSchema?.fields) ? seedSchema.fields : {}
  for (const name of Object.keys(seedFields)) {
    if (!(name in dbFields)) lines.push(`+ field "${name}" (added by seed)`)
    else if (canonicalJson(dbFields[name]) !== canonicalJson(seedFields[name])) lines.push(`~ field "${name}" (changed)`)
  }
  for (const name of Object.keys(dbFields)) {
    if (!(name in seedFields)) lines.push(`- field "${name}" (DB-only — preserved)`)
  }
  for (const key of ['record_permissions', 'functionality']) {
    if (canonicalJson(dbSchema?.[key] ?? null) !== canonicalJson(seedSchema?.[key] ?? null)) {
      lines.push(`~ ${key} changed`)
    }
  }
  return lines
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:designschemadifflines:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:recipient_regexes:block" type="block" identity="recipient_regexes" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Mirror the recipient shapes _shared/notify.ts resolveNotificationRecipients accepts"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the person-UUID and role:<slug> patterns used by send_notification stage validation"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/functions/_shared/notify.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="regex constants" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="NOTIFICATION_UUID_RE matches a person UUID; NOTIFICATION_ROLE_RE captures the slug from role:<slug>; the literal 'self' is also accepted" notable_decisions="kept in sync with notify.ts — anything else must fail install rather than warn-skip at send time"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
const NOTIFICATION_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NOTIFICATION_ROLE_RE = /^role:(.+)$/
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:recipient_regexes:block"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:validatepipelineseedstages:function" type="function" identity="validatePipelineSeedStages" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Validate a pipelines seed record's stages against actions and notification recipients against roles"]
// CIL[DOC-RESPONSIBILITY responsibility="Require every stages[] stage_type to resolve to a public.actions slug, and every send_notification config.recipients entry to be 'role:<existing slug>', 'self', or a person UUID"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/functions/_shared/pipeline-runner.ts,.framework/functions/_shared/notify.ts,.framework/migrations/053_builtin_action_seeds.sql"]
// CIL[DOC-CONTRACT inputs="record: Record<string,any>, file: string, getActionSlugs/getRoleSlugs: lazy slug-set fetchers" outputs="Promise<void>" errors="Throws naming the pipeline slug, stage index, and offending stage_type or recipient" side_effects="May fetch public.actions or public.roles slug sets once per run via the provided fetchers"]
// CIL[DOC-MICRO logic_summary="Return early when stages is absent, throw on a non-array stages, then check each stage_type against the actions set and each send_notification recipient against role/self/UUID shapes with role existence verified through getRoleSlugs" notable_decisions="actions and roles are fetched lazily so apps without pipelines never pay the lookups; a missing action slug means migration 053/054 has not run"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
async function validatePipelineSeedStages(
  record: Record<string, any>,
  file: string,
  getActionSlugs: () => Promise<Set<string>>,
  getRoleSlugs: () => Promise<Set<string>>,
): Promise<void> {
  const stages = record.stages
  if (stages === undefined || stages === null) return
  const label = record.slug ?? record.name ?? '(unnamed)'
  if (!Array.isArray(stages)) {
    throw new Error(`pipelines "${label}" (${file}): stages must be an array`)
  }
  if (stages.length === 0) return

  const actionSlugs = await getActionSlugs()
  let roleSlugs: Set<string> | null = null
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    const stageType = stage?.stage_type
    if (typeof stageType !== 'string' || !actionSlugs.has(stageType)) {
      throw new Error(
        `pipelines "${label}" (${file}) stage ${i}: unknown stage_type ${JSON.stringify(stageType)} — ` +
        `no matching row in public.actions (migrations 053/054 seed the built-ins; run migrations first)`
      )
    }

    if (stageType !== 'send_notification' && stageType !== 'send_email') continue
    const recipients = stage.config?.recipients
    if (!Array.isArray(recipients)) {
      throw new Error(`pipelines "${label}" (${file}) stage ${i} (${stageType}): config.recipients must be an array`)
    }
    for (const recipient of recipients) {
      const roleMatch = typeof recipient === 'string' ? recipient.match(NOTIFICATION_ROLE_RE) : null
      if (roleMatch) {
        roleSlugs ??= await getRoleSlugs()
        if (!roleSlugs.has(roleMatch[1])) {
          throw new Error(`pipelines "${label}" (${file}) stage ${i} (${stageType}): recipient "${recipient}" references a role that does not exist`)
        }
        continue
      }
      if (
        recipient === 'self' || recipient === 'owner' || recipient === 'watchers' ||
        (typeof recipient === 'string' && NOTIFICATION_UUID_RE.test(recipient)) ||
        (stageType === 'send_email' && typeof recipient === 'string' && recipient.includes('@'))
      ) continue
      throw new Error(
        `pipelines "${label}" (${file}) stage ${i} (${stageType}): invalid recipient ${JSON.stringify(recipient)} — ` +
        `expected 'role:<slug>', 'self', 'owner', 'watchers', a person UUID${stageType === 'send_email' ? ', or an email address' : ''}`
      )
    }
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:validatepipelineseedstages:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:reconcileownedtype:function" type="function" identity="reconcileOwnedType" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Interactively reconcile a manifest-owned type whose DB design_schema differs from the seed"]
// CIL[DOC-RESPONSIBILITY responsibility="Print the field-level diff, prompt [U]pdate / [K]eep, and on update write the merged design_schema with a regenerated validation_schema"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-CONTRACT inputs="db: any, existingType: Record<string,any>, record: Record<string,any>" outputs="Promise<void>" errors="Throws on the types update failing" side_effects="Prompts on stdin; may update the types row"]
// CIL[DOC-MICRO logic_summary="Show designSchemaDiffLines output, then merge as {...dbSchema, ...seedSchema, fields: {...dbFields, ...seedFields}} so DB-only fields survive while the seed wins shared fields and all other keys" notable_decisions="only reachable for slugs declared in manifest.owned_types under --reconcile-owned-types; 'keep' leaves the DB row untouched"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
async function reconcileOwnedType(db: any, existingType: Record<string, any>, record: Record<string, any>): Promise<void> {
  const { kind, slug } = record
  const dbSchema = isPlainObject(existingType.design_schema) ? existingType.design_schema : {}
  const seedSchema = isPlainObject(record.design_schema) ? record.design_schema : {}
  const dbFields = isPlainObject(dbSchema.fields) ? dbSchema.fields : {}
  const seedFields = isPlainObject(seedSchema.fields) ? seedSchema.fields : {}

  console.log(`\n    Owned type ${kind}/${slug} differs from the seed:`)
  for (const line of designSchemaDiffLines(dbSchema, seedSchema)) {
    console.log(`    ${line}`)
  }

  const choice = await prompt('    Apply seed schema? [U]pdate / [K]eep  → ')
  if (choice.trim().toLowerCase() !== 'u') {
    console.log(`    ○ Kept existing ${kind}/${slug}`)
    return
  }

  // DB-only fields survive; the seed wins shared fields and every other key.
  const mergedSchema = {
    ...dbSchema,
    ...seedSchema,
    fields: { ...dbFields, ...seedFields },
  }
  const { error } = await db
    .from('types')
    .update({
      design_schema: mergedSchema,
      validation_schema: generateValidationSchema(mergedSchema),
    })
    .eq('id', existingType.id)
  if (error) {
    throw new Error(`Could not reconcile type ${kind}/${slug}: ${error.message}`)
  }
  console.log(`    ✓ ${kind}/${slug} reconciled to seed schema`)
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:reconcileownedtype:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:approwpayload:function" type="function" identity="appRowPayload" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Build the apps-table upsert payload shared by seedApp and update-db-app"]
// CIL[DOC-RESPONSIBILITY responsibility="Merge the existing apps.config with manifest.config so unrelated keys survive, and emit the fixed manifest-derived column set"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="manifest: Record<string,any>, appSlug: string, existingConfig?: Record<string,any>" outputs="apps upsert payload object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spread existingConfig then manifest.config when either is present, leaving config undefined when both are absent; all other payload keys derive from the manifest with the same defaults as before" notable_decisions="config is omitted entirely when neither side declares one so upserts never erase existing config"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function appRowPayload(manifest: Record<string, any>, appSlug: string, existingConfig?: Record<string, any>) {
  const manifestConfig = manifest.config ?? undefined
  const mergedConfig = manifestConfig !== undefined || existingConfig !== undefined
    ? { ...(existingConfig ?? {}), ...(manifestConfig ?? {}) }
    : undefined
  return {
    slug: appSlug,
    name: manifest.name ?? appSlug,
    description: manifest.description ?? '',
    version: manifest.version ?? '1.0.0',
    nav_items: manifest.nav_items ?? [],
    app_type: 'custom',
    source: 'npm',
    is_active: true,
    route_prefix: manifest.route_prefix ?? ('/' + appSlug),
    renderer: manifest.renderer ?? 'custom',

    required_roles: manifest.required_roles ?? (manifest.min_role ? [manifest.min_role] : []),

    min_role: manifest.required_roles?.[0] ?? manifest.min_role ?? null,
    preview_domain: manifest.preview_domain ?? null,
    prod_domain: manifest.prod_domain ?? null,
    prod_domains: manifest.prod_domains ?? null,
    preview_route_prefix: manifest.preview_route_prefix ?? null,
    prod_route_prefix: manifest.prod_route_prefix ?? null,
    config: mergedConfig,
    metadata: manifest.metadata ?? undefined,
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:approwpayload:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:registrationentry:function" type="function" identity="registrationEntry" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Compute the per-app registration policy entry shared by file and DB writes"]
// CIL[DOC-RESPONSIBILITY responsibility="Derive the roles/default_role/path/strategy/target/parent/workspace/domain-join entry from the manifest registration block"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files="spine.config.json"]
// CIL[DOC-CONTRACT inputs="regConfig: RegistrationConfig, requiredRoles: string[], previous?: Record<string,any>, fallbackPath?: string" outputs="per-app registration entry object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Roles come from requiredRoles when nonempty otherwise default_role; account_strategy defaults to 'new'; allow_domain_join is copied only when declared so other apps are never forced false; when enabled is not true the entry merges declared fields over the previous policy (mapping previous.path to redirect_path) with a neutral member/route_prefix fallback" notable_decisions="undefined optional fields serialize as absent keys; explicit enabled:false persists a disabled policy instead of skipping sync"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
function registrationEntry(
  regConfig: RegistrationConfig,
  requiredRoles: string[],
  previous?: Record<string, any>,
  fallbackPath: string = '/',
) {
  if (regConfig.enabled !== true) {
    const prev = previous ?? {}
    const defaultRole = regConfig.default_role ?? prev.default_role ?? 'member'
    const roles = requiredRoles.length
      ? requiredRoles
      : (Array.isArray(prev.roles) && prev.roles.length ? prev.roles : [defaultRole])
    return {
      roles,
      default_role: defaultRole,
      path: regConfig.redirect_path ?? prev.path ?? fallbackPath,
      enabled: regConfig.enabled ?? prev.enabled ?? false,
      account_strategy: regConfig.account_strategy ?? prev.account_strategy ?? 'new',
      target_account: regConfig.target_account ?? prev.target_account,
      parent_account: regConfig.parent_account ?? prev.parent_account,
      default_workspace_name: regConfig.default_workspace_name ?? prev.default_workspace_name,
      allow_domain_join: regConfig.allow_domain_join ?? prev.allow_domain_join,
    }
  }
  const availableRoles: string[] = requiredRoles.length ? requiredRoles : [regConfig.default_role]
  return {
    roles: availableRoles,
    default_role: regConfig.default_role,
    path: regConfig.redirect_path,
    enabled: regConfig.enabled,
    account_strategy: regConfig.account_strategy || 'new',
    target_account: regConfig.target_account,
    parent_account: regConfig.parent_account,
    default_workspace_name: regConfig.default_workspace_name,
    allow_domain_join: regConfig.allow_domain_join,
  }
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:registrationentry:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:syncappregistration:function" type="function" identity="syncAppRegistration" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Sync the resolved registration policy to apps.config.registration and spine.config.json"]
// CIL[DOC-RESPONSIBILITY responsibility="Write the server-side registration block onto the app row config (merged with existing keys), then persist the same policy to the local config file"]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files="spine.config.json"]
// CIL[DOC-CONTRACT inputs="db: any, appSlug: string, manifest: Record<string,any>, configPath?: string" outputs="Promise<void>" errors="Throws on config read or update failure, malformed existing apps.config, and malformed local config; no-ops only when the manifest has no registration block" side_effects="Reads and updates apps.config; writes spine.config.json; logs to stdout"]
// CIL[DOC-MICRO logic_summary="Compute ONE canonical registration entry — merging declared fields over {...local previous, ...server previous} with server winning when enabled is not true — merge it into the existing apps.config via select(config).eq(slug).maybeSingle then update, and only after the DB write succeeds pass the same resolved entry to updateRegistrationConfig for the local file" notable_decisions="explicit enabled:false persists an identical disabled policy on both sides even when prior server/local policies diverged; server policy mirrors what complete-registration resolves so flows need not trust client-supplied values; local file save intentionally follows the DB write"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework contributors"]
async function syncAppRegistration(db: any, appSlug: string, manifest: Record<string, any>, configPath: string = SPINE_CONFIG_PATH): Promise<void> {
  const regConfig = manifest.registration as RegistrationConfig | undefined
  if (regConfig === undefined || regConfig === null) return

  const requiredRoles: string[] = manifest.required_roles ?? []
  const fallbackPath: string = manifest.route_prefix ?? '/'

  const localPrevious = (() => {
    const prev = loadSpineConfig(configPath).registration?.apps?.[appSlug]
    return isPlainObject(prev) ? prev : undefined
  })()

  // Mirror the resolved registration policy onto apps.config.registration
  // so server-side flows (e.g. complete-registration) can derive
  // strategy/role/target/parent without trusting client-supplied values.
  const { data: existing, error: readErr } = await db
    .from('apps')
    .select('config')
    .eq('slug', appSlug)
    .maybeSingle()
  if (readErr) {
    throw new Error(`Could not read apps.config for ${appSlug}: ${readErr.message}`)
  }

  const existingConfig = existing?.config ?? {}
  if (!isPlainObject(existingConfig)) {
    throw new Error(`apps.config for ${appSlug} is not an object — cannot merge registration policy`)
  }
  const serverPrevious = isPlainObject(existingConfig.registration) ? existingConfig.registration : undefined
  const previous = localPrevious || serverPrevious
    ? { ...(localPrevious ?? {}), ...(serverPrevious ?? {}) }
    : undefined
  const regEntry = registrationEntry(regConfig, requiredRoles, previous, fallbackPath)

  const { error: cfgErr } = await db
    .from('apps')
    .update({ config: { ...existingConfig, registration: regEntry } })
    .eq('slug', appSlug)
  if (cfgErr) {
    throw new Error(`Could not persist registration config to apps.config: ${cfgErr.message}`)
  }

  updateRegistrationConfig(appSlug, regConfig, requiredRoles, configPath, fallbackPath, regEntry)
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:syncappregistration:function"]

// CIL[DOC-MACRO purpose="Prompts the user with a question and returns their input as a promise."]
// CIL[DOC-RESPONSIBILITY responsibility="Prompts the user with a question and returns their input as a promise. This function is used to facilitate interactive command-line interfaces."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="question: string (required) — The question to prompt the user with." outputs="Promise<string> — A promise that resolves to the user's input as a string." errors="none" side_effects="none dependencies="readline.createInterface"]
// CIL[DOC-MICRO logic_summary="Prompts the user with a question and returns their input as a promise. This function is used to facilitate interactive command-line interfaces." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Prompts the user with a question and returns their input as a promise. This function is used to facilitate interactive command-line interfaces.
 *
 * @inputSpec
 *   question: string (required) — The question to prompt the user with.
 * @outputSpec  Promise<string> — A promise that resolves to the user's input as a string.
 * @sideEffects none
 * @stability   stable
 * @calls       readline.createInterface
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:prompt:function" type="function" identity="prompt" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="prompt function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the prompt function."]
// CIL[DOC-CONTEXT module=".framework/cli/commands/install-app.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the prompt function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:prompt:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Prompts the user with a question and returns their input as a promise.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Loads the Spine configuration from a specified file path, returning a default structure if the file does not exist or is invalid."]
// CIL[DOC-RESPONSIBILITY responsibility="Loads the Spine configuration from a specified file path, returning a default structure if the file does not exist or is invalid. This function ensures that the application has a valid configuration to work with."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="none" outputs="SpineConfig — an object representing the Spine configuration structure." errors="none" side_effects="none dependencies="existsSync, readFileSync, JSON.parse"]
// CIL[DOC-MICRO logic_summary="Loads the Spine configuration from the given path (default SPINE_CONFIG_PATH), returning a neutral structure only when the file is absent." notable_decisions="malformed JSON propagates a parse error instead of silently resetting the config; non-object roots and non-object registration or registration.apps values throw a config-shape error."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Loads the Spine configuration from a specified file path, returning a default structure if the file does not exist or is invalid. This function ensures that the application has a valid configuration to work with.
 *
 * @outputSpec  SpineConfig — an object representing the Spine configuration structure.
 * @sideEffects none
 * @stability   stable
 * @calls       existsSync, readFileSync, JSON.parse
 * @errorHandling returns a default configuration on JSON parsing failure.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:loadspineconfig:function" type="function" identity="loadSpineConfig" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Read a caller-selected Spine configuration, returning a neutral object only when the file is absent."]
// CIL[DOC-RESPONSIBILITY responsibility="Read a caller-selected Spine configuration, returning a neutral object only when the file is absent."]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files="spine.config.json"]
// CIL[DOC-CONTRACT inputs="configPath: string defaults to SPINE_CONFIG_PATH" outputs="SpineConfig" errors="Throws for JSON syntax or root/registration/apps container shape errors." side_effects="Reads a config file and parses JSON."]
// CIL[DOC-MICRO logic_summary="Read a caller-selected Spine configuration, returning a neutral object only when the file is absent." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function loadSpineConfig(configPath: string = SPINE_CONFIG_PATH): SpineConfig {
  if (!existsSync(configPath)) {
    return { registration: { apps: {} } }
  }
  const parsed = JSON.parse(readFileSync(configPath, 'utf8'))
  if (!isPlainObject(parsed)) {
    throw new Error(`Invalid spine.config.json at ${configPath}: root must be a JSON object`)
  }
  if (parsed.registration !== undefined && !isPlainObject(parsed.registration)) {
    throw new Error(`Invalid spine.config.json at ${configPath}: registration must be an object`)
  }
  if (parsed.registration?.apps !== undefined && !isPlainObject(parsed.registration.apps)) {
    throw new Error(`Invalid spine.config.json at ${configPath}: registration.apps must be an object`)
  }
  return parsed
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:loadspineconfig:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Loads the Spine configuration from a specified file path, returning a default structure if the file does not exist or is invalid.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Saves the provided Spine configuration to a specified file path in JSON format."]
// CIL[DOC-RESPONSIBILITY responsibility="Saves the provided Spine configuration to a specified file path in JSON format. This function ensures that the configuration is persistently stored for future use."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="config: SpineConfig (required) — the configuration object to be saved." outputs="void" errors="none" side_effects="Writes the configuration to a file at SPINE_CONFIG_PATH. dependencies="writeFileSync"]
// CIL[DOC-MICRO logic_summary="Saves the provided Spine configuration to a specified file path in JSON format. This function ensures that the configuration is persistently stored for future use." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Saves the provided Spine configuration to a specified file path in JSON format. This function ensures that the configuration is persistently stored for future use.
 *
 * @inputSpec
 *   config: SpineConfig (required) — the configuration object to be saved.
 * @outputSpec  void
 * @sideEffects Writes the configuration to a file at SPINE_CONFIG_PATH.
 * @stability   stable
 * @calls       writeFileSync
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:savespineconfig:function" type="function" identity="saveSpineConfig" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Serialize a Spine configuration to its selected file."]
// CIL[DOC-RESPONSIBILITY responsibility="Serialize a Spine configuration to its selected file."]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files="spine.config.json"]
// CIL[DOC-CONTRACT inputs="config: SpineConfig, configPath: string defaults to SPINE_CONFIG_PATH" outputs="void" errors="Propagates file write errors." side_effects="Writes the config file."]
// CIL[DOC-MICRO logic_summary="Serialize a Spine configuration to its selected file." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function saveSpineConfig(config: SpineConfig, configPath: string = SPINE_CONFIG_PATH): void {
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:savespineconfig:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Saves the provided Spine configuration to a specified file path in JSON format.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Updates the registration configuration for a specific application in the spine configuration file."]
// CIL[DOC-RESPONSIBILITY responsibility="Updates the registration configuration for a specific application in the spine configuration file. This function ensures that the application registration is properly set up with roles and other relevant settings."]
// CIL[DOC-CONTEXT module="install-app" layer="app-specific" related_files=".framework/cli/commands/migrate.js"]
// CIL[DOC-CONTRACT inputs="appSlug: string (required) — the unique identifier for the application.\\nregConfig: RegistrationConfig (required) — configuration settings for the registration.\\nrequiredRoles: string[] (optional) — an array of roles required for the application." outputs="void" errors="none" side_effects="Writes to the spine configuration file and logs updates to the console. dependencies="loadSpineConfig, saveSpineConfig"]
// CIL[DOC-MICRO logic_summary="Updates the registration configuration for a specific application in the spine configuration file. This function ensures that the application registration is properly set up with roles and other relevant settings." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Updates the registration configuration for a specific application in the spine configuration file. This function ensures that the application registration is properly set up with roles and other relevant settings.
 *
 * @inputSpec
 *   appSlug: string (required) — the unique identifier for the application.
 *   regConfig: RegistrationConfig (required) — configuration settings for the registration.
 *   requiredRoles: string[] (optional) — an array of roles required for the application.
 * @outputSpec  void
 * @sideEffects Writes to the spine configuration file and logs updates to the console.
 * @stability   stable
 * @calls       loadSpineConfig, saveSpineConfig
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/cli/commands/install-app.ts:updateregistrationconfig:function" type="function" identity="updateRegistrationConfig" parent="~/.framework/cli/commands/install-app.ts"]
// CIL[DOC-MACRO purpose="Merge a computed or declared per-app policy into local config while preserving explicit defaults and other apps."]
// CIL[DOC-RESPONSIBILITY responsibility="Merge a computed or declared per-app policy into local config while preserving explicit defaults and other apps."]
// CIL[DOC-CONTEXT module="install-app" layer="cli" related_files="spine.config.json"]
// CIL[DOC-CONTRACT inputs="appSlug: string, regConfig: RegistrationConfig, requiredRoles: string[] default empty, configPath: string defaults to SPINE_CONFIG_PATH, fallbackPath: string default slash, resolvedEntry?: Record<string, any>" outputs="void" errors="Propagates config read/shape and file write errors." side_effects="Reads and writes local config; logs results."]
// CIL[DOC-MICRO logic_summary="Merge a computed or declared per-app policy into local config while preserving explicit defaults and other apps." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function updateRegistrationConfig(appSlug: string, regConfig: RegistrationConfig, requiredRoles: string[] = [], configPath: string = SPINE_CONFIG_PATH, fallbackPath: string = '/', resolvedEntry?: Record<string, any>): void {
  const config = loadSpineConfig(configPath)

  
  if (!config.registration) {
    config.registration = { apps: {} }
  }
  if (!config.registration.apps) {
    config.registration.apps = {}
  }

  
  const previous = isPlainObject(config.registration.apps[appSlug]) ? config.registration.apps[appSlug] : undefined
  const entry = resolvedEntry ?? registrationEntry(regConfig, requiredRoles, previous, fallbackPath)

  
  config.registration.apps[appSlug] = entry

  
  if (entry.enabled === true && !config.registration.default_app) {
    config.registration.default_app = appSlug
    config.registration.default_role = regConfig.default_role
  }

  
  if (config.registration.allow_url_override === undefined) {
    config.registration.allow_url_override = true
  }

  saveSpineConfig(config, configPath)
  console.log(`  ✓ Updated spine.config.json registration for ${appSlug}`)
  console.log(`  ✓ Available roles: ${entry.roles.join(', ')}`)
}
// CIL[END stable_id="~/.framework/cli/commands/install-app.ts:updateregistrationconfig:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Updates the registration configuration for a specific application in the spine configuration file.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
