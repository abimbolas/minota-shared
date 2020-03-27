const yaml = require('js-yaml');
const os = require('os');

// According to YAML spec, '---' divide parts of document (config, content),
// and '...' divide whole documents (notes).
//
// We expect document to consist of 2 parts - config and content.
// Config or content might be empty.
// Ignore '---' if it is part of the content.

function parseNotes(text, notesConfig = {}) {
  let lastTopic = notesConfig.topic;
  return text.trim()
    .split(/^\.\.\.\s*$/gm)
    .map(part => part.trim())
    .filter(part => part)
    .map((raw) => {
      let content, config
      let parts = raw.split(/^---[\t\v\f ]*$/gm);
      // If no '---', it is just content
      if (parts.length === 1 && parts[0] === raw) {
        content = parts[0]
        config = {}
      }
      // If just one '---' was present, that means it is only one start of
      // document, so treat as content.
      else if (parts.length === 2) {
        content = parts[1].replace(new RegExp('^' + os.EOL), '')
        config = {}
      }
      // Only if two or more '---' present, it is full note,
      // and all other '---' after first two is considered a part of document content
      else {
        content = parts.slice(2).join('---').replace(new RegExp('^' + os.EOL), '')
        config = yaml.safeLoad(parts[1].trim()) || {}
      }
      // Verify config
      if (config.topic) {
        lastTopic = config.topic;
      } else if (lastTopic) {
        config.topic = lastTopic;
      }
      return {
        config: Object.assign({}, notesConfig, config),
        content: content || '',
      };
    });
}

function stringifyNotes(notes) {
  return (Array.isArray(notes) ? notes : [notes]).map((note) => {
    const config = note.config ? `---\n${yaml.safeDump(note.config)}---\n` : '';
    const content = note.content || '';
    return `${config}${content}`;
  }).join('\n\n...\n');
}

module.exports = {
  parse: parseNotes,
  stringify: stringifyNotes,
};
