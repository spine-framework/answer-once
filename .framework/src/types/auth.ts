// CIL[BEGIN stable_id="~/.framework/src/types/auth.ts:User:interface" type="interface" identity="User" parent="~/.framework/src/types/auth.ts"]
// CIL[DOC-MACRO purpose="Define the User shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the User type contract"]
// CIL[DOC-CONTEXT module=".framework/src/types/auth.ts" layer="types" related_files=".framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="User interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the User interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]








export interface User {
  id: string
  email: string
  full_name: string
  account_id: string
  account?: Account
  roles: string[] 
  permissions: string[] 
  is_system_admin?: boolean
  
  status?: string
  accessible_accounts?: Account[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the User shape'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/auth.ts:User:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/auth.ts:Account:interface" type="interface" identity="Account" parent="~/.framework/src/types/auth.ts"]
// CIL[DOC-MACRO purpose="Define the Account shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the Account type contract"]
// CIL[DOC-CONTEXT module=".framework/src/types/auth.ts" layer="types" related_files=".framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Account interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the Account interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface Account {
  id: string
  slug: string
  display_name: string
  name?: string
  account_type?: string
  owner_account_id?: string
  metadata?: Record<string, any>
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the Account shape'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/auth.ts:Account:interface"]






// CIL[BEGIN stable_id="~/.framework/src/types/auth.ts:Role:interface" type="interface" identity="Role" parent="~/.framework/src/types/auth.ts"]
// CIL[DOC-MACRO purpose="Define the Role shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the Role type contract"]
// CIL[DOC-CONTEXT module=".framework/src/types/auth.ts" layer="types" related_files=".framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Role interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the Role interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface Role {
  id: string
  slug: string
  name: string
  description?: string
  permissions: Permission[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the Role shape'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/auth.ts:Role:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/auth.ts:Permission:interface" type="interface" identity="Permission" parent="~/.framework/src/types/auth.ts"]
// CIL[DOC-MACRO purpose="Define the Permission shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the Permission type contract"]
// CIL[DOC-CONTEXT module=".framework/src/types/auth.ts" layer="types" related_files=".framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Permission interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the Permission interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface Permission {
  id: string
  resource: string
  action: string
  scope?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the Permission shape'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/auth.ts:Permission:interface"]






// CIL[BEGIN stable_id="~/.framework/src/types/auth.ts:AuthResponse:interface" type="interface" identity="AuthResponse" parent="~/.framework/src/types/auth.ts"]
// CIL[DOC-MACRO purpose="Define the AuthResponse shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the AuthResponse type contract"]
// CIL[DOC-CONTEXT module=".framework/src/types/auth.ts" layer="types" related_files=".framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AuthResponse interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the AuthResponse interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the AuthResponse shape'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/auth.ts:AuthResponse:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/auth.ts:LoginCredentials:interface" type="interface" identity="LoginCredentials" parent="~/.framework/src/types/auth.ts"]
// CIL[DOC-MACRO purpose="Define the LoginCredentials shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the LoginCredentials type contract"]
// CIL[DOC-CONTEXT module=".framework/src/types/auth.ts" layer="types" related_files=".framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="LoginCredentials interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the LoginCredentials interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface LoginCredentials {
  email: string
  password: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the LoginCredentials shape'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/auth.ts:LoginCredentials:interface"]




// CIL[BEGIN stable_id="~/.framework/src/types/auth.ts:RegisterData:interface" type="interface" identity="RegisterData" parent="~/.framework/src/types/auth.ts"]
// CIL[DOC-MACRO purpose="Define the RegisterData shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the RegisterData type contract"]
// CIL[DOC-CONTEXT module=".framework/src/types/auth.ts" layer="types" related_files=".framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="RegisterData interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the RegisterData interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface RegisterData {
  email: string
  password: string
  full_name: string
  account_name?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the RegisterData shape'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/types/auth.ts:RegisterData:interface"]