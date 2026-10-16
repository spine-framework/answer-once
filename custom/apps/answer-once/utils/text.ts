// CIL[BEGIN stable_id="~/custom/apps/answer-once/utils/text.ts:decodeEntities:function" type="function" identity="decodeEntities" parent="~/custom/apps/answer-once/utils/text.ts"]
// text/textarea fields written before the encoder fix (or on installs without
// it) may carry stored HTML entities — decode for plain-text display. Order
// matters: &amp; decodes last so a literal "&lt;" in the data isn't unescaped.
export const decodeEntities = (s: string) =>
  s.replace(/&#x27;|&#39;/g, "'")
   .replace(/&quot;/g, '"')
   .replace(/&lt;/g, '<')
   .replace(/&gt;/g, '>')
   .replace(/&amp;/g, '&')
// CIL[END stable_id="~/custom/apps/answer-once/utils/text.ts:decodeEntities:function"]
