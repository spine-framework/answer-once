// text/textarea fields written before the encoder fix (or on installs without
// it) may carry stored HTML entities — decode for plain-text display. Order
// matters: &amp; decodes last so a literal "&lt;" in the data isn't unescaped.
export const decodeEntities = (s: string) =>
  s.replace(/&#x27;|&#39;/g, "'")
   .replace(/&quot;/g, '"')
   .replace(/&lt;/g, '<')
   .replace(/&gt;/g, '>')
   .replace(/&amp;/g, '&')
